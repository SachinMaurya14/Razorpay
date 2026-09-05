export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 
  | 'DETECTED' 
  | 'INVESTIGATING' 
  | 'RESOLUTION' 
  | 'VERIFIED' 
  | 'RESOLVED' 
  | 'DISMISSED';

export type AgentStatusType = 
  | 'idle' 
  | 'monitoring' 
  | 'running' 
  | 'waiting' 
  | 'approval_required' 
  | 'completed' 
  | 'failed';

export type RiskLevel = 'low' | 'medium' | 'high';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'not_required';

export type ExecutionStatus = 'pending' | 'executed' | 'failed';

export type VerificationStatus = 'pending' | 'improving' | 'resolved' | 'unresolved';

export type PaymentStatus = 'success' | 'failed' | 'pending' | 'reversed';

export type PaymentMethod = 'UPI' | 'Cards' | 'Netbanking' | 'Wallet';

export type BankName = 'HDFC Bank' | 'ICICI Bank' | 'State Bank of India' | 'Axis Bank' | 'Kotak Mahindra Bank' | 'Yes Bank';

export type RecoverabilityState = 
  | 'RECOVERABLE' 
  | 'POSSIBLY_RECOVERABLE' 
  | 'NOT_RECOVERABLE' 
  | 'REQUIRES_HUMAN_REVIEW' 
  | 'ALREADY_RESOLVED';

export type RecoveryOutcomeState = 
  | 'RECOVERED' 
  | 'PARTIALLY_RECOVERED' 
  | 'UNRECOVERED' 
  | 'ESCALATED' 
  | 'NOT_ELIGIBLE';

export type RecoveryOpportunityStatus = 
  | 'IDENTIFIED' 
  | 'QUALIFIED' 
  | 'READY' 
  | 'IN_PROGRESS' 
  | 'PARTIALLY_RECOVERED' 
  | 'RECOVERED' 
  | 'EXPIRED' 
  | 'ESCALATED';

export interface RecoveryOpportunity {
  id: string; // e.g. "OPP-001"
  incidentId: string;
  cohortId: string; // e.g. "COHORT-A"
  name: string;
  transactionIds: string[];
  cause: string;
  recoverability: RecoverabilityState;
  revenueAtRisk: number;
  estimatedRecoverableRevenue: number;
  eligibleRevenue: number;
  recommendedStrategy: string;
  confidence: number;
  priority: number; // 1-100 deterministic priority score
  priorityRationale: string;
  status: RecoveryOpportunityStatus;
  recoveryWindowHours: number; // e.g. 24
  recoveryWindowExpiresAt: string;
  recoveryWindowRemainingMinutes: number;
  attemptsUsed: number;
  maxAttemptsAllowed: number;
  stoppingReason?: string;
  policyStatus: 'PASSED' | 'BLOCKED' | 'REQUIRES_OVERRIDE';
  policyReason?: string;
  recoveredRevenue?: number;
  recoveredTransactions?: number;
}

export interface RecoveryCohort {
  id: string; // e.g. "COHORT-A", "COHORT-B", "COHORT-C", "COHORT-D"
  name: string; // e.g. "Cohort A: Gateway Timeout (504)"
  cause: string;
  recoverability: RecoverabilityState;
  transactionCount: number;
  revenueAtRisk: number;
  recoverableRevenue: number;
  recommendedStrategy: string;
  recommendedActionType: string;
  rationale: string;
  evidence: string[];
  sampleTransactionIds: string[];
  attempts: number;
  maxAttempts: number;
  recoveredCount: number;
  recoveredRevenue: number;
  recoveryRatePercent: number;
  status: 'QUALIFIED' | 'READY' | 'EXECUTING' | 'RECOVERED' | 'EXCLUDED' | 'ESCALATED';
  stoppingRule: string;
  stoppingReason?: string;
}

export interface RecoveryPolicyValidation {
  isValid: boolean;
  actionType: string;
  eligibilityCheck: 'PASSED' | 'FAILED';
  retryLimitCheck: 'PASSED' | 'FAILED';
  duplicateSafetyCheck: 'PASSED' | 'BLOCKED_DUPLICATE';
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  approvalRationale: string;
  reversibility: 'Instant (1-click)' | 'Fast (< 30s)' | 'Requires Manual Rollback' | 'Irreversible';
  scopeLimitPercent: number;
  policyDecision: 'APPROVED_FOR_EXECUTION' | 'REQUIRES_HUMAN_APPROVAL' | 'BLOCKED_BY_POLICY';
  policyNotes: string;
  stoppingCriteria: string[];
}

export interface StrategyComparisonOption {
  strategyId: string;
  strategyName: string;
  actionType: string;
  rank: number;
  expectedRecoveryRatePercent: number;
  expectedRevenueRecoveredINR: number;
  risk: RiskLevel;
  confidence: number;
  additionalHopLatencyMs: number;
  tradeoffs: string;
  isRecommended: boolean;
  requiresApproval: boolean;
}

export interface RecoveryScorecardData {
  revenueAtRiskINR: number;
  estimatedRecoverableINR: number;
  recoveredRevenueINR: number;
  revenueStillAtRiskINR: number;
  recoveryRatePercent: number;
  transactionRecoveryRatePercent: number;
  totalAffectedTxns: number;
  eligibleTxns: number;
  attemptedTxns: number;
  recoveredTxns: number;
  unrecoveredTxns: number;
  operationalCostINR: number;
  netRecoveredValueINR: number;
  recoveryQualityScore: number; // 0-100 deterministic quality score
  recoveryQualityTier: 'OPTIMAL' | 'ACCEPTABLE' | 'DEGRADED' | 'FAILED';
  qualityExplanation: string;
}

export interface MerchantImpactItem {
  merchantId: string;
  merchantName: string;
  tier: string;
  segment: string;
  successRate: number;
  revenueAtRisk: number;
  recoverableRevenue: number;
  recoveredRevenue: number;
  activeIncidents: number;
  recoveryRatePercent: number;
  status: 'PROTECTED' | 'RECOVERING' | 'IMPACTED' | 'NOMINAL';
}

export interface ExecutiveIncidentSummary {
  headline: string;
  revenueImpactStatement: string;
  recoverabilitySummary: string;
  actionTakenStatement: string;
  outcomeVerification: string;
  residualRiskNotice: string;
}

export interface RecoveryBatch {
  id: string; // e.g., "RB-2026-001"
  incidentId: string;
  createdAt: string;
  totalTransactions: number;
  affectedTransactions: number;
  eligibleTransactions: number;
  attemptedTransactions: number;
  recoveredTransactions: number;
  unrecoveredTransactions: number;
  revenueAtRiskINR: number;
  estimatedRecoverableINR: number;
  recoveredRevenueINR: number;
  revenueStillAtRiskINR: number;
  recoveryRatePercent: number; // recoveredRevenue / estimatedRecoverable
  transactionRecoveryRatePercent: number; // recoveredTxns / eligibleTxns
  strategyUsed: string;
  status: 'PENDING_APPROVAL' | 'READY' | 'QUEUED' | 'EXECUTING' | 'RECOVERED' | 'PARTIALLY_RECOVERED' | 'FAILED' | 'ROLLED_BACK' | 'STOPPED';
  stoppingReason?: string;
  maxRetryCount?: number;
  attemptsCount?: number;
  circuitBreakerTripped?: boolean;
  updatedAt?: string;
}

export interface PaymentTransaction {
  transactionId: string;
  merchantId: string;
  merchantName: string;
  timestamp: string;
  amount: number; // in INR
  amountINR?: number; // alias in INR
  currency: string;
  paymentMethod: PaymentMethod;
  bank: BankName;
  status: PaymentStatus;
  errorCode?: string;
  errorMessage?: string;
  errorDescription?: string;
  latencyMs: number;
  region: string;
  deviceType: 'iOS' | 'Android' | 'Web' | 'POS';
  route: string;
  acquirerRoute?: string;
  customerSegment: 'Enterprise' | 'Mid-Market' | 'SMB' | 'D2C';
  merchantTier?: string;
  recoverabilityState?: RecoverabilityState;
  recoveryOutcome?: RecoveryOutcomeState;
  recoveryAttempts?: number;
  recoveryStrategyUsed?: string;
  stoppingReason?: string;
  isDuplicateChecked?: boolean;
}

export interface DetectionSignal {
  signalName: string;
  observedValue: string | number;
  baselineValue: string | number;
  deviation: string;
  significance: 'low' | 'medium' | 'high';
  category: 'success_rate' | 'latency' | 'error_code' | 'route_volume' | 'bank_downtime';
}

export interface DetectionOutput {
  incidentId: string;
  detected: boolean;
  incidentType: string;
  severity: IncidentSeverity;
  confidence: number; // 0.0 - 1.0
  affectedTransactions: number;
  estimatedRevenueAtRisk: number; // in INR
  summary: string;
  signals: DetectionSignal[];
  timestamp: string;
  affectedSegments: string[];
}

export interface EvidenceItem {
  id: string;
  type?: 'metric_deviation' | 'latency_spike' | 'error_clustering' | 'route_drop' | 'cohort_isolation';
  dimension: string; // e.g., "Bank Route", "Error Code", "Latency p95", "Merchant Tier"
  metric: string;
  baselineValue: string | number;
  observedValue: string | number;
  delta: string;
  source?: string; // e.g. "Telemetry Aggregator v2", "Ingress Gate Switch", "NPCI UPI Gateway Log"
  significance: 'Critical' | 'High' | 'Moderate' | 'Informational';
  explanation: string;
}

export interface Hypothesis {
  hypothesis: string;
  probability: number; // 0.0 - 1.0
  category: 'issuer_infrastructure' | 'network_gateway' | 'smart_routing' | 'auth_timeout' | 'merchant_integration';
  rationale: string;
  status: 'Confirmed Root Cause' | 'Secondary Factor' | 'Ruled Out';
  supportingEvidence?: string[];
  refutingEvidence?: string[];
}

export interface FinancialExposure {
  grossAffectedVolume: number;
  revenueAtRisk: number;
  estimatedRecoverableVolume: number;
  revenueActuallyLost: number;
  protectedRevenue: number;
  currency: string;
  exposureSummary: string;
}

export interface DimensionSegment {
  dimension: 'Bank' | 'Payment Method' | 'Route' | 'Region' | 'Device' | 'Merchant Segment' | 'Error Code';
  name: string;
  transactions: number;
  successRate: number;
  failureRate: number;
  changeVsBaseline: string; // e.g. "-43.8 pp"
  revenueAtRisk: number;
  isPrimaryContributor: boolean;
}

export interface InvestigationOutput {
  incidentId: string;
  rootCause: string;
  rootCauseCategory: string;
  confidence: number; // 0.0 - 1.0 (Investigation Confidence)
  affectedSegments: string[];
  evidence: EvidenceItem[];
  affectedTransactions: number;
  affectedMerchants: number;
  estimatedRevenueAtRisk: number;
  recoverableTransactions?: number;
  estimatedRecoverableRevenue?: number;
  recoverabilityBreakdown?: {
    recoverableCount: number;
    recoverableRevenue: number;
    possiblyRecoverableCount: number;
    possiblyRecoverableRevenue: number;
    nonRecoverableCount: number;
    nonRecoverableRevenue: number;
    requiresReviewCount: number;
    requiresReviewRevenue: number;
  };
  cohorts?: RecoveryCohort[];
  opportunities?: RecoveryOpportunity[];
  financialExposure?: FinancialExposure;
  segmentBreakdown?: DimensionSegment[];
  recommendedMitigation: string;
  alternativeHypotheses: Hypothesis[];
  investigationSummary: string;
  isolatedOrSystemic: 'Isolated to Segment' | 'Systemic Gateway Risk' | 'Broad Multi-Acquirer Impact';
  startedAt?: string;
  completedAt?: string;
}

export interface CandidateAction {
  id: string;
  title: string;
  actionType: 'DYNAMIC_REROUTE' | 'CIRCUIT_BREAKER_THROTTLE' | 'FALLBACK_GATEWAY_SWITCH' | 'MERCHANT_ADVISORY_BROADCAST' | 'RATE_LIMIT_ISOLATION' | 'PASSIVE_MONITORING';
  description: string;
  expectedBenefit: string;
  risk: RiskLevel;
  affectedScope: string;
  confidence: number;
  reversibility: 'Instant (1-click)' | 'Fast (< 30s)' | 'Requires Manual Rollback' | 'Irreversible';
  isRecommended: boolean;
  requiresApproval: boolean;
  tradeoffs: string;
  rank?: number;
  cohortTarget?: string; // e.g. "Cohort B" or "All Eligible Cohorts"
  eligibleTransactions?: number;
  expectedRecoveryRate?: number; // e.g. 84.5%
  expectedRevenueRecovered?: number; // in INR
}

export interface ResolutionOutput {
  incidentId: string;
  recommendedAction: string;
  actionType: 'DYNAMIC_REROUTE' | 'CIRCUIT_BREAKER_THROTTLE' | 'FALLBACK_GATEWAY_SWITCH' | 'MERCHANT_ADVISORY_BROADCAST' | 'RATE_LIMIT_ISOLATION' | 'PASSIVE_MONITORING';
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  expectedImpact: string;
  approvalStatus: ApprovalStatus;
  executionStatus: ExecutionStatus;
  verificationStatus: VerificationStatus;
  resolutionSummary: string;
  confidence: number; // 0.0 - 1.0 (Resolution Confidence)
  candidateActions?: CandidateAction[];
  cohortStrategies?: Array<{
    cohortId: string;
    cohortName: string;
    strategy: string;
    actionType: string;
    stoppingRule: string;
  }>;
  policyValidation?: RecoveryPolicyValidation;
  targetRoute?: string;
  fallbackRoute?: string;
  trafficShiftPercentage?: number;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  executedAt?: string;
  canRollback?: boolean;
  isRolledBack?: boolean;
  rolledBackAt?: string;
  recoveryBatchId?: string;
  stoppingCriteria?: string;
  recoveryMetrics?: {
    baselineSuccessRate: number;
    degradedSuccessRate: number;
    recoveredSuccessRate: number;
    protectedRevenueINR: number;
    verifiedAt: string;
    sampleSize: number;
    preActionLatencyMs?: number;
    postActionLatencyMs?: number;
  };
}

export interface TimelineEvent {
  id: string;
  stepNumber: number;
  stage: IncidentStatus;
  title: string;
  description: string;
  timestamp: string;
  agent: 'Detection Agent' | 'Investigation Agent' | 'Resolution Agent' | 'Human Operator' | 'System Verification';
  metadata?: Record<string, any>;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
}

export interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  detectedAt: string;
  updatedAt: string;
  resolvedAt?: string;
  affectedTransactions: number;
  affectedMerchants: number;
  revenueAtRisk: number;
  recoverableTransactions?: number;
  estimatedRecoverableRevenue?: number;
  recoveredRevenue?: number;
  revenueStillAtRisk?: number;
  recoveryRate?: number;
  recoveryStatus?: RecoveryOutcomeState;
  recoveryBatchId?: string;
  recoveryBatch?: RecoveryBatch;
  cohorts?: RecoveryCohort[];
  opportunities?: RecoveryOpportunity[];
  policyValidation?: RecoveryPolicyValidation;
  scorecard?: RecoveryScorecardData;
  executiveSummary?: ExecutiveIncidentSummary;
  strategyExperiments?: StrategyComparisonOption[];
  detection: DetectionOutput;
  investigation?: InvestigationOutput;
  resolution?: ResolutionOutput;
  timeline: TimelineEvent[];
  isDemoIncident?: boolean;
}

export interface AgentCardState {
  id: 'detection' | 'investigation' | 'resolution';
  name: string;
  role: string;
  model: string;
  status: AgentStatusType;
  currentTask: string;
  lastAction: string;
  confidence: number;
  timestamp: string;
  executionTimeMs?: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  incidentId: string;
  incidentTitle: string;
  agent: 'Detection Agent' | 'Investigation Agent' | 'Resolution Agent' | 'Human Operator' | 'System Simulation';
  action: string;
  inputReference: string;
  outputSummary: string;
  confidence?: number;
  approvalStatus?: ApprovalStatus;
  executionResult: 'SUCCESS' | 'WARNING' | 'REJECTED' | 'FAILURE';
  riskLevel?: RiskLevel;
  payload?: any;
}

export interface PaymentHealthMetrics {
  healthScore: number; // 0-100
  successRate: number; // % e.g. 91.4%
  successRateChange: number; // e.g. -14.2%
  activeIncidentsCount: number;
  criticalIncidentsCount: number;
  totalTransactions24h: number;
  affectedTransactionsTotal: number;
  eligibleTransactionsTotal?: number;
  revenueAtRiskINR: number;
  estimatedRecoverableRevenueINR?: number;
  recoveredRevenueINR: number;
  revenueStillAtRiskINR?: number;
  recoveryRate?: number; // % (recoveredRevenue / estimatedRecoverable)
  transactionRecoveryRate?: number; // %
  recoveryBatchesCount?: number;
  totalProtectedRevenueINR?: number;
  avgLatencyMs: number;
  latencyPercentiles?: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  currentSystemSeverity: IncidentSeverity | 'nominal';
  trendData: Array<{
    time: string;
    successRate: number;
    failureRate: number;
    volume: number;
    anomaly?: boolean;
  }>;
  bankBreakdown: Array<{
    bank: BankName;
    successRate: number;
    totalVolume: number;
    failedVolume: number;
    avgLatencyMs?: number;
    status: 'healthy' | 'degraded' | 'critical';
  }>;
  methodBreakdown: Array<{
    method: PaymentMethod;
    sharePercent: number;
    successRate: number;
    avgLatencyMs?: number;
  }>;
  errorCodeDistribution: Array<{
    code: string;
    count: number;
    percentage: number;
    description: string;
  }>;
}

export type SimulationScenarioId = 
  | 'steady_normal'
  | 'hdfc_upi_degradation'
  | 'icici_card_latency_spike'
  | 'sbi_netbanking_outage'
  | 'high_traffic_concurrency_spike'
  | 'npci_switch_congestion';

export interface SimulationScenarioConfig {
  id: SimulationScenarioId;
  name: string;
  description: string;
  affectedBank?: BankName;
  affectedMethod?: PaymentMethod;
  expectedFailureRate: number;
  errorCode: string;
  trafficMultiplier: number;
  severity: IncidentSeverity;
}

export interface AgentMetricTimePoint {
  timestamp: string;
  agentId: 'detection' | 'investigation' | 'resolution';
  agentName: string;
  successRate: number; // 0 - 100 percentage
  responseTimeMs: number; // in milliseconds
  confidence: number; // 0 - 1.0
  invocations: number;
  errorCount: number;
  scenarioName: string;
  status: 'SUCCESS' | 'WARNING' | 'VALIDATION_FAILED';
  details?: string;
}

export interface AgentPerformanceSummary {
  agentId: 'detection' | 'investigation' | 'resolution';
  agentName: string;
  role: string;
  currentSuccessRate: number;
  avgResponseTimeMs: number;
  p50ResponseTimeMs: number;
  p95ResponseTimeMs: number;
  totalRuns: number;
  successCount: number;
  errorCount: number;
  precision?: number;
  recall?: number;
  falsePositiveRate?: number;
  rootCauseAccuracy?: number;
  evidenceCoverageScore?: number;
  strategyAcceptanceRate?: number;
  policyBlockRate?: number;
  unsafeActionRate?: number;
}

export interface BenchmarkScenarioResult {
  scenarioId: string;
  scenarioName: string;
  scenarioType: 'degradation' | 'timeout' | 'traffic_spike' | 'normal' | 'adversarial' | 'duplicate_prevention';
  groundTruthCause: string;
  expectedAction: string;
  detectionResult: {
    detected: boolean;
    latencyMs: number;
    isTruePositive: boolean;
  };
  investigationResult: {
    rootCauseMatch: boolean;
    identifiedCause: string;
    evidenceScore: number;
  };
  resolutionResult: {
    strategySafe: boolean;
    policyCompliant: boolean;
    actionBlocked?: boolean;
  };
  overallScore: number;
  status: 'PASSED' | 'FAILED' | 'BLOCKED_BY_POLICY';
  explanation: string;
}

export interface AgentBenchmarkReport {
  generatedAt: string;
  scenariosTested: number;
  scenariosPassed: number;
  detectionPrecision: number;
  detectionRecall: number;
  rootCauseAccuracy: number;
  evidenceCoverageScore: number;
  policyBlockRate: number;
  unsafeActionRate: number;
  avgDetectionLatencyMs: number;
  avgInvestigationLatencyMs: number;
  avgResolutionLatencyMs: number;
  scenarioResults: BenchmarkScenarioResult[];
}
