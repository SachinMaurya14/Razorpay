import React, { useState, useEffect } from 'react';
import { PaymentTransaction } from '../types';
import { api } from '../lib/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  Database, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  ArrowUpDown,
  Smartphone,
  CreditCard,
  QrCode
} from 'lucide-react';

interface TransactionsViewProps {
  initialTransactions?: PaymentTransaction[];
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  initialTransactions = [],
}) => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(initialTransactions);
  const [totalCount, setTotalCount] = useState<number>(initialTransactions.length);
  const [loading, setLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);

  const [bankFilter, setBankFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await api.getTransactions({
        bank: bankFilter,
        method: methodFilter,
        status: statusFilter,
        search,
        limit: 50,
      });
      setTransactions(data.transactions);
      setTotalCount(data.total);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [bankFilter, methodFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions();
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'UPI': return <QrCode className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Card': return <CreditCard className="w-3.5 h-3.5 text-blue-600" />;
      default: return <Building2 className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Live Payment Telemetry Stream
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-acquirer transaction stream ingested into the Detection Agent pipeline.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto disabled:opacity-50 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stream
        </button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 bg-white border-slate-200/80 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by txn_id (e.g. pay_8f9...), merchant, or error code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Bank filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-[10px] font-mono uppercase text-slate-500 px-2">Bank:</span>
            {['all', 'HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBankFilter(b)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  bankFilter === b ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {b === 'all' ? 'All' : b.replace(' Bank', '').replace('State Bank of India', 'SBI')}
              </button>
            ))}
          </div>

          {/* Method filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-[10px] font-mono uppercase text-slate-500 px-2">Method:</span>
            {['all', 'UPI', 'Card', 'NetBanking'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethodFilter(m)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  methodFilter === m ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-[10px] font-mono uppercase text-slate-500 px-2">Status:</span>
            {['all', 'SUCCESS', 'FAILED'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  statusFilter === s ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-white border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono uppercase text-[10px]">
                <th className="py-3 px-4 font-semibold">Txn ID & Time</th>
                <th className="py-3 px-4 font-semibold">Merchant</th>
                <th className="py-3 px-4 font-semibold">Bank & Method</th>
                <th className="py-3 px-4 font-semibold">Route</th>
                <th className="py-3 px-4 font-semibold">Amount (INR)</th>
                <th className="py-3 px-4 font-semibold">Latency</th>
                <th className="py-3 px-4 font-semibold">Status / Error</th>
                <th className="py-3 px-4 font-semibold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {transactions.map((tx) => {
                const isSuccess = tx.status === 'SUCCESS' || tx.status === 'success';
                const amountVal = tx.amountINR ?? tx.amount ?? 0;
                const routeVal = tx.acquirerRoute ?? tx.route ?? 'Primary Gateway';
                const tierVal = tx.merchantTier ?? tx.customerSegment ?? 'Enterprise';

                return (
                  <tr 
                    key={tx.transactionId}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono">
                      <span className="text-slate-900 font-bold block">{tx.transactionId}</span>
                      <span className="text-[10px] text-slate-400">
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString() : 'Recent'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {tx.merchantName || 'Merchant'}
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {tierVal}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-800">
                        {getMethodIcon(tx.paymentMethod)}
                        <span>{tx.bank}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {routeVal}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ₹{amountVal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {tx.latencyMs || 250} ms
                    </td>
                    <td className="py-3 px-4">
                      {isSuccess ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          SUCCESS
                        </span>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                            <XCircle className="w-3.5 h-3.5" />
                            FAILED
                          </span>
                          <span className="text-[10px] font-mono text-rose-600 block">
                            {tx.errorCode || 'FAILED'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-blue-600 hover:text-blue-700 font-semibold text-[11px]">
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <Modal
          isOpen={Boolean(selectedTx)}
          onClose={() => setSelectedTx(null)}
          title={`Transaction Telemetry: ${selectedTx.transactionId}`}
          subtitle="Low-level payment payload analyzed by Detection Agent."
          maxWidth="lg"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="text-slate-900 font-bold">{selectedTx.transactionId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Merchant Name:</span>
                <span className="text-slate-800">{selectedTx.merchantName || 'Merchant'} ({selectedTx.merchantTier || selectedTx.customerSegment || 'Enterprise'})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Amount (INR):</span>
                <span className="text-slate-900 font-bold">₹{(selectedTx.amountINR ?? selectedTx.amount ?? 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Bank & Method:</span>
                <span className="text-slate-800">{selectedTx.bank} ({selectedTx.paymentMethod})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Acquirer Route:</span>
                <span className="text-blue-600">{selectedTx.acquirerRoute || selectedTx.route || 'Primary Route'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Latency:</span>
                <span className="text-slate-800">{selectedTx.latencyMs || 250} ms</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Status:</span>
                <span className={(selectedTx.status === 'SUCCESS' || selectedTx.status === 'success') ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {selectedTx.status}
                </span>
              </div>
              {selectedTx.errorCode && (
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Error Code:</span>
                  <span className="text-rose-600 font-bold">{selectedTx.errorCode}</span>
                </div>
              )}
              {selectedTx.errorDescription && (
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Error Detail:</span>
                  <span className="text-slate-700 text-right max-w-xs">{selectedTx.errorDescription}</span>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
