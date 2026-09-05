/**
 * Razorpay AI Operations Formatting & Calculation Utilities
 */

/**
 * Formats a number into Indian Rupee notation (e.g. ₹8,45,000 or ₹8.45L / ₹1.24Cr)
 */
export function formatINR(amount: number | undefined | null, compact: boolean = false): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }

  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (compact) {
    if (abs >= 10000000) {
      // Crores
      return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`;
    }
    if (abs >= 100000) {
      // Lakhs
      return `${sign}₹${(abs / 100000).toFixed(2)}L`;
    }
    if (abs >= 1000) {
      // Thousands
      return `${sign}₹${(abs / 1000).toFixed(1)}k`;
    }
    return `${sign}₹${abs.toLocaleString('en-IN')}`;
  }

  return `${sign}₹${abs.toLocaleString('en-IN')}`;
}

/**
 * Formats percentage
 */
export function formatPercent(value: number | undefined | null, decimals: number = 1): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.0%';
  }
  return `${value.toFixed(decimals)}%`;
}

/**
 * Deterministic Incident Health Score (0 - 100)
 * Evaluates:
 * 1. Deviation from nominal baseline (max 40 pts)
 * 2. Revenue exposure / risk (max 30 pts)
 * 3. Affected transaction volume (max 20 pts)
 * 4. Error distribution concentration (max 10 pts)
 */
export function calculateIncidentHealthScore(params: {
  successRateDelta: number; // e.g. -43.8
  revenueAtRisk: number; // in INR
  affectedTxns: number;
  errorConcentration?: number; // 0 - 1
}): {
  score: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  label: string;
  color: string;
} {
  const deltaImpact = Math.min(40, (Math.abs(params.successRateDelta) / 50) * 40);
  const revenueImpact = Math.min(30, (params.revenueAtRisk / 1000000) * 30);
  const volumeImpact = Math.min(20, (params.affectedTxns / 500) * 20);
  const errorImpact = (params.errorConcentration || 0.8) * 10;

  const score = Math.min(100, Math.max(5, Math.round(deltaImpact + revenueImpact + volumeImpact + errorImpact)));

  if (score >= 75) {
    return { score, severity: 'critical', label: 'CRITICAL SEVERITY', color: 'rose' };
  } else if (score >= 50) {
    return { score, severity: 'high', label: 'HIGH SEVERITY', color: 'amber' };
  } else if (score >= 25) {
    return { score, severity: 'medium', label: 'MODERATE IMPACT', color: 'blue' };
  } else {
    return { score, severity: 'low', label: 'LOW / ISOLATED', color: 'emerald' };
  }
}
