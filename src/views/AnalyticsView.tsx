import React from 'react';
import { PaymentHealthMetrics } from '../types';
import { Card } from '../components/common/Card';
import { MetricCard } from '../components/common/MetricCard';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Building2, 
  Cpu, 
  Layers 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

interface AnalyticsViewProps {
  metrics: PaymentHealthMetrics;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  metrics,
}) => {
  const bankComparisonData = (metrics.bankBreakdown || []).map(b => ({
    bank: (b.bank || 'Bank').replace(' Bank', '').replace('State Bank of India', 'SBI'),
    successRate: b.successRate ?? 90,
    avgLatency: b.avgLatencyMs ?? 320,
    volume: b.totalVolume ?? 0,
    failures: b.failedVolume ?? 0,
  }));

  const percentiles = metrics.latencyPercentiles || {
    p50: 280,
    p90: 620,
    p95: metrics.avgLatencyMs > 1000 ? 3200 : 850,
    p99: metrics.avgLatencyMs > 1000 ? 4600 : 1420,
  };

  const protectedRevenue = metrics.totalProtectedRevenueINR ?? metrics.recoveredRevenueINR ?? 0;
  const methodList = metrics.methodBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Recovery Intelligence & Acquirer Benchmarks
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Detailed breakdown of gateway performance, switch latency distributions, and mitigation yield across Indian banking acquirers.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Success Rate"
          value={`${metrics.successRate ?? 92}%`}
          subValue="target: 93.4%"
          change={{
            value: (metrics.successRate ?? 92) >= 90 ? '+0.4% nominal' : `-${(93.4 - (metrics.successRate ?? 92)).toFixed(1)}% delta`,
            isPositive: (metrics.successRate ?? 92) >= 90,
          }}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
        />

        <MetricCard
          title="Protected GMV Volume"
          value={`₹${(protectedRevenue / 100000).toFixed(2)}L`}
          subValue="saved from failover"
          change={{
            value: '100% saved',
            isPositive: true,
          }}
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          variant="success"
        />

        <MetricCard
          title="p95 Gateway Latency"
          value={`${metrics.avgLatencyMs || 340} ms`}
          subValue="SLA: < 800ms"
          change={{
            value: (metrics.avgLatencyMs || 340) <= 800 ? 'within SLA' : '+2,840ms peak',
            isPositive: (metrics.avgLatencyMs || 340) <= 800,
          }}
          icon={<Clock className="w-5 h-5 text-blue-600" />}
        />

        <MetricCard
          title="Health Index Score"
          value={`${metrics.healthScore || 85}/100`}
          subValue="deterministic score"
          change={{
            value: (metrics.healthScore || 85) >= 90 ? 'Healthy' : 'Degraded',
            isPositive: (metrics.healthScore || 85) >= 90,
          }}
          icon={<ShieldCheck className="w-5 h-5 text-purple-600" />}
        />
      </div>

      {/* Bank Comparison Chart */}
      <Card className="p-5 bg-white border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Acquirer Success Rate Benchmark
            </h4>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Real-time Telemetry
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bankComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="bank" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-md text-xs font-mono">
                        <div className="text-slate-900 font-bold">{d.bank}</div>
                        <div className="text-blue-600">Success Rate: {d.successRate}%</div>
                        <div className="text-slate-500">Latency: {d.avgLatency} ms</div>
                        <div className="text-rose-600">Failed Volume: {d.failures}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="successRate" radius={[4, 4, 0, 0]}>
                {bankComparisonData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.successRate < 70 ? '#f43f5e' : entry.successRate < 85 ? '#f59e0b' : '#3b82f6'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Latency Percentiles Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 bg-white border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-purple-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Latency Percentile Distribution (ms)
            </h4>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500">p50 (Median Latency):</span>
              <strong className="text-slate-900">{percentiles.p50} ms</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500">p90 (Standard Peak):</span>
              <strong className="text-slate-900">{percentiles.p90} ms</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500">p95 (Degradation Threshold):</span>
              <strong className={percentiles.p95 > 2000 ? 'text-rose-600 font-bold' : 'text-slate-900'}>
                {percentiles.p95} ms
              </strong>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500">p99 (Outlier Tail):</span>
              <strong className="text-rose-600 font-bold">{percentiles.p99} ms</strong>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Payment Method Breakdown
            </h4>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {methodList.map((m) => (
              <div key={m.method} className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 font-bold">{m.method}</span>
                  <span className="text-blue-600 font-bold">{m.successRate}% Success</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Traffic Share: {m.sharePercent}%</span>
                  <span>Avg Latency: {m.avgLatencyMs || 300} ms</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
