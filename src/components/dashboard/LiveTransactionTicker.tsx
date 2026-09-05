import React from 'react';
import { Card } from '../common/Card';
import { PaymentTransaction } from '../../types';
import { Radio, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface LiveTransactionTickerProps {
  transactions: PaymentTransaction[];
  className?: string;
  onInspectTransaction?: (tx: PaymentTransaction) => void;
}

export const LiveTransactionTicker: React.FC<LiveTransactionTickerProps> = ({
  transactions,
  className = '',
  onInspectTransaction,
}) => {
  return (
    <Card className={`p-4 bg-white border-slate-200/80 shadow-xs ${className}`}>
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Live Payment Ingestion Stream
          </h4>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Synthetic Telemetry • Real-time
        </span>
      </div>

      <div className="space-y-2 overflow-hidden max-h-60 overflow-y-auto pr-1">
        {transactions.map((tx) => {
          const isSuccess = tx.status === 'SUCCESS' || tx.status === 'success';
          const amountVal = tx.amountINR ?? tx.amount ?? 0;
          const routeVal = tx.acquirerRoute ?? tx.route ?? 'Direct Route';

          return (
            <div
              key={tx.transactionId}
              onClick={() => onInspectTransaction?.(tx)}
              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                isSuccess
                  ? 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300'
                  : 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {isSuccess ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-800 truncate">
                      {tx.merchantName || 'Merchant'}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {tx.bank} • {tx.paymentMethod}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {tx.transactionId} • {routeVal}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-slate-900 block">
                  ₹{amountVal.toLocaleString('en-IN')}
                </span>
                <span className={`text-[10px] font-mono ${
                  isSuccess ? 'text-slate-500' : 'text-rose-600 font-semibold'
                }`}>
                  {isSuccess ? `${tx.latencyMs || 250} ms` : (tx.errorCode || 'FAILED')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
