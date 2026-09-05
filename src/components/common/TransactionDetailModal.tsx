import React from 'react';
import { PaymentTransaction } from '../../types';
import { Badge } from './Badge';
import { formatINR } from '../../lib/formatters';
import { 
  X, 
  CreditCard, 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Network, 
  Smartphone, 
  MapPin, 
  ShieldAlert,
  ArrowRight,
  Server
} from 'lucide-react';

interface TransactionDetailModalProps {
  transaction: PaymentTransaction | null;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  const isSuccess = transaction.status === 'SUCCESS';
  const hasTimeout = transaction.errorCode?.includes('TIMEOUT') || transaction.latencyMs > 2500;

  // 5-Stage Simulated Lifecycle Pipeline
  const lifecycle = [
    {
      step: '1. Checkout Initiated',
      desc: `Customer triggered ${transaction.paymentMethod} payment on ${transaction.merchantName}`,
      latency: '0ms',
      status: 'completed',
      detail: `Device: ${transaction.device} • IP Geo: ${transaction.region}`,
    },
    {
      step: '2. Edge Gateway Ingress',
      desc: 'TLS Termination & Razorpay Ingress authentication',
      latency: '+24ms',
      status: 'completed',
      detail: 'WAF Passed • Signature Verified • Token Validated',
    },
    {
      step: '3. Core Smart Router',
      desc: `Dynamic routing decision evaluated (Selected Route: ${transaction.route})`,
      latency: '+18ms',
      status: 'completed',
      detail: `Segment: ${transaction.customerSegment} • Priority Class: High`,
    },
    {
      step: '4. Issuer Banking Switch',
      desc: `Dispatched packet to ${transaction.bank} core switch`,
      latency: `+${transaction.latencyMs}ms`,
      status: isSuccess ? 'completed' : 'failed',
      detail: isSuccess 
        ? 'Switch ACKs response within SLA' 
        : `Switch failed: ${transaction.errorCode || 'TIMEOUT_504'}`,
    },
    {
      step: '5. Settlement & Response',
      desc: isSuccess ? 'Auth confirmed & webhook broadcasted' : 'Customer notified of failure / retry prompt',
      latency: '+8ms',
      status: isSuccess ? 'completed' : 'failed',
      detail: isSuccess ? 'Settlement queue logged' : `Error mapped: ${transaction.errorCode}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-mono text-slate-900">
                  {transaction.transactionId}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {transaction.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {new Date(transaction.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-5 flex-1">
          {/* Key Metric Overview Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Amount</span>
              <strong className="text-slate-900 text-sm">{formatINR(transaction.amount)}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Bank / Switch</span>
              <strong className="text-slate-900">{transaction.bank}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Method</span>
              <strong className="text-blue-700">{transaction.paymentMethod}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Latency</span>
              <strong className={transaction.latencyMs > 1000 ? 'text-rose-600' : 'text-slate-900'}>
                {transaction.latencyMs}ms
              </strong>
            </div>
          </div>

          {/* Merchant & Route Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                Merchant Metadata
              </span>
              <div className="font-bold text-slate-900">{transaction.merchantName}</div>
              <div className="font-mono text-slate-500 text-[11px]">ID: {transaction.merchantId}</div>
              <div className="font-mono text-slate-500 text-[11px]">Segment: {transaction.customerSegment}</div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                Telemetry Routing
              </span>
              <div className="font-mono font-bold text-slate-900">{transaction.route}</div>
              <div className="font-mono text-slate-500 text-[11px]">Device: {transaction.device}</div>
              <div className="font-mono text-slate-500 text-[11px]">Region: {transaction.region}</div>
            </div>
          </div>

          {/* Error Detail If Failed */}
          {!isSuccess && (
            <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                Error Code: {transaction.errorCode || 'UNKNOWN_FAILURE'}
              </div>
              <p className="text-rose-700 text-[11px] font-mono leading-relaxed">
                Issuer bank switch exceeded the 2500ms transaction execution SLA without acknowledging gateway handshake.
              </p>
            </div>
          )}

          {/* 5-Step Lifecycle Trace */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider">
              Simulated Execution Lifecycle Trace
            </h4>

            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {lifecycle.map((step, idx) => {
                const isStepFailed = step.status === 'failed';

                return (
                  <div key={idx} className="relative flex items-start gap-3 pl-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      isStepFailed 
                        ? 'bg-rose-600 text-white' 
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {isStepFailed ? (
                        <XCircle className="w-3.5 h-3.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="flex-1 p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/70 text-xs">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-slate-900">{step.step}</span>
                        <span className="text-[10px] text-slate-500">{step.latency}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">{step.desc}</p>
                      <div className="text-[10px] text-slate-400 font-mono mt-1 border-t border-slate-200/50 pt-1">
                        {step.detail}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
