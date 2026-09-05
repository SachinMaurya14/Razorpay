import { 
  Incident, 
  PaymentHealthMetrics, 
  PaymentTransaction, 
  AgentCardState, 
  AuditLogEntry, 
  SimulationScenarioId,
  RecoveryBatch,
  RecoveryOpportunity,
  RecoveryScorecardData,
  MerchantImpactItem,
  StrategyComparisonOption,
  AgentMetricTimePoint,
  AgentPerformanceSummary,
  AgentBenchmarkReport
} from '../types';

export const api = {
  async getOverview(): Promise<{
    health: PaymentHealthMetrics;
    incidents: Incident[];
    agents: Record<string, AgentCardState>;
    recentTransactions: PaymentTransaction[];
    activeScenario: SimulationScenarioId;
  }> {
    const res = await fetch('/api/overview');
    if (!res.ok) throw new Error('Failed to fetch overview metrics');
    return res.json();
  },

  async getIncidents(params?: { severity?: string; status?: string; search?: string }): Promise<{
    incidents: Incident[];
    totalCount: number;
  }> {
    const query = new URLSearchParams();
    if (params?.severity) query.set('severity', params.severity);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/incidents?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  async getIncidentById(id: string): Promise<Incident> {
    const res = await fetch(`/api/incidents/${id}`);
    if (!res.ok) throw new Error(`Incident ${id} not found`);
    return res.json();
  },

  async runDemoIncident(scenario: SimulationScenarioId = 'hdfc_upi_degradation'): Promise<{
    success: boolean;
    incident: Incident;
    message: string;
  }> {
    const res = await fetch('/api/incidents/run-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario }),
    });
    if (!res.ok) throw new Error('Failed to trigger incident workflow');
    return res.json();
  },

  async seedScenario(seedKey: 'SEED_A' | 'SEED_B' | 'SEED_C' | 'SEED_D' | 'SEED_E'): Promise<{
    success: boolean;
    incident: Incident;
    message: string;
  }> {
    const res = await fetch(`/api/incidents/seed/${seedKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Failed to load scenario seed ${seedKey}`);
    return res.json();
  },

  async approveMitigation(incidentId: string, approved: boolean, notes?: string): Promise<{
    success: boolean;
    incident: Incident;
  }> {
    const res = await fetch(`/api/incidents/${incidentId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved, notes }),
    });
    if (!res.ok) throw new Error('Failed to submit approval decision');
    return res.json();
  },

  async executeMitigation(incidentId: string): Promise<{
    success: boolean;
    incident: Incident;
  }> {
    const res = await fetch(`/api/incidents/${incidentId}/execute-mitigation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to execute mitigation');
    return res.json();
  },

  async verifyRecovery(incidentId: string): Promise<{
    success: boolean;
    incident: Incident;
  }> {
    const res = await fetch(`/api/incidents/${incidentId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to verify recovery');
    return res.json();
  },

  async rollbackMitigation(incidentId: string): Promise<{
    success: boolean;
    incident: Incident;
  }> {
    const res = await fetch(`/api/incidents/${incidentId}/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to rollback mitigation');
    return res.json();
  },

  async getRecoveryBatches(): Promise<{ batches: RecoveryBatch[]; total: number }> {
    const res = await fetch('/api/recovery-batches');
    if (!res.ok) throw new Error('Failed to fetch recovery batches');
    return res.json();
  },

  async getRecoveryOpportunities(): Promise<{ opportunities: RecoveryOpportunity[]; total: number }> {
    const res = await fetch('/api/recovery-opportunities');
    if (!res.ok) throw new Error('Failed to fetch recovery opportunities');
    return res.json();
  },

  async getRecoveryScorecard(): Promise<RecoveryScorecardData> {
    const res = await fetch('/api/recovery-scorecard');
    if (!res.ok) throw new Error('Failed to fetch recovery scorecard');
    return res.json();
  },

  async getMerchantImpact(): Promise<{ merchants: MerchantImpactItem[]; total: number }> {
    const res = await fetch('/api/merchant-impact');
    if (!res.ok) throw new Error('Failed to fetch merchant impact');
    return res.json();
  },

  async getIncidentStrategies(incidentId: string): Promise<{ incidentId: string; strategies: StrategyComparisonOption[] }> {
    const res = await fetch(`/api/incidents/${incidentId}/strategies`);
    if (!res.ok) throw new Error('Failed to fetch incident strategies');
    return res.json();
  },

  async search(query: string): Promise<{
    incidents: Incident[];
    transactions: PaymentTransaction[];
    merchants: Array<{ id: string; name: string; tier: string; txCount: number }>;
    auditEvents: AuditLogEntry[];
  }> {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search');
    return res.json();
  },

  async getTransactions(params?: {
    bank?: string;
    method?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    transactions: PaymentTransaction[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const query = new URLSearchParams();
    if (params?.bank) query.set('bank', params.bank);
    if (params?.method) query.set('method', params.method);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));

    const res = await fetch(`/api/transactions?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async getLiveTick(): Promise<{ transaction: PaymentTransaction }> {
    const res = await fetch('/api/transactions/live-tick');
    if (!res.ok) throw new Error('Failed to fetch live tick');
    return res.json();
  },

  async getAuditLogs(): Promise<{ logs: AuditLogEntry[] }> {
    const res = await fetch('/api/audit-logs');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getAgentsStatus(): Promise<{ agents: Record<string, AgentCardState> }> {
    const res = await fetch('/api/agents/status');
    if (!res.ok) throw new Error('Failed to fetch agents status');
    return res.json();
  },

  async triggerScenario(scenario: SimulationScenarioId): Promise<{ success: boolean; scenario: string }> {
    const res = await fetch('/api/simulation/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario }),
    });
    if (!res.ok) throw new Error('Failed to trigger simulation scenario');
    return res.json();
  },

  async resetSimulation(): Promise<{ success: boolean; message: string; health: PaymentHealthMetrics }> {
    const res = await fetch('/api/simulation/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to reset simulation');
    return res.json();
  },

  async fullReset(): Promise<{ success: boolean; message: string; health: PaymentHealthMetrics; incidents: Incident[] }> {
    const res = await fetch('/api/simulation/full-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to perform full reset');
    return res.json();
  },

  async getAgentPerformance(params?: {
    timeRange?: '1h' | '6h' | '24h' | 'all';
    agentId?: string;
  }): Promise<{
    metrics: AgentMetricTimePoint[];
    summaries: Record<'detection' | 'investigation' | 'resolution', AgentPerformanceSummary>;
    timeRange: string;
    agentId: string;
    totalDataPoints: number;
  }> {
    const query = new URLSearchParams();
    if (params?.timeRange) query.set('timeRange', params.timeRange);
    if (params?.agentId && params.agentId !== 'all') query.set('agentId', params.agentId);

    const res = await fetch(`/api/agents/performance?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch agent performance metrics');
    return res.json();
  },

  async getAgentBenchmark(): Promise<AgentBenchmarkReport> {
    const res = await fetch('/api/agents/benchmark');
    if (!res.ok) throw new Error('Failed to fetch agent benchmark report');
    return res.json();
  },

  async runAgentBenchmark(): Promise<{ success: boolean; report: AgentBenchmarkReport; message: string }> {
    const res = await fetch('/api/agents/benchmark/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to run agent benchmark evaluation');
    return res.json();
  },
};
