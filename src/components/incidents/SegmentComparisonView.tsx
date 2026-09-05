import React, { useState } from 'react';
import { DimensionSegment, Incident } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { formatINR } from '../../lib/formatters';
import { 
  Layers, 
  Building2, 
  CreditCard, 
  Network, 
  MapPin, 
  Smartphone, 
  Briefcase, 
  AlertCircle,
  TrendingDown,
  Info
} from 'lucide-react';

interface SegmentComparisonViewProps {
  incident: Incident;
  className?: string;
}

type DimensionType = 'Bank' | 'Payment Method' | 'Route' | 'Region' | 'Device' | 'Merchant Segment' | 'Error Code';

export const SegmentComparisonView: React.FC<SegmentComparisonViewProps> = ({
  incident,
  className = '',
}) => {
  const [selectedDimension, setSelectedDimension] = useState<DimensionType>('Bank');

  // Fallback synthetic cohorts if not in incident object
  const defaultSegments: DimensionSegment[] = incident.investigation?.segmentBreakdown || [
    // Bank
    { dimension: 'Bank', name: 'HDFC Bank', transactions: 1248, successRate: 49.6, failureRate: 50.4, changeVsBaseline: '-43.8 pp', revenueAtRisk: 845000, isPrimaryContributor: true },
    { dimension: 'Bank', name: 'ICICI Bank', transactions: 1042, successRate: 94.1, failureRate: 5.9, changeVsBaseline: '+0.6 pp', revenueAtRisk: 12000, isPrimaryContributor: false },
    { dimension: 'Bank', name: 'State Bank of India', transactions: 960, successRate: 92.8, failureRate: 7.2, changeVsBaseline: '-0.7 pp', revenueAtRisk: 18400, isPrimaryContributor: false },
    { dimension: 'Bank', name: 'Axis Bank', transactions: 780, successRate: 93.4, failureRate: 6.6, changeVsBaseline: '-0.1 pp', revenueAtRisk: 9500, isPrimaryContributor: false },
    { dimension: 'Bank', name: 'Kotak Mahindra Bank', transactions: 510, successRate: 94.6, failureRate: 5.4, changeVsBaseline: '+1.1 pp', revenueAtRisk: 4200, isPrimaryContributor: false },

    // Method
    { dimension: 'Payment Method', name: 'UPI', transactions: 2480, successRate: 58.2, failureRate: 41.8, changeVsBaseline: '-35.2 pp', revenueAtRisk: 812000, isPrimaryContributor: true },
    { dimension: 'Payment Method', name: 'Cards', transactions: 1240, successRate: 93.8, failureRate: 6.2, changeVsBaseline: '+0.4 pp', revenueAtRisk: 22000, isPrimaryContributor: false },
    { dimension: 'Payment Method', name: 'Netbanking', transactions: 610, successRate: 91.2, failureRate: 8.8, changeVsBaseline: '-2.3 pp', revenueAtRisk: 34000, isPrimaryContributor: false },
    { dimension: 'Payment Method', name: 'Wallet', transactions: 210, successRate: 96.2, failureRate: 3.8, changeVsBaseline: '+2.7 pp', revenueAtRisk: 1100, isPrimaryContributor: false },

    // Route
    { dimension: 'Route', name: 'HDFC_DIRECT_V3', transactions: 1180, successRate: 47.8, failureRate: 52.2, changeVsBaseline: '-46.2 pp', revenueAtRisk: 825000, isPrimaryContributor: true },
    { dimension: 'Route', name: 'RAZORPAY_SMART_ROUTER_SECONDARY', transactions: 920, successRate: 95.4, failureRate: 4.6, changeVsBaseline: '+1.4 pp', revenueAtRisk: 8900, isPrimaryContributor: false },
    { dimension: 'Route', name: 'ICICI_GATEWAY_V2', transactions: 1040, successRate: 94.1, failureRate: 5.9, changeVsBaseline: '+0.6 pp', revenueAtRisk: 12000, isPrimaryContributor: false },
    { dimension: 'Route', name: 'SBI_UPI_SWITCH_V1', transactions: 960, successRate: 92.8, failureRate: 7.2, changeVsBaseline: '-0.7 pp', revenueAtRisk: 18400, isPrimaryContributor: false },

    // Region
    { dimension: 'Region', name: 'West (Mumbai/Pune)', transactions: 1420, successRate: 68.4, failureRate: 31.6, changeVsBaseline: '-25.1 pp', revenueAtRisk: 380000, isPrimaryContributor: false },
    { dimension: 'Region', name: 'North (Delhi/NCR)', transactions: 1380, successRate: 71.2, failureRate: 28.8, changeVsBaseline: '-22.3 pp', revenueAtRisk: 290000, isPrimaryContributor: false },
    { dimension: 'Region', name: 'South (Bangalore/Hyd)', transactions: 1210, successRate: 74.0, failureRate: 26.0, changeVsBaseline: '-19.5 pp', revenueAtRisk: 145000, isPrimaryContributor: false },
    { dimension: 'Region', name: 'East (Kolkata)', transactions: 530, successRate: 82.5, failureRate: 17.5, changeVsBaseline: '-11.0 pp', revenueAtRisk: 30000, isPrimaryContributor: false },

    // Device
    { dimension: 'Device', name: 'Android', transactions: 2750, successRate: 71.4, failureRate: 28.6, changeVsBaseline: '-22.1 pp', revenueAtRisk: 490000, isPrimaryContributor: false },
    { dimension: 'Device', name: 'iOS', transactions: 1120, successRate: 74.8, failureRate: 25.2, changeVsBaseline: '-18.7 pp', revenueAtRisk: 260000, isPrimaryContributor: false },
    { dimension: 'Device', name: 'Web Desktop', transactions: 580, successRate: 78.2, failureRate: 21.8, changeVsBaseline: '-15.3 pp', revenueAtRisk: 85000, isPrimaryContributor: false },
    { dimension: 'Device', name: 'POS Terminal', transactions: 90, successRate: 91.1, failureRate: 8.9, changeVsBaseline: '-2.4 pp', revenueAtRisk: 10000, isPrimaryContributor: false },

    // Merchant Segment
    { dimension: 'Merchant Segment', name: 'Enterprise', transactions: 1850, successRate: 72.1, failureRate: 27.9, changeVsBaseline: '-21.4 pp', revenueAtRisk: 520000, isPrimaryContributor: false },
    { dimension: 'Merchant Segment', name: 'Mid-Market', transactions: 1420, successRate: 73.5, failureRate: 26.5, changeVsBaseline: '-20.0 pp', revenueAtRisk: 210000, isPrimaryContributor: false },
    { dimension: 'Merchant Segment', name: 'SMB', transactions: 980, successRate: 75.2, failureRate: 24.8, changeVsBaseline: '-18.3 pp', revenueAtRisk: 95000, isPrimaryContributor: false },
    { dimension: 'Merchant Segment', name: 'D2C', transactions: 290, successRate: 76.9, failureRate: 23.1, changeVsBaseline: '-16.6 pp', revenueAtRisk: 20000, isPrimaryContributor: false },

    // Error Code
    { dimension: 'Error Code', name: 'BANK_GATEWAY_TIMEOUT (76.8%)', transactions: 432, successRate: 0.0, failureRate: 100.0, changeVsBaseline: '+75.6 pp', revenueAtRisk: 845000, isPrimaryContributor: true },
    { dimension: 'Error Code', name: 'CUSTOMER_DROPOUT_2FA (12.4%)', transactions: 68, successRate: 0.0, failureRate: 100.0, changeVsBaseline: '+1.2 pp', revenueAtRisk: 42000, isPrimaryContributor: false },
    { dimension: 'Error Code', name: 'INSUFFICIENT_FUNDS (6.2%)', transactions: 34, successRate: 0.0, failureRate: 100.0, changeVsBaseline: '-0.4 pp', revenueAtRisk: 18000, isPrimaryContributor: false },
    { dimension: 'Error Code', name: 'INCORRECT_UPI_PIN (4.6%)', transactions: 25, successRate: 0.0, failureRate: 100.0, changeVsBaseline: '+0.1 pp', revenueAtRisk: 12000, isPrimaryContributor: false },
  ];

  const dimensions: Array<{ key: DimensionType; label: string; icon: any }> = [
    { key: 'Bank', label: 'Acquirer / Issuer Bank', icon: Building2 },
    { key: 'Payment Method', label: 'Payment Method', icon: CreditCard },
    { key: 'Route', label: 'Gateway Route', icon: Network },
    { key: 'Region', label: 'Geography / Region', icon: MapPin },
    { key: 'Device', label: 'Client Device', icon: Smartphone },
    { key: 'Merchant Segment', label: 'Merchant Tier', icon: Briefcase },
    { key: 'Error Code', label: 'Error Code Distribution', icon: AlertCircle },
  ];

  const filteredSegments = defaultSegments.filter(s => s.dimension === selectedDimension);
  const primaryAnomaly = filteredSegments.find(s => s.isPrimaryContributor);

  return (
    <Card className={`p-6 bg-white border-slate-200/90 shadow-xs space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Multi-Dimensional Cohort & Segment Analysis
          </h4>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>Dimension isolation identifies failure concentration</span>
        </div>
      </div>

      {/* Dimension Pill Selector */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-50 rounded-xl border border-slate-200/80">
        {dimensions.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedDimension(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedDimension === key
                ? 'bg-white text-blue-700 shadow-xs border border-blue-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${selectedDimension === key ? 'text-blue-600' : 'text-slate-400'}`} />
            {label}
          </button>
        ))}
      </div>

      {/* Primary Anomaly Callout */}
      {primaryAnomaly && (
        <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 flex items-start gap-3 text-xs">
          <TrendingDown className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-rose-900">
            <span className="font-bold">Primary Incident Concentration:</span>{' '}
            <span className="font-mono font-bold text-rose-700">{primaryAnomaly.name}</span> contributes{' '}
            <strong className="font-mono">{primaryAnomaly.failureRate}% failure rate</strong> (
            <span className="font-mono">{primaryAnomaly.changeVsBaseline}</span> vs baseline), exposing{' '}
            <strong className="font-mono">{formatINR(primaryAnomaly.revenueAtRisk, true)}</strong> in GMV.
          </div>
        </div>
      )}

      {/* Segment Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
              <th className="pb-2.5 font-semibold">Cohort / Segment Name</th>
              <th className="pb-2.5 font-semibold text-right">Transactions</th>
              <th className="pb-2.5 font-semibold text-right">Success Rate</th>
              <th className="pb-2.5 font-semibold text-right">Failure Rate</th>
              <th className="pb-2.5 font-semibold text-right">Baseline Variance</th>
              <th className="pb-2.5 font-semibold text-right">Revenue at Risk</th>
              <th className="pb-2.5 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSegments.map((seg, idx) => (
              <tr 
                key={idx} 
                className={`hover:bg-slate-50/80 transition-colors ${
                  seg.isPrimaryContributor ? 'bg-rose-50/40 font-medium' : ''
                }`}
              >
                <td className="py-3 pr-3 text-slate-900 font-semibold flex items-center gap-2">
                  {seg.isPrimaryContributor && (
                    <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                  )}
                  {seg.name}
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-600">
                  {seg.transactions.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold">
                  <span className={seg.successRate < 60 ? 'text-rose-600' : seg.successRate < 85 ? 'text-amber-600' : 'text-emerald-600'}>
                    {seg.successRate}%
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-mono font-semibold">
                  <span className={seg.failureRate > 40 ? 'text-rose-600' : 'text-slate-600'}>
                    {seg.failureRate}%
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-mono font-semibold">
                  <span className={seg.changeVsBaseline.startsWith('-') ? 'text-rose-600' : 'text-emerald-600'}>
                    {seg.changeVsBaseline}
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                  {formatINR(seg.revenueAtRisk, true)}
                </td>
                <td className="py-3 pl-3 text-center">
                  {seg.isPrimaryContributor ? (
                    <Badge variant="danger" size="sm">
                      PRIMARY ROOT CAUSE
                    </Badge>
                  ) : seg.successRate < 85 ? (
                    <Badge variant="warning" size="sm">
                      COLLATERAL DEVIATION
                    </Badge>
                  ) : (
                    <Badge variant="success" size="sm">
                      HEALTHY BASELINE
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
