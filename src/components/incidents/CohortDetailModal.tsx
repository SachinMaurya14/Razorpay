import React from 'react';
import { RecoveryCohort } from '../../types';
import { formatINR } from '../../lib/formatters';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Ban, 
  Clock, 
  ListOrdered,
  FileCode,
  Layers
} from 'lucide-react';

interface CohortDetailModalProps {
  cohort: RecoveryCohort | null;
  onClose: () => void;
  onSelectTransaction?: (txId: string) => void;
}

export const CohortDetailModal: React.FC<CohortDetailModalProps> = ({
  cohort,
  onClose,
  onSelectTransaction,
}) => {
  if (!cohort) return null;

  const getRecoverabilityBadge = (state: RecoveryCohort['recoverability']) => {
    switch (state) {
      case 'RECOVERABLE':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-300">RECOVERABLE</span>;
      case 'POSSIBLY_RECOVERABLE':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-blue-50 text-blue-700 border border-blue-300">POSSIBLY RECOVERABLE</span>;
      case 'NOT_RECOVERABLE':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-rose-50 text-rose-700 border border-rose-300">NOT RECOVERABLE</span>;
      case 'REQUIRES_HUMAN_REVIEW':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-amber-50 text-amber-700 border border-amber-300">REQUIRES HUMAN REVIEW</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-slate-50 text-slate-700 border border-slate-300">{state}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                {cohort.id}
              </span>
              {getRecoverabilityBadge(cohort.recoverability)}
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {cohort.name}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Key Numbers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Volume</span>
              <span className="text-base font-extrabold text-slate-900">{cohort.transactionCount} txns</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Revenue at Risk</span>
              <span className="text-base font-extrabold text-rose-600">{formatINR(cohort.revenueAtRisk, true)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Recoverable</span>
              <span className="text-base font-extrabold text-blue-600">{formatINR(cohort.recoverableRevenue, true)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Recovery Rate</span>
              <span className="text-base font-extrabold text-emerald-600">{cohort.recoveryRatePercent}%</span>
            </div>
          </div>

          {/* Root Cause & Engineering Rationale */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Root Cause & Classification Rationale
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <p><strong>Primary Cause:</strong> {cohort.cause}</p>
              <p><strong>Classification Rationale:</strong> {cohort.rationale}</p>
            </div>
          </div>

          {/* Recommended Strategy & Stopping Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 text-xs space-y-1.5">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                Recommended Strategy
              </div>
              <p className="text-blue-800 font-semibold">{cohort.recommendedStrategy}</p>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 inline-block font-bold">
                Action: {cohort.recommendedActionType}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-600" />
                Deterministic Stopping Rule
              </div>
              <p className="text-slate-700">{cohort.stoppingRule}</p>
              {cohort.stoppingReason && (
                <div className="text-[11px] text-amber-700 font-semibold pt-1 border-t border-slate-200">
                  Current Status: {cohort.stoppingReason}
                </div>
              )}
            </div>
          </div>

          {/* Telemetry Evidence */}
          {cohort.evidence && cohort.evidence.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Telemetry Evidence Graph
              </h4>
              <ul className="space-y-1.5">
                {cohort.evidence.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start gap-2 font-mono">
                    <span className="text-blue-600 font-bold shrink-0">#{idx + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sample Underlying Transactions */}
          {cohort.sampleTransactionIds && cohort.sampleTransactionIds.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-slate-600" />
                Sample Underlying Transactions ({cohort.sampleTransactionIds.length})
              </h4>
              <div className="flex flex-wrap gap-2 font-mono text-xs">
                {cohort.sampleTransactionIds.map((txId) => (
                  <button
                    key={txId}
                    onClick={() => onSelectTransaction && onSelectTransaction(txId)}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    {txId}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono">
            Attempts Budget: {cohort.attempts} / {cohort.maxAttempts}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold transition-colors cursor-pointer"
          >
            Close Cohort Detail
          </button>
        </div>
      </div>
    </div>
  );
};
