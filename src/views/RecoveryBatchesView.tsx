import React, { useState, useEffect } from 'react';
import { 
  RecoveryScorecardData, 
  RecoveryOpportunity, 
  MerchantImpactItem, 
  RecoveryBatch,
  RecoveryCohort
} from '../types';
import { api } from '../lib/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { RecoveryScorecard } from '../components/incidents/RecoveryScorecard';
import { RecoveryCohortsTable } from '../components/incidents/RecoveryCohortsTable';
import { RecoveryFunnel } from '../components/incidents/RecoveryFunnel';
import { formatINR } from '../lib/formatters';
import { 
  Layers, 
  ShieldCheck, 
  DollarSign, 
  Building2, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Filter, 
  ArrowUpRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

interface RecoveryBatchesViewProps {
  onSelectIncident?: (incidentId: string) => void;
  onSelectTransaction?: (txId: string) => void;
  activeIncidentId?: string;
}

export const RecoveryBatchesView: React.FC<RecoveryBatchesViewProps> = ({
  onSelectIncident,
  onSelectTransaction,
  activeIncidentId,
}) => {
  const [scorecard, setScorecard] = useState<RecoveryScorecardData | null>(null);
  const [opportunities, setOpportunities] = useState<RecoveryOpportunity[]>([]);
  const [merchants, setMerchants] = useState<MerchantImpactItem[]>([]);
  const [batches, setBatches] = useState<RecoveryBatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'cohorts' | 'merchants' | 'opportunities' | 'batches'>('cohorts');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sc, opps, merch, bts] = await Promise.all([
        api.getRecoveryScorecard(),
        api.getRecoveryOpportunities(),
        api.getMerchantImpact(),
        api.getRecoveryBatches(),
      ]);
      setScorecard(sc);
      setOpportunities(opps.opportunities);
      setMerchants(merch.merchants);
      setBatches(bts.batches);
    } catch (err) {
      console.error('Failed to load recovery data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Aggregated cohorts from opportunities
  const allCohorts: RecoveryCohort[] = opportunities.flatMap(o => o.cohorts || []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Deterministic Recovery Operations
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold">
              Revenue Recovery Control
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Segment-level transaction protection, deterministic cohort classifications, and merchant impact tracking
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Scorecard
        </button>
      </div>

      {/* Recovery Scorecard */}
      {scorecard && (
        <RecoveryScorecard scorecard={scorecard} />
      )}

      {/* Recovery Funnel */}
      {scorecard && (
        <RecoveryFunnel 
          scorecard={scorecard} 
          cohorts={allCohorts}
        />
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('cohorts')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'cohorts'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Recovery Cohorts ({allCohorts.length || 4})
        </button>

        <button
          onClick={() => setActiveTab('merchants')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'merchants'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Merchant Impact Breakdown ({merchants.length})
        </button>

        <button
          onClick={() => setActiveTab('opportunities')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'opportunities'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Active Opportunities ({opportunities.length})
        </button>

        <button
          onClick={() => setActiveTab('batches')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'batches'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Execution Batches ({batches.length})
        </button>
      </div>

      {/* Tab 1: Cohorts Table */}
      {activeTab === 'cohorts' && (
        <RecoveryCohortsTable 
          cohorts={allCohorts}
          onSelectTransaction={onSelectTransaction}
        />
      )}

      {/* Tab 2: Merchant Impact Breakdown */}
      {activeTab === 'merchants' && (
        <Card className="p-5 sm:p-6 bg-white border-slate-200/90 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Merchant Impact & GMV Salvage Ledger
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time isolation of customer checkout exposure, tier SLA adherence, and recovered volume
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              Sorted by GMV at Risk
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-mono uppercase text-slate-400 font-semibold bg-slate-50/50">
                  <th className="py-2.5 px-3">Merchant</th>
                  <th className="py-2.5 px-3">Tier</th>
                  <th className="py-2.5 px-3">Success Rate</th>
                  <th className="py-2.5 px-3">Revenue at Risk</th>
                  <th className="py-2.5 px-3">Estimated Recoverable</th>
                  <th className="py-2.5 px-3">Salvaged GMV</th>
                  <th className="py-2.5 px-3">Active Incident</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-sans">
                {merchants.map((m) => (
                  <tr key={m.merchantId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{m.merchantName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{m.merchantId}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        m.tier === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                        m.tier === 'High Growth' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {m.tier}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span className={`font-bold ${
                        m.successRate >= 90 ? 'text-emerald-600' :
                        m.successRate >= 70 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {m.successRate}%
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {formatINR(m.revenueAtRisk, true)}
                    </td>

                    <td className="py-3 px-3 font-mono text-blue-600 font-bold">
                      {formatINR(m.recoverableRevenue, true)}
                    </td>

                    <td className="py-3 px-3 font-mono text-emerald-700 font-extrabold">
                      {formatINR(m.recoveredRevenue, true)}
                    </td>

                    <td className="py-3 px-3">
                      {m.activeIncidents > 0 ? (
                        <button
                          onClick={() => onSelectIncident && activeIncidentId && onSelectIncident(activeIncidentId)}
                          className="text-blue-600 hover:text-blue-800 font-mono font-bold hover:underline cursor-pointer"
                        >
                          {activeIncidentId || 'Active'}
                        </button>
                      ) : (
                        <span className="text-slate-400 font-mono">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        m.status === 'PROTECTED' || m.status === 'NOMINAL' ? 'bg-emerald-100 text-emerald-800' :
                        m.status === 'RECOVERING' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Active Opportunities */}
      {activeTab === 'opportunities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp) => (
            <Card key={opp.opportunityId} className="p-5 bg-white border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                    {opp.opportunityId}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    opp.status === 'RECOVERED' ? 'bg-emerald-100 text-emerald-800' :
                    opp.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {opp.status}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 mt-2">
                  {opp.title}
                </h4>

                <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Total Txns</span>
                    <span className="text-sm font-extrabold text-slate-900">{opp.totalAffectedTxns}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Revenue Risk</span>
                    <span className="text-sm font-extrabold text-rose-600">{formatINR(opp.revenueAtRiskINR, true)}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Recoverable</span>
                    <span className="text-sm font-extrabold text-blue-600">{formatINR(opp.estimatedRecoverableINR, true)}</span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-600 space-y-1">
                  <div><strong>Strategy:</strong> {opp.strategyName}</div>
                  <div><strong>Scope:</strong> {opp.scope}</div>
                  <div><strong>Target Rail:</strong> <span className="font-mono font-bold text-blue-700">{opp.targetRail}</span></div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500">
                  Incident: {opp.incidentId}
                </span>
                <button
                  onClick={() => onSelectIncident && onSelectIncident(opp.incidentId)}
                  className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  View Incident Workflow <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 4: Execution Batches */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          {batches.map((b) => (
            <Card key={b.batchId} className="p-5 bg-white border-slate-200/90 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 text-sm">{b.batchId}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="font-mono text-xs text-slate-600">{b.incidentId}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    b.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {b.status}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Strategy: {b.strategy}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Total Txns</span>
                  <span className="text-base font-extrabold text-slate-900">{b.totalCount}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Processed</span>
                  <span className="text-base font-extrabold text-blue-600">{b.processedCount}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Recovered</span>
                  <span className="text-base font-extrabold text-emerald-600">{b.successCount}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Salvaged GMV</span>
                  <span className="text-base font-extrabold text-slate-900">{formatINR(b.recoveredAmountINR, true)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
