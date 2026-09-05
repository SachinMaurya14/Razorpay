import React, { useState } from 'react';
import { Incident } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  ArrowRight, 
  Play, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';

interface IncidentsListViewProps {
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
  onRunWorkflowDemo: () => void;
  isProcessing?: boolean;
}

export const IncidentsListView: React.FC<IncidentsListViewProps> = ({
  incidents,
  onSelectIncident,
  onRunWorkflowDemo,
  isProcessing = false,
}) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = incidents.filter((inc) => {
    if (severityFilter !== 'all' && inc.severity.toLowerCase() !== severityFilter.toLowerCase()) {
      return false;
    }
    if (statusFilter !== 'all' && inc.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return (
        inc.id.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        (inc.investigation?.rootCause && inc.investigation.rootCause.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Revenue Incident Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse all active and historical incidents diagnosed by Detection, Investigation, and Resolution Agents.
          </p>
        </div>

        <button
          onClick={onRunWorkflowDemo}
          disabled={isProcessing}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Simulate New Incident
        </button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 bg-white border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by incident ID, root cause, or payment route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 px-2 text-[10px] font-mono uppercase">Severity:</span>
            {['all', 'critical', 'high', 'medium'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded uppercase text-[10px] font-mono transition-colors cursor-pointer ${
                  severityFilter === sev ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 px-2 text-[10px] font-mono uppercase">Status:</span>
            {['all', 'RESOLUTION', 'VERIFIED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded uppercase text-[10px] font-mono transition-colors cursor-pointer ${
                  statusFilter === st ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? 'all' : st === 'RESOLUTION' ? 'Active' : 'Resolved'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Incidents Table / Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center text-slate-500 bg-white border-slate-200/80 shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-slate-800">No matching payment incidents found</p>
            <p className="text-xs text-slate-500 mt-1">Adjust search filters or trigger a live simulation</p>
          </Card>
        ) : (
          filtered.map((incident) => {
            const isResolved = incident.status === 'VERIFIED' || incident.status === 'RESOLVED';
            const isCritical = incident.severity === 'critical';

            return (
              <Card
                key={incident.id}
                onClick={() => onSelectIncident(incident.id)}
                className={`p-5 bg-white transition-all cursor-pointer hover:border-slate-300 shadow-xs ${
                  isResolved
                    ? 'border-slate-200'
                    : isCritical
                    ? 'border-rose-300 bg-rose-50/20 hover:border-rose-400'
                    : 'border-amber-300 bg-amber-50/20 hover:border-amber-400'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {incident.id}
                      </span>
                      <Badge severity={incident.severity} size="sm" />
                      <Badge status={incident.status} size="sm" />
                      {incident.investigation?.affectedSegments?.[0] && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {incident.investigation.affectedSegments[0]}
                        </span>
                      )}
                      <span className="text-xs font-mono text-slate-400">
                        Detected: {incident.detectedAt ? new Date(incident.detectedAt).toLocaleTimeString() : 'Recently'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">
                      {incident.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <strong>Root Cause:</strong> {incident.investigation?.rootCause || incident.detection.summary}
                    </p>
                  </div>

                  {/* Right metrics & CTA */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                    <div className="text-left lg:text-right font-mono">
                      <span className="text-[10px] text-slate-400 block uppercase">Revenue at Risk</span>
                      <span className="text-base font-extrabold text-rose-600">
                        ₹{(incident.revenueAtRisk ?? 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {incident.affectedMerchants || 18} merchants impacted
                      </span>
                    </div>

                    <button
                      className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      Investigate & Resolve
                      <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
