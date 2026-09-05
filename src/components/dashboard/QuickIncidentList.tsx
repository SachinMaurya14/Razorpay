import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Incident } from '../../types';
import { AlertCircle, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface QuickIncidentListProps {
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
  className?: string;
}

export const QuickIncidentList: React.FC<QuickIncidentListProps> = ({
  incidents,
  onSelectIncident,
  className = '',
}) => {
  return (
    <Card className={`p-5 bg-white border-slate-200/80 shadow-xs ${className}`}>
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Active & Recent Incidents
          </h4>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {incidents.length} Incident Records
        </span>
      </div>

      {incidents.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
          No active incidents detected. All payment pipelines healthy.
        </div>
      ) : (
        <div className="space-y-2.5">
          {incidents.map((incident) => {
            const isCritical = incident.severity === 'critical';
            const isResolved = incident.status === 'VERIFIED' || incident.status === 'RESOLVED';

            return (
              <div
                key={incident.id}
                onClick={() => onSelectIncident(incident.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isResolved
                    ? 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300'
                    : isCritical
                    ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300 shadow-xs'
                    : 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono font-bold text-xs text-slate-800">
                      {incident.id}
                    </span>
                    <Badge severity={incident.severity} size="sm" />
                    <Badge status={incident.status} size="sm" />
                  </div>
                  <h5 className="text-sm font-semibold text-slate-900 truncate">
                    {incident.title}
                  </h5>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {incident.investigation?.rootCause || incident.detection.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Revenue at Risk
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-600">
                      ₹{(incident.revenueAtRisk ?? 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                  >
                    Details
                    <ArrowRight className="w-3 h-3 text-blue-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
