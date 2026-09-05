import React from 'react';
import { 
  PaymentHealthMetrics, 
  Incident, 
  AgentCardState, 
  PaymentTransaction 
} from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { AgentStatusBar } from '../components/agents/AgentStatusBar';
import { PaymentHealthScoreGauge } from '../components/dashboard/PaymentHealthScoreGauge';
import { PerformanceTrendChart } from '../components/dashboard/PerformanceTrendChart';
import { FailureDistributionChart } from '../components/dashboard/FailureDistributionChart';
import { QuickIncidentList } from '../components/dashboard/QuickIncidentList';
import { LiveTransactionTicker } from '../components/dashboard/LiveTransactionTicker';
import { 
  ShieldAlert, 
  Activity, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Play, 
  RefreshCw 
} from 'lucide-react';

interface OverviewViewProps {
  health: PaymentHealthMetrics;
  incidents: Incident[];
  agents: Record<string, AgentCardState>;
  recentTransactions: PaymentTransaction[];
  onSelectIncident: (id: string) => void;
  onNavigateToAgents: () => void;
  onRunWorkflowDemo: () => void;
  onRefresh: () => void;
  isProcessing?: boolean;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  health,
  incidents,
  agents,
  recentTransactions,
  onSelectIncident,
  onNavigateToAgents,
  onRunWorkflowDemo,
  onRefresh,
  isProcessing = false,
}) => {
  const isHealthy = health.successRate >= 90;
  const isCritical = health.successRate < 70;

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Payment Revenue Recovery Operations
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              Live Control Plane
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Real-time fintech telemetry, deterministic cohort isolation, and multi-agent revenue recovery governance across HDFC, ICICI, SBI, and Axis payment switches.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="refresh-overview-btn"
            onClick={onRefresh}
            disabled={isProcessing}
            className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
          </button>

          <button
            id="overview-run-demo-btn"
            onClick={onRunWorkflowDemo}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulate Live Anomaly & Run 3 Agents</span>
          </button>
        </div>
      </div>

      {/* 3-Agent HUD Pipeline */}
      <AgentStatusBar 
        agents={agents} 
        onSelectAgent={() => onNavigateToAgents()} 
      />

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          id="metric-success-rate"
          title="Overall Success Rate"
          value={`${health.successRate}%`}
          subValue="target: 93.4%"
          change={{
            value: health.successRate >= 90 ? '+0.4% nominal' : `-${(93.4 - health.successRate).toFixed(1)}% vs baseline`,
            isPositive: health.successRate >= 90,
            timeframe: 'last 15m window',
          }}
          icon={<Activity className="w-5 h-5 text-blue-400" />}
          variant={isCritical ? 'danger' : isHealthy ? 'default' : 'warning'}
        />

        <MetricCard
          id="metric-revenue-at-risk"
          title="Revenue at Risk (Active)"
          value={`₹${((health.revenueAtRiskINR || 0) / 100000).toFixed(2)}L`}
          subValue={`₹${(health.revenueAtRiskINR || 0).toLocaleString('en-IN')}`}
          change={{
            value: (health.revenueAtRiskINR || 0) > 0 ? `${health.affectedTransactionsTotal || 0} txns failing` : '0 txns at risk',
            isPositive: (health.revenueAtRiskINR || 0) === 0,
            neutral: (health.revenueAtRiskINR || 0) === 0,
          }}
          icon={<DollarSign className="w-5 h-5 text-amber-400" />}
          variant={(health.revenueAtRiskINR || 0) > 500000 ? 'danger' : 'default'}
        />

        <MetricCard
          id="metric-protected-gmv"
          title="Protected GMV Volume"
          value={`₹${((health.recoveredRevenueINR || 0) / 100000).toFixed(2)}L`}
          subValue="via automated failovers"
          change={{
            value: '+100% recovered',
            isPositive: true,
            timeframe: 'this session',
          }}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          variant="success"
        />

        <MetricCard
          id="metric-avg-latency"
          title="Acquirer Latency (p95)"
          value={`${health.avgLatencyMs} ms`}
          subValue="SLA: < 800ms"
          change={{
            value: health.avgLatencyMs > 1500 ? '+2,800ms surge' : 'nominal SLA',
            isPositive: health.avgLatencyMs <= 800,
            neutral: health.avgLatencyMs <= 800,
          }}
          icon={<Clock className="w-5 h-5 text-purple-400" />}
          variant={health.avgLatencyMs > 2000 ? 'danger' : 'default'}
        />
      </div>

      {/* Charts & Gauges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PaymentHealthScoreGauge
          score={health.healthScore}
          successRate={health.successRate}
          severity={health.currentSystemSeverity || 'nominal'}
          className="lg:col-span-1"
        />

        <PerformanceTrendChart
          data={health.trendData || []}
          className="lg:col-span-2"
        />
      </div>

      {/* Incidents & Cohort Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickIncidentList
            incidents={incidents}
            onSelectIncident={onSelectIncident}
          />
        </div>

        <div className="lg:col-span-1">
          <FailureDistributionChart
            metrics={health}
          />
        </div>
      </div>

      {/* Real-time Transactions Ingestion Stream */}
      <LiveTransactionTicker
        transactions={recentTransactions}
      />
    </div>
  );
};
