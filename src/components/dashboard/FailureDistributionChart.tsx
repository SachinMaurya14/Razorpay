import React, { useState } from 'react';
import { Card } from '../common/Card';
import { PaymentHealthMetrics } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { PieChart as PieIcon, BarChart3, Layers } from 'lucide-react';

interface FailureDistributionChartProps {
  metrics: PaymentHealthMetrics;
  className?: string;
}

export const FailureDistributionChart: React.FC<FailureDistributionChartProps> = ({
  metrics,
  className = '',
}) => {
  const [tab, setTab] = useState<'bank' | 'error_code' | 'method'>('bank');

  const bankData = (metrics?.bankBreakdown || []).map(b => ({
    name: b.bank ? b.bank.replace(' Bank', '').replace('State Bank of India', 'SBI') : 'Unknown',
    successRate: b.successRate ?? 0,
    failedVolume: b.failedVolume ?? 0,
    status: b.status,
  }));

  const errorData = (metrics?.errorCodeDistribution || []).slice(0, 5).map(e => ({
    name: e.code ? e.code.replace(/_/g, ' ') : 'Unknown',
    count: e.count ?? 0,
    percentage: e.percentage ?? 0,
  }));

  const methodData = (metrics?.methodBreakdown || []).map(m => ({
    name: m.method || 'Unknown',
    share: m.sharePercent ?? 0,
    successRate: m.successRate ?? 0,
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  return (
    <Card className={`p-5 bg-white border-slate-200/80 shadow-xs flex flex-col justify-between ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600" />
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Failure & Cohort Distribution
          </h4>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px] font-medium">
          <button
            onClick={() => setTab('bank')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              tab === 'bank' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Bank
          </button>
          <button
            onClick={() => setTab('error_code')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              tab === 'error_code' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Error Codes
          </button>
          <button
            onClick={() => setTab('method')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              tab === 'method' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Methods
          </button>
        </div>
      </div>

      <div className="h-60 w-full mt-2">
        {tab === 'bank' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bankData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xl text-xs font-mono text-slate-800">
                        <div className="text-slate-900 font-bold">{data.name}</div>
                        <div className="text-blue-600">Success Rate: {data.successRate}%</div>
                        <div className="text-rose-600">Failed Txns: {data.failedVolume}</div>
                        <div className={`mt-1 font-semibold uppercase ${
                          data.status === 'critical' ? 'text-rose-600' : data.status === 'degraded' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          Status: {data.status}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="successRate" radius={[4, 4, 0, 0]}>
                {bankData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.successRate < 70 ? '#f43f5e' : entry.successRate < 85 ? '#f59e0b' : '#3b82f6'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {tab === 'error_code' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={errorData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
              <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} tickLine={false} width={110} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-xl text-xs font-mono text-slate-800">
                        <div className="text-slate-900 font-bold">{data.name}</div>
                        <div className="text-rose-600">Occurrences: {data.count} ({data.percentage}%)</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {tab === 'method' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={methodData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="share"
                nameKey="name"
              >
                {methodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-xl text-xs font-mono text-slate-800">
                        <div className="text-slate-900 font-bold">{data.name}</div>
                        <div className="text-blue-600">Volume Share: {data.share}%</div>
                        <div className="text-emerald-600">Success Rate: {data.successRate}%</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
