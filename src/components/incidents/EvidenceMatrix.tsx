import React from 'react';
import { EvidenceItem } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Database, AlertOctagon, TrendingDown, Clock, ShieldCheck } from 'lucide-react';

interface EvidenceMatrixProps {
  evidence: EvidenceItem[];
  className?: string;
}

export const EvidenceMatrix: React.FC<EvidenceMatrixProps> = ({
  evidence,
  className = '',
}) => {
  return (
    <Card className={`p-5 bg-white border-slate-200/80 shadow-xs ${className}`}>
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600" />
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Evidence Matrix & Telemetry Verification
          </h4>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {(evidence || []).length} Verified Data Points
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
              <th className="pb-2.5 font-semibold">Dimension & Metric</th>
              <th className="pb-2.5 font-semibold">Baseline (Normal)</th>
              <th className="pb-2.5 font-semibold">Observed (Degraded)</th>
              <th className="pb-2.5 font-semibold">Delta Variance</th>
              <th className="pb-2.5 font-semibold">Significance</th>
              <th className="pb-2.5 font-semibold">Operational Analysis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {(evidence || []).map((item) => {
              const isCritical = item.significance === 'Critical';
              const isHigh = item.significance === 'High';

              return (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-3 font-medium text-slate-800">
                    <span className="text-[10px] block font-mono text-slate-400">
                      {item.dimension}
                    </span>
                    {item.metric}
                  </td>
                  <td className="py-3 pr-3 font-mono text-slate-500">
                    {item.baselineValue}
                  </td>
                  <td className="py-3 pr-3 font-mono font-bold text-rose-600">
                    {item.observedValue}
                  </td>
                  <td className="py-3 pr-3 font-mono font-semibold">
                    <span className={item.delta.startsWith('+') && !item.delta.includes('normal') ? 'text-rose-600' : 'text-amber-600'}>
                      {item.delta}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <Badge
                      variant="neutral"
                      size="sm"
                      className={
                        isCritical
                          ? 'border-rose-200 bg-rose-50 text-rose-700 font-bold'
                          : isHigh
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : 'border-slate-200 bg-slate-100 text-slate-700'
                      }
                    >
                      {item.significance}
                    </Badge>
                  </td>
                  <td className="py-3 text-slate-600 max-w-xs text-xs leading-relaxed">
                    {item.explanation}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
