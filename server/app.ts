import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { incidentStore } from './incidentStore';
import { syntheticEngine } from './syntheticData';
import { agentPerformanceStore } from './agentPerformanceStore';
import { SimulationScenarioId } from '../src/types';

export const app = express();

// 1. Pre-parse body detection and path normalization MUST run before express.json()
// to prevent Vercel Serverless Function stream-consumption deadlocks.
app.use((req, res, next) => {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        req.body = JSON.parse(req.body);
      } catch {
        // Keep string if not valid JSON
      }
    } else if (Buffer.isBuffer(req.body)) {
      try {
        req.body = JSON.parse(req.body.toString('utf-8'));
      } catch {
        // Keep buffer if not valid JSON
      }
    }
    // Mark as parsed so express.json() / body-parser will safely skip reading the stream
    (req as any)._body = true;
  }

  // Path normalization for Vercel rewrites and proxy headers
  const endpoint = (req.query && (req.query.endpoint || req.query.path || req.query.all)) as string | string[] | undefined;
  const forwardedUri = (req.headers['x-forwarded-uri'] as string) || 
                       (req.headers['x-matched-path'] as string) || 
                       (req.headers['x-vercel-matched-path'] as string);

  if (endpoint) {
    const subpath = Array.isArray(endpoint) ? endpoint.join('/') : endpoint;
    const cleanSubpath = subpath.startsWith('/') ? subpath : '/' + subpath;
    if (req.query) {
      delete (req.query as any).endpoint;
      delete (req.query as any).path;
      delete (req.query as any).all;
    }
    const remainingKeys = Object.keys(req.query || {});
    if (remainingKeys.length > 0) {
      const sp = new URLSearchParams();
      for (const k of remainingKeys) {
        const val = (req.query as any)[k];
        if (Array.isArray(val)) {
          val.forEach(v => sp.append(k, String(v)));
        } else if (val !== undefined) {
          sp.append(k, String(val));
        }
      }
      req.url = `${cleanSubpath}?${sp.toString()}`;
    } else {
      req.url = cleanSubpath;
    }
  } else if (forwardedUri && (req.url === '/' || req.url === '/api' || req.url === '/api/')) {
    req.url = forwardedUri;
  }
  next();
});

// 2. Standard CORS & security headers for same-origin and preview execution
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// 3. Body parsers (safely skip if _body is already marked true above)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Consolidated health metrics computed directly against authoritative incident and scorecard store
export const computeConsolidatedHealth = () => {
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

const router = express.Router();

// 1. Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeScenario: syntheticEngine.getActiveScenario(),
    hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' && !process.env.GEMINI_API_KEY.startsWith('gen-lang-client')),
  });
});

// 2. Overview dashboard aggregated payload
router.get('/overview', (req, res) => {
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
router.get('/incidents', (req, res) => {
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
router.get('/incidents/:id', (req, res) => {
  const incident = incidentStore.getIncidentById(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json(incident);
});

// 5. Trigger end-to-end incident demo simulation
router.post('/incidents/run-demo', async (req, res) => {
  try {
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const scenario = body.scenario === 'icici_card_latency_spike' ? 'icici_card_latency_spike' :
                     body.scenario === 'sbi_netbanking_outage' ? 'sbi_netbanking_outage' : 'hdfc_upi_degradation';
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
router.post('/incidents/seed/:seedKey', (req, res) => {
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
router.post('/incidents/:id/approve', (req, res) => {
  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  const { approved, notes } = body;
  const updated = incidentStore.handleHumanApproval(req.params.id, Boolean(approved), notes);
  if (!updated) {
    return res.status(404).json({ error: 'Incident not found or cannot be approved' });
  }
  res.json({ success: true, incident: updated });
});

// 7. Execute mitigation in simulation
router.post('/incidents/:id/execute-mitigation', (req, res) => {
  const updated = incidentStore.executeMitigation(req.params.id);
  if (!updated) {
    return res.status(404).json({ error: 'Incident not found or mitigation not ready' });
  }
  res.json({ success: true, incident: updated });
});

// 8. Verify recovery
router.post('/incidents/:id/verify', (req, res) => {
  const updated = incidentStore.verifyRecovery(req.params.id);
  if (!updated) {
    return res.status(404).json({ error: 'Incident not found or cannot verify' });
  }
  res.json({ success: true, incident: updated });
});

// 8b. Rollback mitigation in simulation
router.post('/incidents/:id/rollback', (req, res) => {
  const updated = incidentStore.rollbackMitigation(req.params.id);
  if (!updated) {
    return res.status(404).json({ error: 'Incident not found or cannot rollback' });
  }
  res.json({ success: true, incident: updated });
});

// 8c. Recovery Batches API
router.get('/recovery-batches', (req, res) => {
  res.json({
    batches: incidentStore.getRecoveryBatches(),
    total: incidentStore.getRecoveryBatches().length
  });
});

router.get('/recovery-batches/:id', (req, res) => {
  const batch = incidentStore.getRecoveryBatchById(req.params.id);
  if (!batch) {
    return res.status(404).json({ error: 'Recovery batch not found' });
  }
  res.json(batch);
});

// 8d. Recovery Opportunities API
router.get('/recovery-opportunities', (req, res) => {
  const opps = incidentStore.getRecoveryOpportunities();
  res.json({
    opportunities: opps,
    total: opps.length,
  });
});

router.get('/recovery-opportunities/:id', (req, res) => {
  const opp = incidentStore.getRecoveryOpportunityById(req.params.id);
  if (!opp) {
    return res.status(404).json({ error: 'Recovery opportunity not found' });
  }
  res.json(opp);
});

// 8e. Recovery Scorecard API (Authoritative Single Source of Truth)
router.get('/recovery-scorecard', (req, res) => {
  const incidentId = req.query.incidentId as string | undefined;
  const scorecard = incidentStore.getAuthoritativeScorecard(incidentId);
  res.json(scorecard);
});

// 8f. Merchant Impact API
router.get('/merchant-impact', (req, res) => {
  const items = syntheticEngine.getMerchantImpactSummary();
  res.json({
    merchants: items,
    total: items.length,
  });
});

// 8g. Incident Strategy Comparison API
router.get('/incidents/:id/strategies', (req, res) => {
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
router.get('/search', (req, res) => {
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
router.get('/transactions', (req, res) => {
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
router.get('/transactions/live-tick', (req, res) => {
  const tx = syntheticEngine.generateSingleLiveTransaction();
  res.json({ transaction: tx });
});

// 12. Audit logs
router.get('/audit-logs', (req, res) => {
  const logs = incidentStore.getAuditLogs();
  res.json({ logs });
});

// 13. Agent states
router.get('/agents/status', (req, res) => {
  res.json({ agents: incidentStore.getAgents() });
});

// 13b. Agent Performance History & D3 Telemetry Metrics (V5 Evaluation Engine)
router.get('/agents/performance', (req, res) => {
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
router.get('/agents/benchmark', (req, res) => {
  const report = agentPerformanceStore.getBenchmarkReport();
  res.json(report);
});

// 13d. Trigger on-demand deterministic benchmark evaluation run
router.post('/agents/benchmark/run', (req, res) => {
  const freshReport = agentPerformanceStore.computeBenchmarkReport();
  res.json({
    success: true,
    report: freshReport,
    message: `Executed evaluation suite across ${freshReport.scenariosTested} synthetic test scenarios.`
  });
});

// 14. Simulation Scenario selection
router.post('/simulation/scenario', (req, res) => {
  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  const { scenario } = body;
  if (scenario) {
    syntheticEngine.setScenario(scenario);
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

// 15. Reset simulation to healthy nominal baseline (0 incidents, pristine fresh-state)
router.post('/simulation/reset', (req, res) => {
  syntheticEngine.resetTransactionsToNominal();
  incidentStore.resetAll();
  res.json({
    success: true,
    message: 'Simulation reset to nominal healthy baseline (93%+ success rate).',
    health: computeConsolidatedHealth(),
    incidents: incidentStore.getIncidents(),
  });
});

// 16. Full system reset endpoint
router.post('/simulation/full-reset', (req, res) => {
  syntheticEngine.resetTransactionsToNominal();
  incidentStore.resetAll();
  res.json({
    success: true,
    message: 'Full system and incident store reset to pristine deterministic demo baseline.',
    health: computeConsolidatedHealth(),
    incidents: incidentStore.getIncidents(),
  });
});

// Mount router on BOTH '/api' and '/' so requests match regardless of proxy path stripping
app.use('/api', router);
app.use('/', router);

export default app;
