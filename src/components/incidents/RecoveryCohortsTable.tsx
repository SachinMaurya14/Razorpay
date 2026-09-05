import React, { useState } from 'react';
import { RecoveryCohort } from '../../types';
import { Card } from '../common/Card';
import { formatINR } from '../../lib/formatters';
import { CohortDetailModal } from './CohortDetailModal';
import { 
  Layers, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Ban, 
  Clock, 
  Eye,
  ArrowUpDown
} from 'lucide-react';

interface RecoveryCohortsTableProps {
  cohorts: RecoveryCohort[];
  onSelectTransaction?: (txId: string) => void;
  className?: string;
}

export const RecoveryCohortsTable: React.FC<RecoveryCohortsTableProps> = ({
  cohorts = [],
  onSelectTransaction,
  className = '',
}) => {
  const [selectedCohort, setSelectedCohort] = useState<RecoveryCohort | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'RECOVERABLE' | 'EXCLUDED' | 'REVIEW'>('ALL');

  const filteredCohorts = cohorts.filter(c => {
    if (filter === 'RECOVERABLE') {
      return c.recoverability === 'RECOVERABLE' || c.recoverability === 'POSSIBLY_RECOVERABLE';
    }
    if (filter === 'EXCLUDED') {
      return c.recoverability === 'NOT_RECOVERABLE';
    }
    if (filter === 'REVIEW') {
      return c.recoverability === 'REQUIRES_HUMAN_REVIEW';
    }
    return true;
  });

  const getRecoverabilityBadge = (state: RecoveryCohort['recoverability']) => {
    switch (state) {
      case 'RECOVERABLE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-300">
            RECOVERABLE
          </span>
        );
      case 'POSSIBLY_RECOVERABLE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-300">
            POSSIBLY RECOVERABLE
          </span>
        );
      case 'NOT_RECOVERABLE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-50 text-rose-700 border border-rose-300">
            NOT RECOVERABLE
          </span>
        );
      case 'REQUIRES_HUMAN_REVIEW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-300">
            HUMAN REVIEW
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-50 text-slate-700 border border-slate-300">
            {state}
          </span>
        );
    }
  };

  const getStatusBadge = (status: RecoveryCohort['status']) => {
    switch (status) {
      case 'RECOVERED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800">RECOVERED</span>;
      case 'READY':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-100 text-blue-800">READY</span>;
      case 'EXECUTING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-100 text-indigo-800 animate-pulse">EXECUTING</span>;
      case 'EXCLUDED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-600">EXCLUDED</span>;
      case 'QUALIFIED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-100 text-amber-800">QUALIFIED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <>
      <Card className={`p-5 sm:p-6 bg-white border-slate-200/90 shadow-xs ${className}`}>
        {/* Header and Filter Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Recovery Cohort Classification Table
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Granular segment triage with automated recoverability labels, stopping rules, and underlying proof
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({cohorts.length})
            </button>
            <button
              onClick={() => setFilter('RECOVERABLE')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'RECOVERABLE' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recoverable
            </button>
            <button
              onClick={() => setFilter('EXCLUDED')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'EXCLUDED' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Excluded
            </button>
            <button
              onClick={() => setFilter('REVIEW')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'REVIEW' ? 'bg-white text-amber-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Review Held
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-mono uppercase text-slate-400 font-semibold bg-slate-50/50">
                <th className="py-2.5 px-3">Cohort & ID</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Volume & GMV at Risk</th>
                <th className="py-2.5 px-3">Recoverable GMV</th>
                <th className="py-2.5 px-3">Recommended Mitigation</th>
                <th className="py-2.5 px-3">Stopping Rule</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-sans">
              {filteredCohorts.map((cohort) => (
                <tr 
                  key={cohort.id} 
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => setSelectedCohort(cohort)}
                >
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {cohort.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                      <span>{cohort.id}</span>
                      <span className="text-slate-300">·</span>
                      <span className="truncate max-w-[200px]">{cohort.cause}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="space-y-1">
                      {getRecoverabilityBadge(cohort.recoverability)}
                      <div>{getStatusBadge(cohort.status)}</div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-mono">
                    <div className="font-extrabold text-slate-900">
                      {formatINR(cohort.revenueAtRisk, true)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {cohort.transactionCount} transactions
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-mono">
                    <div className={`font-extrabold ${cohort.recoverableRevenue > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {formatINR(cohort.recoverableRevenue, true)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {cohort.recoveryRatePercent > 0 ? `${cohort.recoveryRatePercent}% recovered` : '0% recovered'}
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-800">
                      {cohort.recommendedStrategy}
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold mt-1 inline-block">
                      {cohort.recommendedActionType}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 max-w-[220px]">
                    <div className="text-[11px] text-slate-600 line-clamp-2">
                      {cohort.stoppingRule}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCohort(cohort);
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Cohort Detail Drawer Modal */}
      {selectedCohort && (
        <CohortDetailModal
          cohort={selectedCohort}
          onClose={() => setSelectedCohort(null)}
          onSelectTransaction={onSelectTransaction}
        />
      )}
    </>
  );
};
