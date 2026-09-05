import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { Incident, PaymentTransaction, AuditLogEntry } from '../../types';
import { Badge } from './Badge';
import { formatINR } from '../../lib/formatters';
import { 
  Search, 
  X, 
  AlertTriangle, 
  CreditCard, 
  Building2, 
  FileText, 
  ArrowRight,
  Loader2,
  CornerDownLeft
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIncident: (id: string) => void;
  onSelectTransaction: (tx: PaymentTransaction) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectIncident,
  onSelectTransaction,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    incidents: Incident[];
    transactions: PaymentTransaction[];
    merchants: Array<{ id: string; name: string; tier: string; txCount: number }>;
    auditEvents: AuditLogEntry[];
  }>({
    incidents: [],
    transactions: [],
    merchants: [],
    auditEvents: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ incidents: [], transactions: [], merchants: [], auditEvents: [] });
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ incidents: [], transactions: [], merchants: [], auditEvents: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(query.trim());
        setResults(res);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasResults =
    results.incidents.length > 0 ||
    results.transactions.length > 0 ||
    results.merchants.length > 0 ||
    results.auditEvents.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search incidents, transactions (e.g. pay_...), merchants, error codes..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-sans"
          />
          {loading && <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />}
          {query && !loading && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded bg-slate-100 cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-4 flex-1">
          {!query.trim() && (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <div className="flex justify-center">
                <Search className="w-8 h-8 text-slate-300 stroke-1" />
              </div>
              <p className="font-medium text-slate-600">Quick Global Search</p>
              <p>Type an incident ID, transaction ID, merchant name, or error code.</p>
              <div className="flex justify-center gap-2 pt-2">
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">HDFC</span>
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">TIMEOUT</span>
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">Flipkart</span>
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">UPI</span>
              </div>
            </div>
          )}

          {query.trim() && !loading && !hasResults && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching incidents, transactions, or merchants found for "{query}".
            </div>
          )}

          {/* Incidents Group */}
          {results.incidents.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-2 text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Incidents ({results.incidents.length})
              </div>
              {results.incidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => {
                    onSelectIncident(inc.id);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-200 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-0.5 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-700">{inc.id}</span>
                      <Badge severity={inc.severity} size="sm" />
                      <Badge status={inc.status} size="sm" />
                    </div>
                    <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-900 line-clamp-1">
                      {inc.title}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Transactions Group */}
          {results.transactions.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-2 text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                Transactions ({results.transactions.length})
              </div>
              {results.transactions.map((tx) => (
                <div
                  key={tx.transactionId}
                  onClick={() => {
                    onSelectTransaction(tx);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-800">{tx.transactionId}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                        tx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {tx.status}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{tx.paymentMethod} • {tx.bank}</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {tx.merchantName} • <strong className="text-slate-900">{formatINR(tx.amount)}</strong>
                      {tx.errorCode && <span className="text-rose-600 font-mono ml-2">({tx.errorCode})</span>}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-700 shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Merchants Group */}
          {results.merchants.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-2 text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-500" />
                Merchants ({results.merchants.length})
              </div>
              {results.merchants.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-xl bg-slate-50/60 border border-slate-200/60 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900">{m.name}</span>
                    <div className="text-[11px] text-slate-500 font-mono">
                      ID: {m.id} • Tier: {m.tier}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-600 font-semibold">
                    {m.txCount} Sample Txns
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Audit Events Group */}
          {results.auditEvents.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-2 text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Audit Logs ({results.auditEvents.length})
              </div>
              {results.auditEvents.map((a) => (
                <div
                  key={a.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="font-bold text-slate-800">{a.action}</span>
                    <span className="text-slate-400">{new Date(a.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] line-clamp-1">{a.outputSummary}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">ESC</kbd> to close</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">⌘K</kbd> anywhere</span>
          </div>
          <span>Razorpay</span>
        </div>
      </div>
    </div>
  );
};
