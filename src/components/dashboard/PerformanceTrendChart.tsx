import React from 'react';
import { Card } from '../common/Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface PerformanceTrendChartProps {
  data: Array<{
    time: string;
    successRate: number;
    failureRate: number;
    volume: number;
    anomaly?: boolean;
  }>;
  className?: string;
}

export const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({
  data,
  className = '',
}) => {
  return (
    <Card className={`p-5 bg-white border-slate-200/80 shadow-xs flex flex-col justify-between ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Payment Success Rate Telemetry (Real-time Trend)
          </h4>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
            Success Rate (%)
          </span>
          <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            Failure Rate (%)
          </span>
        </div>
      </div>

      <div className="h-60 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorFail" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e11d48" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false} 
              fontFamily="JetBrains Mono"
            />
            <YAxis 
              domain={[0, 100]} 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false}
              fontFamily="JetBrains Mono"
              unit="%"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xl text-xs font-mono text-slate-800">
                      <div className="text-slate-500 mb-1 font-semibold">{label}</div>
                      <div className="text-blue-600">Success Rate: <strong className="text-slate-900">{item.successRate}%</strong></div>
                      <div className="text-rose-600">Failure Rate: <strong className="text-slate-900">{item.failureRate}%</strong></div>
                      <div className="text-slate-500 mt-1">Sample Volume: {item.volume} txns</div>
                      {item.anomaly && (
                        <div className="mt-1 pt-1 border-t border-slate-100 text-amber-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          Anomaly Threshold Exceeded
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="successRate" 
              stroke="#2563eb" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorSuccess)" 
            />
            <Area 
              type="monotone" 
              dataKey="failureRate" 
              stroke="#e11d48" 
              strokeWidth={1.5}
              fillOpacity={1} 
              fill="url(#colorFail)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
