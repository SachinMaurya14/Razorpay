import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../types';
import { api } from '../lib/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  FileText, 
  Search, 
  Filter, 
  ShieldCheck, 
  RefreshCw, 
  Bot, 
  User, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface AuditLogViewProps {
  initialLogs?: AuditLogEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  initialLogs = [],
}) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(initialLogs);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [agentFilter, setAgentFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data.logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (agentFilter !== 'all' && log.agent !== agentFilter) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return (
        log.id.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.outputSummary.toLowerCase().includes(q) ||
        (log.incidentId && log.incidentId.toLowerCase().includes(q))
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
            <FileText className="w-5 h-5 text-emerald-600" />
            Append-Only Audit Trail & Governance
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Chronological record of all AI agent inferences, human-in-the-loop decisions, and routing policy mutations.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto disabled:opacity-50 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Audit Trail
        </button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 bg-white border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit records by action, incident ID, or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 px-2">Agent:</span>
          {['all', 'Detection Agent', 'Investigation Agent', 'Resolution Agent', 'Human Operator'].map((ag) => (
            <button
              key={ag}
              onClick={() => setAgentFilter(ag)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                agentFilter === ag ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {ag === 'all' ? 'All' : ag.replace(' Agent', '')}
            </button>
          ))}
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card className="bg-white border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono uppercase text-[10px]">
                <th className="py-3 px-4 font-semibold">Timestamp & Log ID</th>
                <th className="py-3 px-4 font-semibold">Agent / Operator</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Incident Ref</th>
                <th className="py-3 px-4 font-semibold">Summary & Output</th>
                <th className="py-3 px-4 font-semibold">Risk & Result</th>
                <th className="py-3 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-60" />
                    <p className="font-semibold text-slate-800 text-sm">No Audit Logs Found</p>
                    <p className="text-xs text-slate-400 mt-1">Audit logs will be recorded immutably when incidents, approvals, and mitigations execute.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                const isHuman = log.agent === 'Human Operator';
                const isSuccess = log.executionResult === 'SUCCESS';

                return (
                  <tr 
                    key={log.id} 
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono">
                      <span className="text-slate-900 font-bold block">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent'}</span>
                      <span className="text-[10px] text-slate-400">{log.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {isHuman ? (
                          <User className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <Bot className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        <span className={`font-semibold ${isHuman ? 'text-amber-700' : 'text-slate-800'}`}>
                          {log.agent}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-blue-600">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {log.incidentId || '—'}
                    </td>
                    <td className="py-3 px-4 max-w-sm text-slate-700 truncate">
                      {log.outputSummary}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Badge risk={log.riskLevel} size="sm" />
                        {isSuccess ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-blue-600 hover:text-blue-700 font-semibold text-[11px]">
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Log Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={Boolean(selectedLog)}
          onClose={() => setSelectedLog(null)}
          title={`Audit Record: ${selectedLog.id}`}
          subtitle={`Action ${selectedLog.action} executed at ${new Date(selectedLog.timestamp).toISOString()}`}
          maxWidth="lg"
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Agent:</span>
                <span className="text-slate-900 font-bold">{selectedLog.agent}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Action:</span>
                <span className="text-blue-600 font-bold">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Incident Reference:</span>
                <span className="text-slate-800">{selectedLog.incidentId || 'None'} ({selectedLog.incidentTitle || ''})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Confidence:</span>
                <span className="text-emerald-600 font-bold">{Math.round((selectedLog.confidence || 0.95) * 100)}%</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Execution Result:</span>
                <span className={selectedLog.executionResult === 'SUCCESS' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {selectedLog.executionResult}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">Input Reference:</span>
                <p className="text-slate-800 bg-white p-2.5 rounded border border-slate-200">
                  {selectedLog.inputReference}
                </p>
              </div>
              <div className="pt-1">
                <span className="text-slate-500 block mb-1">Output Summary:</span>
                <p className="text-slate-800 bg-white p-2.5 rounded border border-slate-200">
                  {selectedLog.outputSummary}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
