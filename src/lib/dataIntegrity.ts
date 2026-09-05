import { Incident, RecoveryBatch, RecoveryScorecardData } from '../types';

export interface IntegrityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates count hierarchy:
 * affected >= eligible >= attempted >= recovered
 */
export function validateRecoveryCounts(counts: {
  affected: number;
  eligible: number;
  attempted: number;
  recovered: number;
}): IntegrityValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (counts.affected < 0 || counts.eligible < 0 || counts.attempted < 0 || counts.recovered < 0) {
    errors.push('Transaction counts cannot be negative.');
  }

  if (counts.eligible > counts.affected) {
    errors.push(`Eligible transactions (${counts.eligible}) cannot exceed affected transactions (${counts.affected}).`);
  }

  if (counts.attempted > counts.eligible) {
    errors.push(`Attempted transactions (${counts.attempted}) cannot exceed eligible transactions (${counts.eligible}).`);
  }

  if (counts.recovered > counts.attempted && counts.attempted > 0) {
    errors.push(`Recovered transactions (${counts.recovered}) cannot exceed attempted transactions (${counts.attempted}).`);
  }

  if (counts.recovered > counts.affected) {
    errors.push(`Recovered transactions (${counts.recovered}) cannot exceed total affected transactions (${counts.affected}).`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates financial hierarchy:
 * revenueAtRisk >= recoverableRevenue >= revenueRecovered
 * remainingExposure === revenueAtRisk - revenueRecovered
 */
export function validateRecoveryFinancials(financials: {
  revenueAtRisk: number;
  recoverableRevenue: number;
  revenueRecovered: number;
  remainingExposure?: number;
}): IntegrityValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (financials.revenueAtRisk < 0 || financials.recoverableRevenue < 0 || financials.revenueRecovered < 0) {
    errors.push('Financial values cannot be negative.');
  }

  if (financials.recoverableRevenue > financials.revenueAtRisk) {
    errors.push(`Recoverable revenue (₹${financials.recoverableRevenue}) cannot exceed revenue at risk (₹${financials.revenueAtRisk}).`);
  }

  if (financials.revenueRecovered > financials.recoverableRevenue && financials.recoverableRevenue > 0) {
    errors.push(`Revenue recovered (₹${financials.revenueRecovered}) cannot exceed recoverable revenue (₹${financials.recoverableRevenue}).`);
  }

  if (financials.revenueRecovered > financials.revenueAtRisk) {
    errors.push(`Revenue recovered (₹${financials.revenueRecovered}) cannot exceed total revenue at risk (₹${financials.revenueAtRisk}).`);
  }

  if (financials.remainingExposure !== undefined) {
    const expectedRemaining = Math.max(0, financials.revenueAtRisk - financials.revenueRecovered);
    if (Math.abs(financials.remainingExposure - expectedRemaining) > 5) {
      warnings.push(`Remaining exposure (₹${financials.remainingExposure}) differs from expected (₹${expectedRemaining}).`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates that an Execution Batch is internally consistent
 */
export function validateBatchConsistency(batch: RecoveryBatch): IntegrityValidationResult {
  const countCheck = validateRecoveryCounts({
    affected: batch.affectedTransactions ?? batch.totalTransactions,
    eligible: batch.eligibleTransactions,
    attempted: batch.attemptedTransactions,
    recovered: batch.recoveredTransactions,
  });

  const finCheck = validateRecoveryFinancials({
    revenueAtRisk: batch.revenueAtRiskINR,
    recoverableRevenue: batch.estimatedRecoverableINR,
    revenueRecovered: batch.recoveredRevenueINR,
    remainingExposure: batch.revenueStillAtRiskINR,
  });

  const errors = [...countCheck.errors, ...finCheck.errors];
  const warnings = [...countCheck.warnings, ...finCheck.warnings];

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates that an Incident and its Scorecard are fully consistent
 */
export function validateIncidentConsistency(incident: Incident): IntegrityValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const countCheck = validateRecoveryCounts({
    affected: incident.affectedTransactions,
    eligible: incident.recoverableTransactions,
    attempted: incident.scorecard?.attemptedTxns ?? incident.recoveryBatch?.attemptedTransactions ?? 0,
    recovered: incident.scorecard?.recoveredTxns ?? incident.recoveryBatch?.recoveredTransactions ?? 0,
  });
  errors.push(...countCheck.errors);
  warnings.push(...countCheck.warnings);

  const finCheck = validateRecoveryFinancials({
    revenueAtRisk: incident.revenueAtRisk,
    recoverableRevenue: incident.estimatedRecoverableRevenue,
    revenueRecovered: incident.recoveredRevenue,
    remainingExposure: incident.revenueStillAtRisk,
  });
  errors.push(...finCheck.errors);
  warnings.push(...finCheck.warnings);

  // Cross-check Scorecard if present
  if (incident.scorecard) {
    if (incident.scorecard.totalAffectedTxns !== incident.affectedTransactions) {
      errors.push(`Scorecard affected transactions (${incident.scorecard.totalAffectedTxns}) does not match incident affected transactions (${incident.affectedTransactions}).`);
    }
    if (incident.scorecard.revenueAtRiskINR !== incident.revenueAtRisk) {
      errors.push(`Scorecard revenue at risk (₹${incident.scorecard.revenueAtRiskINR}) does not match incident revenue at risk (₹${incident.revenueAtRisk}).`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates that no duplicate transaction IDs are present in a recovery set
 */
export function validateNoDuplicateRecovery(transactionIds: string[]): IntegrityValidationResult {
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const id of transactionIds) {
    if (seen.has(id)) {
      duplicates.push(id);
    } else {
      seen.add(id);
    }
  }

  return {
    isValid: duplicates.length === 0,
    errors: duplicates.length > 0 ? [`Duplicate transaction IDs detected: ${duplicates.join(', ')}`] : [],
    warnings: [],
  };
}
