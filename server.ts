import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { incidentStore } from './server/incidentStore';
import { syntheticEngine } from './server/syntheticData';
import { agentPerformanceStore } from './server/agentPerformanceStore';
import { SimulationScenarioId } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // === API ROUTES ===

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      activeScenario: syntheticEngine.getActiveScenario(),
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    });
  });

  // Consolidated health metrics computed directly against authoritative incident and scorecard store
  const computeConsolidatedHealth = () => {
    const incidents = incidentStore.getIncidents();
    const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'VERIFIED');
    const rawHealth = syntheticEngine.computeHealthMetrics();

    const totalRisk = activeIncidents.reduce((sum, inc) => sum + (inc.revenueAtRisk || 0), 0);
    const totalRecoverable = activeIncidents.reduce((sum, inc) => sum + (inc.estimatedRecoverableRevenue || 0), 0);
    const totalRecovered = incidents.reduce((sum, inc) => sum + (inc.recoveredRevenue || 0), 0);
    const totalStillAtRisk = activeIncidents.reduce((sum, inc) => sum + (inc.revenueStillAtRisk || 0), 0);
    const totalAffectedTxns = activeIncidents.reduce((sum, inc) => sum + (inc.affectedTransactions || 0), 0);
    const totalEligibleTxns = activeIncidents.reduce((sum, inc) => sum + (inc.recoverableTransactions || 0), 0);
    const batchesCount = incidentStore.getRecoveryBatches().length;

    return {
      ...rawHealth,
      activeIncidentsCount: activeIncidents.length,
      criticalIncidentsCount: activeIncidents.filter(i => i.severity === 'critical').length,
      revenueAtRiskINR: totalRisk,
      estimatedRecoverableRevenueINR: totalRecoverable,
      recoveredRevenueINR: totalRecovered,
      revenueStillAtRiskINR: totalStillAtRisk,
      affectedTransactionsTotal: totalAffectedTxns,
      eligibleTransactionsTotal: totalEligibleTxns,
      recoveryBatchesCount: batchesCount,
      totalProtectedRevenueINR: totalRecovered,
      recoveryRate: totalRisk > 0 ? Number(((totalRecovered / totalRisk) * 100).toFixed(1)) : 0,
      transactionRecoveryRate: totalEligibleTxns > 0 ? Number(((incidents.reduce((s, i) => s + (i.scorecard?.recoveredTxns || 0), 0) / totalEligibleTxns) * 100).toFixed(1)) : 0,
    };
  };

  // 2. Overview dashboard aggregated payload
  app.get('/api/overview', (req, res) => {
    const incidents = incidentStore.getIncidents();
    const health = computeConsolidatedHealth();
    const agents = incidentStore.getAgents();
    const recentTransactions = syntheticEngine.getRecentTransactions(15);

    res.json({
      health,
      incidents: incidents.slice(0, 5),
      agents,
      recentTransactions,
      activeScenario: syntheticEngine.getActiveScenario(),
    });
  });

  // 3. Incidents list & filters
  app.get('/api/incidents', (req, res) => {
    const { severity, status, search } = req.query;
    let incidents = incidentStore.getIncidents();

    if (severity && typeof severity === 'string' && severity !== 'all') {
      incidents = incidents.filter(i => i.severity.toLowerCase() === severity.toLowerCase());
    }

    if (status && typeof status === 'string' && status !== 'all') {
      incidents = incidents.filter(i => i.status.toLowerCase() === status.toLowerCase());
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase();
      incidents = incidents.filter(i => 
        i.id.toLowerCase().includes(q) || 
        i.title.toLowerCase().includes(q) ||
        (i.investigation?.rootCause && i.investigation.rootCause.toLowerCase().includes(q))
      );
    }

    res.json({
      incidents,
      totalCount: incidents.length,
    });
  });

  // 4. Single incident details
  app.get('/api/incidents/:id', (req, res) => {
    const incident = incidentStore.getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(incident);
  });

  // 5. Trigger end-to-end incident demo simulation
  app.post('/api/incidents/run-demo', async (req, res) => {
    try {
      const scenario = (req.body.scenario as any) || 'hdfc_upi_degradation';
      const incident = await incidentStore.triggerIncidentWorkflow(scenario);
      res.json({
        success: true,
        incident,
        message: `Successfully executed Detection -> Investigation -> Resolution workflow for ${incident.id}`,
      });
    } catch (error: any) {
      console.error('Failed to run demo incident workflow:', error);
      res.status(500).json({ error: error.message || 'Workflow execution failed' });
    }
  });

  // 5b. Load deterministic scenario seed (SEED_A, SEED_B, SEED_C, SEED_D, SEED_E)
  app.post('/api/incidents/seed/:seedKey', (req, res) => {
    try {
      const seedKey = req.params.seedKey.toUpperCase() as any;
      if (!['SEED_A', 'SEED_B', 'SEED_C', 'SEED_D', 'SEED_E'].includes(seedKey)) {
        return res.status(400).json({ error: 'Invalid seed key. Must be SEED_A, SEED_B, SEED_C, SEED_D, or SEED_E.' });
      }
      const incident = incidentStore.seedScenario(seedKey);
      res.json({
        success: true,
        incident,
        message: `Successfully loaded deterministic scenario ${seedKey}: ${incident.title}`,
      });
    } catch (error: any) {
      console.error('Failed to load scenario seed:', error);
      res.status(500).json({ error: error.message || 'Failed to seed scenario' });
    }
  });

  // 6. Human approval endpoint
  app.post('/api/incidents/:id/approve', (req, res) => {
    const { approved, notes } = req.body;
    const updated = incidentStore.handleHumanApproval(req.params.id, Boolean(approved), notes);
    if (!updated) {
      return res.status(404).json({ error: 'Incident not found or cannot be approved' });
    }
    res.json({ success: true, incident: updated });
  });

  // 7. Execute mitigation in simulation
  app.post('/api/incidents/:id/execute-mitigation', (req, res) => {
    const updated = incidentStore.executeMitigation(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Incident not found or mitigation not ready' });
    }
    res.json({ success: true, incident: updated });
  });

  // 8. Verify recovery
  app.post('/api/incidents/:id/verify', (req, res) => {
    const updated = incidentStore.verifyRecovery(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Incident not found or cannot verify' });
    }
    res.json({ success: true, incident: updated });
  });

  // 8b. Rollback mitigation in simulation
  app.post('/api/incidents/:id/rollback', (req, res) => {
    const updated = incidentStore.rollbackMitigation(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Incident not found or cannot rollback' });
    }
    res.json({ success: true, incident: updated });
  });

  // 8c. Recovery Batches API
  app.get('/api/recovery-batches', (req, res) => {
    res.json({
      batches: incidentStore.getRecoveryBatches(),
      total: incidentStore.getRecoveryBatches().length
    });
  });

  app.get('/api/recovery-batches/:id', (req, res) => {
    const batch = incidentStore.getRecoveryBatchById(req.params.id);
    if (!batch) {
      return res.status(404).json({ error: 'Recovery batch not found' });
    }
    res.json(batch);
  });

  // 8d. Recovery Opportunities API
  app.get('/api/recovery-opportunities', (req, res) => {
    const opps = incidentStore.getRecoveryOpportunities();
    res.json({
      opportunities: opps,
      total: opps.length,
    });
  });

  app.get('/api/recovery-opportunities/:id', (req, res) => {
    const opp = incidentStore.getRecoveryOpportunityById(req.params.id);
    if (!opp) {
      return res.status(404).json({ error: 'Recovery opportunity not found' });
    }
    res.json(opp);
  });

  // 8e. Recovery Scorecard API (Authoritative Single Source of Truth)
  app.get('/api/recovery-scorecard', (req, res) => {
    const incidentId = req.query.incidentId as string | undefined;
    const scorecard = incidentStore.getAuthoritativeScorecard(incidentId);
    res.json(scorecard);
  });

  // 8f. Merchant Impact API
  app.get('/api/merchant-impact', (req, res) => {
    const items = syntheticEngine.getMerchantImpactSummary();
    res.json({
      merchants: items,
      total: items.length,
    });
  });

  // 8g. Incident Strategy Comparison API
  app.get('/api/incidents/:id/strategies', (req, res) => {
    const incident = incidentStore.getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    const strategies = incident.strategyExperiments || syntheticEngine.simulateStrategyComparison(req.params.id);
    res.json({
      incidentId: req.params.id,
      strategies,
    });
  });

  // 9. Global Search Across Incidents, Transactions, Merchants, and Audit Logs
  app.get('/api/search', (req, res) => {
    const q = ((req.query.q as string) || '').toLowerCase().trim();
    if (!q) {
      return res.json({
        incidents: [],
        transactions: [],
        merchants: [],
        auditEvents: [],
      });
    }

    const allIncidents = incidentStore.getIncidents();
    const matchedIncidents = allIncidents.filter(i => 
      i.id.toLowerCase().includes(q) ||
      i.title.toLowerCase().includes(q) ||
      i.severity.toLowerCase().includes(q) ||
      (i.investigation?.rootCause && i.investigation.rootCause.toLowerCase().includes(q))
    ).slice(0, 5);

    const allTxns = syntheticEngine.getAllTransactions();
    const matchedTxns = allTxns.filter(t => 
      t.transactionId.toLowerCase().includes(q) ||
      t.merchantName.toLowerCase().includes(q) ||
      t.bank.toLowerCase().includes(q) ||
      (t.errorCode && t.errorCode.toLowerCase().includes(q)) ||
      t.paymentMethod.toLowerCase().includes(q)
    ).slice(0, 6);

    const merchantMap = new Map<string, { id: string; name: string; tier: string; txCount: number }>();
    allTxns.forEach(t => {
      if (t.merchantName.toLowerCase().includes(q) || t.merchantId.toLowerCase().includes(q)) {
        if (!merchantMap.has(t.merchantId)) {
          merchantMap.set(t.merchantId, {
            id: t.merchantId,
            name: t.merchantName,
            tier: t.customerSegment,
            txCount: 1,
          });
        } else {
          merchantMap.get(t.merchantId)!.txCount += 1;
        }
      }
    });

    const allAudits = incidentStore.getAuditLogs();
    const matchedAudits = allAudits.filter(a => 
      a.action.toLowerCase().includes(q) ||
      a.agent.toLowerCase().includes(q) ||
      a.outputSummary.toLowerCase().includes(q)
    ).slice(0, 5);

    res.json({
      incidents: matchedIncidents,
      transactions: matchedTxns,
      merchants: Array.from(merchantMap.values()).slice(0, 5),
      auditEvents: matchedAudits,
    });
  });

  // 10. Transactions list with pagination & filters
  app.get('/api/transactions', (req, res) => {
    const { bank, method, status, search, limit = '50', offset = '0' } = req.query;
    let list = syntheticEngine.getAllTransactions();

    if (bank && typeof bank === 'string' && bank !== 'all') {
      list = list.filter(t => t.bank === bank);
    }
    if (method && typeof method === 'string' && method !== 'all') {
      list = list.filter(t => t.paymentMethod === method);
    }
    if (status && typeof status === 'string' && status !== 'all') {
      list = list.filter(t => t.status === status);
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase();
      list = list.filter(t => 
        t.transactionId.toLowerCase().includes(q) || 
        t.merchantName.toLowerCase().includes(q) ||
        (t.errorCode && t.errorCode.toLowerCase().includes(q))
      );
    }

    const total = list.length;
    const numLimit = parseInt(limit as string, 10) || 50;
    const numOffset = parseInt(offset as string, 10) || 0;
    const paginated = list.slice(numOffset, numOffset + numLimit);

    res.json({
      transactions: paginated,
      total,
      limit: numLimit,
      offset: numOffset,
    });
  });

  // 11. Generate single live transaction tick
  app.get('/api/transactions/live-tick', (req, res) => {
    const tx = syntheticEngine.generateSingleLiveTransaction();
    res.json({ transaction: tx });
  });

  // 12. Audit logs
  app.get('/api/audit-logs', (req, res) => {
    const logs = incidentStore.getAuditLogs();
    res.json({ logs });
  });

  // 13. Agent states
  app.get('/api/agents/status', (req, res) => {
    res.json({ agents: incidentStore.getAgents() });
  });

  // 13b. Agent Performance History & D3 Telemetry Metrics (V5 Evaluation Engine)
  app.get('/api/agents/performance', (req, res) => {
    const timeRange = (req.query.timeRange as '1h' | '6h' | '24h' | 'all') || '24h';
    const agentId = req.query.agentId as string | undefined;
    const metrics = agentPerformanceStore.getMetrics(timeRange, agentId);
    const summaries = agentPerformanceStore.getSummaries();
    res.json({
      metrics,
      summaries,
      timeRange,
      agentId: agentId || 'all',
      totalDataPoints: metrics.length,
    });
  });

  // 13c. Agent Benchmark Report (Deterministic Evaluation Engine)
  app.get('/api/agents/benchmark', (req, res) => {
    const report = agentPerformanceStore.getBenchmarkReport();
    res.json(report);
  });

  // 13d. Trigger on-demand deterministic benchmark evaluation run
  app.post('/api/agents/benchmark/run', (req, res) => {
    const freshReport = agentPerformanceStore.computeBenchmarkReport();
    res.json({
      success: true,
      report: freshReport,
      message: `Executed evaluation suite across ${freshReport.scenariosTested} synthetic test scenarios.`,
    });
  });

  // 14. Simulation controls: trigger scenario
  app.post('/api/simulation/scenario', (req, res) => {
    const { scenario } = req.body;
    if (scenario) {
      syntheticEngine.setScenario(scenario as SimulationScenarioId);
      syntheticEngine.generateBatchTransactions(30);
      res.json({
        success: true,
        scenario: syntheticEngine.getActiveScenario(),
        message: `Simulation scenario updated to ${scenario}`,
      });
    } else {
      res.status(400).json({ error: 'Scenario ID required' });
    }
  });

  // 15. Reset simulation to healthy normal
  app.post('/api/simulation/reset', (req, res) => {
    syntheticEngine.resetTransactionsToNominal();
    incidentStore.resetAll();
    res.json({
      success: true,
      message: 'Simulation reset to nominal healthy baseline (93%+ success rate).',
      health: computeConsolidatedHealth(),
      incidents: incidentStore.getIncidents(),
    });
  });

  // 16. Full Reset (Entire Store & Scenario)
  app.post('/api/simulation/full-reset', (req, res) => {
    syntheticEngine.resetTransactionsToNominal();
    incidentStore.resetAll();
    res.json({
      success: true,
      message: 'Full system and incident store reset to pristine deterministic demo baseline.',
      health: computeConsolidatedHealth(),
      incidents: incidentStore.getIncidents(),
    });
  });

  // === VITE MIDDLEWARE / SPA SERVING ===
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Razorpay AI Operations server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
