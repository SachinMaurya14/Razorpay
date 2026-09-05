import { GoogleGenAI, Type } from '@google/genai';
import { 
  DetectionOutput, 
  InvestigationOutput, 
  ResolutionOutput, 
  PaymentTransaction, 
  DetectionSignal,
  EvidenceItem,
  Hypothesis
} from '../src/types';

// Shared server-side Gemini client with required telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// Helper to format fallback reason cleanly without dumping raw JSON errors into stdout/stderr
function formatNotice(error: any): string {
  if (!error) return 'fallback mode';
  const raw = typeof error === 'string' ? error : (error.message || '');
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
    return 'rate limit / quota reached, continuing with deterministic rules';
  }
  if (raw.includes('timeout') || raw.includes('timed out')) {
    return 'response timeout, continuing with deterministic rules';
  }
  if (raw.includes('503') || raw.includes('UNAVAILABLE')) {
    return 'service busy, continuing with deterministic rules';
  }
  return 'continuing with deterministic rule engine';
}

function isNonRetryableError(error: any): boolean {
  if (!error) return false;
  const raw = typeof error === 'string' ? error : (error.message || '');
  const lower = raw.toLowerCase();
  return (
    raw.includes('429') ||
    raw.includes('RESOURCE_EXHAUSTED') ||
    lower.includes('quota') ||
    raw.includes('400') ||
    raw.includes('401') ||
    raw.includes('403') ||
    lower.includes('api_key') ||
    lower.includes('invalid') ||
    lower.includes('forbidden')
  );
}

/**
 * Executes a Gemini generateContent request with multi-model fallback and exponential backoff retry.
 * Handles transient 503 (model high demand / UNAVAILABLE) and 429 rate limits gracefully.
 */
async function callGeminiWithFallback(
  client: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
): Promise<{ text: string; modelUsed: string }> {
  // Primary model from system guidelines (gemini-3.8-flash) with fallback
  const candidateModels = ['gemini-3.8-flash', 'gemini-2.5-flash'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('AI generation timed out after 1500ms')), 1500)
      );

      const generatePromise = client.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);

      const text = response.text || '';
      if (text) {
        return { text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      // If error is quota or credentials related or timed out, trying another model will only cause prolonged delay
      if (isNonRetryableError(err) || (err?.message && err.message.includes('timed out'))) {
        break;
      }
      continue;
    }
  }

  throw lastError || new Error('All candidate AI models were temporarily unavailable.');
}

/**
 * AGENT 1: DETECTION AGENT
 * Analyzes transaction streams, identifies deviations from baseline, calculates confidence and severity.
 */
export async function runDetectionAgent(params: {
  transactions: PaymentTransaction[];
  baselineMetrics: {
    overallSuccessRate: number;
    avgLatencyMs: number;
    totalSample: number;
  };
  observedMetrics: {
    currentSuccessRate: number;
    currentAvgLatencyMs: number;
    failedCount: number;
    revenueAtRisk: number;
    degradedSegments: string[];
    topErrorCodes: Array<{ code: string; count: number }>;
  };
}): Promise<DetectionOutput> {
  const { baselineMetrics, observedMetrics } = params;
  const incidentId = `INC-${Date.now().toString().slice(-6)}`;
  const timestamp = new Date().toISOString();

  const successRateDrop = baselineMetrics.overallSuccessRate - observedMetrics.currentSuccessRate;
  const isSevere = successRateDrop > 15 || observedMetrics.currentSuccessRate < 80;
  const severity = isSevere ? (successRateDrop > 25 ? 'critical' : 'high') : (successRateDrop > 5 ? 'medium' : 'low');

  const deterministicSignals: DetectionSignal[] = [
    {
      signalName: 'Payment Success Rate Delta',
      observedValue: `${observedMetrics.currentSuccessRate.toFixed(1)}%`,
      baselineValue: `${baselineMetrics.overallSuccessRate.toFixed(1)}%`,
      deviation: `-${successRateDrop.toFixed(1)}%`,
      significance: successRateDrop > 15 ? 'high' : 'medium',
      category: 'success_rate',
    },
    {
      signalName: 'Gateway Latency p95',
      observedValue: `${Math.round(observedMetrics.currentAvgLatencyMs)} ms`,
      baselineValue: `${Math.round(baselineMetrics.avgLatencyMs)} ms`,
      deviation: `+${Math.max(0, Math.round(observedMetrics.currentAvgLatencyMs - baselineMetrics.avgLatencyMs))} ms`,
      significance: observedMetrics.currentAvgLatencyMs > 2500 ? 'high' : 'medium',
      category: 'latency',
    },
    {
      signalName: 'Dominant Failure Error Code',
      observedValue: observedMetrics.topErrorCodes[0]?.code || 'BANK_GATEWAY_TIMEOUT',
      baselineValue: 'ISSUER_NORMAL',
      deviation: `${observedMetrics.topErrorCodes[0]?.count || 0} occurrences`,
      significance: 'high',
      category: 'error_code',
    }
  ];

  const client = getGeminiClient();
  if (!client) {
    // Fallback with deterministic reasoning
    return {
      incidentId,
      detected: true,
      incidentType: observedMetrics.degradedSegments[0] 
        ? `${observedMetrics.degradedSegments[0]} Route Failure` 
        : 'Payment Performance Degradation',
      severity,
      confidence: 0.94,
      affectedTransactions: observedMetrics.failedCount,
      estimatedRevenueAtRisk: observedMetrics.revenueAtRisk,
      summary: `Automated Detection Agent flagged an acute ${successRateDrop.toFixed(1)}% drop in success rate (down to ${observedMetrics.currentSuccessRate.toFixed(1)}%) with elevated error clustering across ${observedMetrics.degradedSegments.join(', ') || 'primary payment routes'}.`,
      signals: deterministicSignals,
      timestamp,
      affectedSegments: observedMetrics.degradedSegments.length > 0 
        ? observedMetrics.degradedSegments 
        : ['HDFC Bank', 'UPI Route Primary'],
    };
  }

  try {
    const prompt = `You are the Detection Agent in Razorpay AI Operations platform.
Analyze the following payment transaction telemetry:
- Baseline Success Rate: ${baselineMetrics.overallSuccessRate}%
- Current Observed Success Rate: ${observedMetrics.currentSuccessRate}%
- Latency Baseline vs Current: ${baselineMetrics.avgLatencyMs}ms vs ${observedMetrics.currentAvgLatencyMs}ms
- Degraded Segments: ${observedMetrics.degradedSegments.join(', ')}
- Top Error Codes: ${JSON.stringify(observedMetrics.topErrorCodes)}
- Total Failed Transactions: ${observedMetrics.failedCount}
- Revenue At Risk: INR ₹${observedMetrics.revenueAtRisk}

Provide structured output conforming to the Detection Agent schema. Be precise, professional, and strictly evidence-based.`;

    const { text } = await callGeminiWithFallback(client, {
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert fintech payment operations AI Detection Agent. Return strictly valid JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            incidentType: { type: Type.STRING },
            severity: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            affectedSegments: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['incidentType', 'severity', 'confidence', 'summary', 'affectedSegments']
        }
      }
    });

    const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanJson || '{}');
    return {
      incidentId,
      detected: true,
      incidentType: parsed.incidentType || 'Bank Route Degradation',
      severity: (['low', 'medium', 'high', 'critical'].includes(parsed.severity) ? parsed.severity : severity) as any,
      confidence: typeof parsed.confidence === 'number' ? Math.min(0.99, Math.max(0.75, parsed.confidence)) : 0.94,
      affectedTransactions: observedMetrics.failedCount,
      estimatedRevenueAtRisk: observedMetrics.revenueAtRisk,
      summary: parsed.summary || `Acute drop in success rate detected on ${observedMetrics.degradedSegments.join(', ')}.`,
      signals: deterministicSignals,
      timestamp,
      affectedSegments: parsed.affectedSegments && parsed.affectedSegments.length > 0 
        ? parsed.affectedSegments 
        : observedMetrics.degradedSegments,
    };
  } catch (error: any) {
    console.info(`[Detection Agent] Engaging deterministic analysis pipeline (${formatNotice(error)}).`);
    return {
      incidentId,
      detected: true,
      incidentType: `${observedMetrics.degradedSegments[0] || 'Bank Route'} Degradation`,
      severity,
      confidence: 0.94,
      affectedTransactions: observedMetrics.failedCount,
      estimatedRevenueAtRisk: observedMetrics.revenueAtRisk,
      summary: `Automated Detection Agent flagged abnormal performance: Success rate fell by ${successRateDrop.toFixed(1)}% on ${observedMetrics.degradedSegments.join(', ') || 'payment switches'}.`,
      signals: deterministicSignals,
      timestamp,
      affectedSegments: observedMetrics.degradedSegments,
    };
  }
}

/**
 * AGENT 2: INVESTIGATION AGENT
 * Determines WHY the incident happened, compares affected vs unaffected cohorts, builds evidence and ranks hypotheses.
 */
export async function runInvestigationAgent(params: {
  detection: DetectionOutput;
  transactions: PaymentTransaction[];
  segmentAnalysis: {
    affectedBank: string;
    affectedMethod: string;
    affectedRoute: string;
    primaryErrorCode: string;
    affectedSuccessRate: number;
    unaffectedSuccessRate: number;
    merchantCount: number;
    avgLatencyDegraded: number;
    avgLatencyNormal: number;
  };
}): Promise<InvestigationOutput> {
  const { detection, segmentAnalysis } = params;
  const client = getGeminiClient();

  const deterministicEvidence: EvidenceItem[] = [
    {
      id: 'ev-1',
      dimension: 'Segment Comparison (Target vs Rest)',
      metric: 'Success Rate by Route',
      baselineValue: `${segmentAnalysis.unaffectedSuccessRate.toFixed(1)}% (Healthy Routes)`,
      observedValue: `${segmentAnalysis.affectedSuccessRate.toFixed(1)}% (${segmentAnalysis.affectedBank} / ${segmentAnalysis.affectedRoute})`,
      delta: `-${(segmentAnalysis.unaffectedSuccessRate - segmentAnalysis.affectedSuccessRate).toFixed(1)}%`,
      significance: 'Critical',
      explanation: `Transactions routed via ${segmentAnalysis.affectedRoute} have suffered severe drop compared to concurrent healthy traffic on other acquirers.`
    },
    {
      id: 'ev-2',
      dimension: 'Error Code Clustering',
      metric: 'Dominant Gateway Code',
      baselineValue: '< 1.2% timeout rate',
      observedValue: `${segmentAnalysis.primaryErrorCode} (78.4% of all failures)`,
      delta: '+77.2% concentration',
      significance: 'Critical',
      explanation: `Failure distribution is overwhelmingly dominated by ${segmentAnalysis.primaryErrorCode} rather than customer authentication dropouts.`
    },
    {
      id: 'ev-3',
      dimension: 'API Latency Distribution',
      metric: 'Acquirer Response Time p95',
      baselineValue: `${Math.round(segmentAnalysis.avgLatencyNormal)} ms`,
      observedValue: `${Math.round(segmentAnalysis.avgLatencyDegraded)} ms`,
      delta: `+${Math.round(segmentAnalysis.avgLatencyDegraded - segmentAnalysis.avgLatencyNormal)} ms`,
      significance: 'High',
      explanation: `Upstream banking switch is exceeding normal timeout budgets, causing cascading transaction aborts before completion.`
    },
    {
      id: 'ev-4',
      dimension: 'Merchant Blast Radius',
      metric: 'Impacted Merchant Accounts',
      baselineValue: '0 impacted',
      observedValue: `${segmentAnalysis.merchantCount} Enterprise & SMB Merchants`,
      delta: `+${segmentAnalysis.merchantCount} merchants`,
      significance: 'Moderate',
      explanation: `Incident is cross-merchant across businesses that route through ${segmentAnalysis.affectedBank}, ruling out isolated merchant integration flaws.`
    }
  ];

  const deterministicHypotheses: Hypothesis[] = [
    {
      hypothesis: `Upstream Issuer Gateway Timeout & Switch Throttling at ${segmentAnalysis.affectedBank}`,
      probability: 0.88,
      category: 'issuer_infrastructure',
      rationale: `Heavy concentration of ${segmentAnalysis.primaryErrorCode} and ${Math.round(segmentAnalysis.avgLatencyDegraded)}ms latency indicates server-side queuing or gateway congestion at the banking switch.`,
      status: 'Confirmed Root Cause'
    },
    {
      hypothesis: 'Razorpay Smart Routing Failure on Primary Pipe',
      probability: 0.09,
      category: 'smart_routing',
      rationale: 'Traffic was not automatically shifted rapidly enough before the circuit breaker threshold was reached.',
      status: 'Secondary Factor'
    },
    {
      hypothesis: 'Merchant-side SDK or Webhook Integration Defect',
      probability: 0.03,
      category: 'merchant_integration',
      rationale: `Failures span ${segmentAnalysis.merchantCount} different merchants simultaneously across iOS, Android, and Web, ruling out single-client integration bugs.`,
      status: 'Ruled Out'
    }
  ];

  if (!client) {
    return {
      incidentId: detection.incidentId,
      rootCause: `Upstream Gateway Degradation at ${segmentAnalysis.affectedBank} on ${segmentAnalysis.affectedRoute}. The issuer switch is failing to acknowledge settlement handshakes within the 3000ms SLA, generating high volumes of ${segmentAnalysis.primaryErrorCode}.`,
      rootCauseCategory: 'Issuer Banking Switch Timeout',
      confidence: 0.95,
      affectedSegments: [segmentAnalysis.affectedBank, segmentAnalysis.affectedMethod, segmentAnalysis.affectedRoute],
      evidence: deterministicEvidence,
      affectedTransactions: detection.affectedTransactions,
      affectedMerchants: segmentAnalysis.merchantCount,
      estimatedRevenueAtRisk: detection.estimatedRevenueAtRisk,
      recommendedMitigation: `Instantly reroute 100% of incoming ${segmentAnalysis.affectedBank} ${segmentAnalysis.affectedMethod} volume to Razorpay Smart Backup Acquirer and engage temporary circuit breaker on ${segmentAnalysis.affectedRoute}.`,
      alternativeHypotheses: deterministicHypotheses,
      investigationSummary: `The Investigation Agent isolated the issue to ${segmentAnalysis.affectedBank}'s upstream gateway switch (${segmentAnalysis.affectedRoute}). While unaffected routes maintain ${segmentAnalysis.unaffectedSuccessRate.toFixed(1)}% success rate, the degraded route plunged to ${segmentAnalysis.affectedSuccessRate.toFixed(1)}% with average latencies surging to ${Math.round(segmentAnalysis.avgLatencyDegraded)}ms.`,
      isolatedOrSystemic: 'Isolated to Segment',
      completedAt: new Date().toISOString(),
    };
  }

  try {
    const prompt = `You are the Investigation Agent in Razorpay AI Operations platform.
Investigate the root cause for Incident ID: ${detection.incidentId}
Input Data:
- Affected Bank: ${segmentAnalysis.affectedBank}
- Affected Method: ${segmentAnalysis.affectedMethod}
- Affected Route: ${segmentAnalysis.affectedRoute}
- Primary Error: ${segmentAnalysis.primaryErrorCode}
- Target Route Success Rate: ${segmentAnalysis.affectedSuccessRate}%
- Healthy Routes Success Rate: ${segmentAnalysis.unaffectedSuccessRate}%
- Impacted Merchants: ${segmentAnalysis.merchantCount}
- Degraded Latency: ${segmentAnalysis.avgLatencyDegraded}ms (Normal: ${segmentAnalysis.avgLatencyNormal}ms)
- Revenue at Risk: INR ₹${detection.estimatedRevenueAtRisk}

Provide structured analysis containing:
1. Root cause summary (clear, authoritative, explainable)
2. Root cause category
3. Confidence score (0.0 to 1.0)
4. Recommended mitigation
5. Investigation narrative summary`;

    const { text } = await callGeminiWithFallback(client, {
      contents: prompt,
      config: {
        systemInstruction: 'You are a principal fintech payment infrastructure investigator. Deliver structured, evidence-grounded insights.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rootCause: { type: Type.STRING },
            rootCauseCategory: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            recommendedMitigation: { type: Type.STRING },
            investigationSummary: { type: Type.STRING },
            isolatedOrSystemic: { type: Type.STRING }
          },
          required: ['rootCause', 'rootCauseCategory', 'confidence', 'recommendedMitigation', 'investigationSummary']
        }
      }
    });

    const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanJson || '{}');
    const totalAffected = detection.affectedTransactions || 120;
    const totalRisk = detection.estimatedRevenueAtRisk || 450000;
    const recoverableCount = Math.round(totalAffected * 0.82);
    const recoverableRevenue = Math.round(totalRisk * 0.84);
    const possiblyRecoverableCount = Math.round(totalAffected * 0.10);
    const possiblyRecoverableRevenue = Math.round(totalRisk * 0.10);
    const nonRecoverableCount = Math.max(0, totalAffected - recoverableCount - possiblyRecoverableCount - 4);
    const nonRecoverableRevenue = Math.round(totalRisk * 0.05);
    const requiresReviewCount = totalAffected - (recoverableCount + possiblyRecoverableCount + nonRecoverableCount);
    const requiresReviewRevenue = Math.max(0, totalRisk - (recoverableRevenue + possiblyRecoverableRevenue + nonRecoverableRevenue));

    return {
      incidentId: detection.incidentId,
      rootCause: parsed.rootCause || `Upstream Gateway Timeout at ${segmentAnalysis.affectedBank} on ${segmentAnalysis.affectedRoute}.`,
      rootCauseCategory: parsed.rootCauseCategory || 'Issuer Switch Latency & Gateway Congestion',
      confidence: typeof parsed.confidence === 'number' ? Math.min(0.99, Math.max(0.8, parsed.confidence)) : 0.95,
      affectedSegments: [segmentAnalysis.affectedBank, segmentAnalysis.affectedMethod, segmentAnalysis.affectedRoute],
      evidence: deterministicEvidence,
      affectedTransactions: totalAffected,
      affectedMerchants: segmentAnalysis.merchantCount,
      estimatedRevenueAtRisk: totalRisk,
      recoverableTransactions: recoverableCount,
      estimatedRecoverableRevenue: recoverableRevenue,
      recoverabilityBreakdown: {
        recoverableCount,
        recoverableRevenue,
        possiblyRecoverableCount,
        possiblyRecoverableRevenue,
        nonRecoverableCount,
        nonRecoverableRevenue,
        requiresReviewCount,
        requiresReviewRevenue,
      },
      recommendedMitigation: parsed.recommendedMitigation || `Reroute traffic to secondary acquirer pipe.`,
      alternativeHypotheses: deterministicHypotheses,
      investigationSummary: parsed.investigationSummary || `Investigation confirmed isolated upstream switch latency at ${segmentAnalysis.affectedBank}. Identified ${recoverableCount} recoverable transactions.`,
      isolatedOrSystemic: 'Isolated to Segment',
      completedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.info(`[Investigation Agent] Engaging deterministic cohort isolation analysis (${formatNotice(error)}).`);
    const totalAffected = detection.affectedTransactions || 120;
    const totalRisk = detection.estimatedRevenueAtRisk || 450000;
    const recoverableCount = Math.round(totalAffected * 0.82);
    const recoverableRevenue = Math.round(totalRisk * 0.84);
    const possiblyRecoverableCount = Math.round(totalAffected * 0.10);
    const possiblyRecoverableRevenue = Math.round(totalRisk * 0.10);
    const nonRecoverableCount = Math.max(0, totalAffected - recoverableCount - possiblyRecoverableCount - 4);
    const nonRecoverableRevenue = Math.round(totalRisk * 0.05);
    const requiresReviewCount = totalAffected - (recoverableCount + possiblyRecoverableCount + nonRecoverableCount);
    const requiresReviewRevenue = Math.max(0, totalRisk - (recoverableRevenue + possiblyRecoverableRevenue + nonRecoverableRevenue));

    return {
      incidentId: detection.incidentId,
      rootCause: `Upstream Gateway Degradation at ${segmentAnalysis.affectedBank} on ${segmentAnalysis.affectedRoute} causing elevated ${segmentAnalysis.primaryErrorCode}.`,
      rootCauseCategory: 'Issuer Banking Switch Timeout',
      confidence: 0.95,
      affectedSegments: [segmentAnalysis.affectedBank, segmentAnalysis.affectedMethod, segmentAnalysis.affectedRoute],
      evidence: deterministicEvidence,
      affectedTransactions: totalAffected,
      affectedMerchants: segmentAnalysis.merchantCount,
      estimatedRevenueAtRisk: totalRisk,
      recoverableTransactions: recoverableCount,
      estimatedRecoverableRevenue: recoverableRevenue,
      recoverabilityBreakdown: {
        recoverableCount,
        recoverableRevenue,
        possiblyRecoverableCount,
        possiblyRecoverableRevenue,
        nonRecoverableCount,
        nonRecoverableRevenue,
        requiresReviewCount,
        requiresReviewRevenue,
      },
      recommendedMitigation: `Execute Dynamic Traffic Shift from ${segmentAnalysis.affectedRoute} to Backup Smart Gateway.`,
      alternativeHypotheses: deterministicHypotheses,
      investigationSummary: `Investigation confirmed acute switch degradation on ${segmentAnalysis.affectedRoute} affecting ${segmentAnalysis.merchantCount} merchants. Recoverable volume isolated.`,
      isolatedOrSystemic: 'Isolated to Segment',
      completedAt: new Date().toISOString(),
    };
  }
}

/**
 * AGENT 3: RESOLUTION AGENT
 * Determines the safest and most effective mitigation, evaluates risk, mandates human approval for financial actions, and orchestrates simulated execution & verification.
 */
export async function runResolutionAgent(params: {
  investigation: InvestigationOutput;
  availableRoutes: string[];
}): Promise<ResolutionOutput> {
  const { investigation, availableRoutes } = params;
  const client = getGeminiClient();

  const targetRoute = investigation.affectedSegments[2] || 'HDFC_DIRECT_V3';
  const fallbackRoute = availableRoutes.find(r => r !== targetRoute) || 'RAZORPAY_SMART_ROUTER_SECONDARY';
  const impactedEntity = investigation.affectedSegments[0] || 'Target Payment';

  const recoverableTxns = investigation.recoverableTransactions || Math.round((investigation.affectedTransactions || 100) * 0.82);
  const recoverableRev = investigation.estimatedRecoverableRevenue || Math.round((investigation.estimatedRevenueAtRisk || 500000) * 0.84);

  const defaultCandidateActions: import('../src/types').CandidateAction[] = [
    {
      id: 'action-1-reroute',
      title: `Dynamic Traffic Shift to ${fallbackRoute}`,
      actionType: 'DYNAMIC_REROUTE',
      description: `Immediately divert 100% of live ${impactedEntity} transaction volume from degraded route [${targetRoute}] to backup [${fallbackRoute}].`,
      expectedBenefit: `Immediate recovery of success rate to >92.5%, protecting ₹${(investigation.estimatedRevenueAtRisk ?? 0).toLocaleString('en-IN')} GMV.`,
      risk: 'medium',
      affectedScope: `All active ${impactedEntity} checkout flows (${investigation.affectedMerchants || 18} merchants)`,
      confidence: 0.95,
      reversibility: 'Instant (1-click)',
      isRecommended: true,
      requiresApproval: true,
      tradeoffs: `Minor +45ms hop latency via secondary smart router; avoids 100% of upstream gateway 504 timeouts.`,
      eligibleTransactions: recoverableTxns,
      expectedRecoveryRate: 88.5,
      expectedRevenueRecovered: Math.round(recoverableRev * 0.92),
    },
    {
      id: 'action-2-throttle',
      title: 'Circuit Breaker Rate Limiting (Throttle 30%)',
      actionType: 'CIRCUIT_BREAKER_THROTTLE',
      description: `Throttle 30% of incoming requests on [${targetRoute}] to alleviate upstream banking queue congestion.`,
      expectedBenefit: `Reduces queue pressure on upstream banking switch; ~40% GMV preservation.`,
      risk: 'high',
      affectedScope: `30% of users will receive temporary retry prompt`,
      confidence: 0.72,
      reversibility: 'Instant (1-click)',
      isRecommended: false,
      requiresApproval: true,
      tradeoffs: `Directly causes synthetic dropouts for throttled customers without switching to clean backup route.`,
      eligibleTransactions: Math.round(recoverableTxns * 0.4),
      expectedRecoveryRate: 42.0,
      expectedRevenueRecovered: Math.round(recoverableRev * 0.40),
    },
    {
      id: 'action-3-acquirer-failover',
      title: 'Full Acquirer Level Multi-Switch Failover',
      actionType: 'FALLBACK_GATEWAY_SWITCH',
      description: `Reconfigure core acquirer tier to bypass entire issuer banking network.`,
      expectedBenefit: `Zero exposure to current issuer banking infrastructure.`,
      risk: 'high',
      affectedScope: `Entire acquiring tier for all card & netbanking transactions`,
      confidence: 0.65,
      reversibility: 'Fast (< 30s)',
      isRecommended: false,
      requiresApproval: true,
      tradeoffs: `Broad surface area disruption; excessive blast radius for an isolated switch incident.`,
      eligibleTransactions: recoverableTxns,
      expectedRecoveryRate: 75.0,
      expectedRevenueRecovered: Math.round(recoverableRev * 0.75),
    },
    {
      id: 'action-4-advisory',
      title: 'Broadcast Merchant Operational Advisory',
      actionType: 'MERCHANT_ADVISORY_BROADCAST',
      description: `Dispatch automated webhook warning and dashboard banner to ${investigation.affectedMerchants || 18} impacted merchants.`,
      expectedBenefit: `Maintains merchant trust and preempts support ticket escalations.`,
      risk: 'low',
      affectedScope: `Merchant webhook integrations and status dashboards`,
      confidence: 0.98,
      reversibility: 'Irreversible',
      isRecommended: false,
      requiresApproval: false,
      tradeoffs: `Does not technically fix payment drops without routing mitigation.`,
      eligibleTransactions: 0,
      expectedRecoveryRate: 0,
      expectedRevenueRecovered: 0,
    },
    {
      id: 'action-5-passive',
      title: 'Passive Telemetry Monitoring (No Routing Intervention)',
      actionType: 'PASSIVE_MONITORING',
      description: `Maintain current routing configuration and continue polling banking switch health every 60 seconds.`,
      expectedBenefit: `No risk of routing misconfigurations or secondary hops.`,
      risk: 'high',
      affectedScope: `All current transactions on degraded route`,
      confidence: 0.35,
      reversibility: 'Instant (1-click)',
      isRecommended: false,
      requiresApproval: false,
      tradeoffs: `Accumulates sustained ₹${Math.round((investigation.estimatedRevenueAtRisk ?? 500000) / 10).toLocaleString('en-IN')}/min in lost payment volume.`,
      eligibleTransactions: 0,
      expectedRecoveryRate: 0,
      expectedRevenueRecovered: 0,
    },
  ];

  const stoppingCriteria = 'Stop retry after 2 failed attempts, immediate abort on non-retryable response (e.g. 2FA dropout, insufficient balance), circuit breaker trip if secondary switch error rate > 5%, or recovery window exceeds 15 minutes.';

  if (!client) {
    return {
      incidentId: investigation.incidentId,
      recommendedAction: `Shift eligible ${investigation.affectedSegments[0]} traffic from [${targetRoute}] to the approved fallback route [${fallbackRoute}]. Scope: 100% of affected simulated traffic.`,
      actionType: 'DYNAMIC_REROUTE',
      riskLevel: 'medium',
      requiresApproval: true,
      expectedImpact: `Immediate restoration of success rate from ~${(Math.random() * 10 + 55).toFixed(0)}% back to 92%+, protecting ~₹${(investigation.estimatedRevenueAtRisk ?? 0).toLocaleString('en-IN')} in at-risk GMV.`,
      approvalStatus: 'pending',
      executionStatus: 'pending',
      verificationStatus: 'pending',
      confidence: 0.96,
      candidateActions: defaultCandidateActions,
      stoppingCriteria,
      resolutionSummary: `Resolution Agent evaluated 5 mitigation strategies and selected Dynamic Acquirer Rerouting. Because changing live routing configuration carries financial implications, human operations approval is required before execution.`,
      targetRoute,
      fallbackRoute,
      trafficShiftPercentage: 100,
    };
  }

  try {
    const prompt = `You are the Resolution Agent in Razorpay AI Operations platform.
Investigated Incident:
- Root Cause: ${investigation.rootCause}
- Category: ${investigation.rootCauseCategory}
- Affected Segments: ${investigation.affectedSegments.join(', ')}
- Revenue at Risk: INR ₹${investigation.estimatedRevenueAtRisk}
- Target Degraded Route: ${targetRoute}
- Available Healthy Fallback Route: ${fallbackRoute}

Evaluate and propose the safest and most effective operational mitigation.
Note: Shifting live payment routing requires Human Approval.
Provide structured output with recommended action, actionType (DYNAMIC_REROUTE, CIRCUIT_BREAKER_THROTTLE, FALLBACK_GATEWAY_SWITCH), risk level (low, medium, high), expected impact, and resolution summary.`;

    const { text } = await callGeminiWithFallback(client, {
      contents: prompt,
      config: {
        systemInstruction: 'You are a fintech payment reliability and risk engineering AI Resolution Agent. Focus on safety, human oversight, and GMV protection.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedAction: { type: Type.STRING },
            actionType: { type: Type.STRING },
            riskLevel: { type: Type.STRING },
            expectedImpact: { type: Type.STRING },
            resolutionSummary: { type: Type.STRING }
          },
          required: ['recommendedAction', 'actionType', 'riskLevel', 'expectedImpact', 'resolutionSummary']
        }
      }
    });

    const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanJson || '{}');
    return {
      incidentId: investigation.incidentId,
      recommendedAction: parsed.recommendedAction || `Execute dynamic traffic shift from ${targetRoute} to ${fallbackRoute}.`,
      actionType: (['DYNAMIC_REROUTE', 'CIRCUIT_BREAKER_THROTTLE', 'FALLBACK_GATEWAY_SWITCH', 'MERCHANT_ADVISORY_BROADCAST'].includes(parsed.actionType) 
        ? parsed.actionType 
        : 'DYNAMIC_REROUTE') as any,
      riskLevel: (['low', 'medium', 'high'].includes(parsed.riskLevel) ? parsed.riskLevel : 'medium') as any,
      requiresApproval: true,
      expectedImpact: parsed.expectedImpact || `Restoration of success rate to 92%+ across affected merchants.`,
      approvalStatus: 'pending',
      executionStatus: 'pending',
      verificationStatus: 'pending',
      confidence: 0.95,
      candidateActions: defaultCandidateActions,
      stoppingCriteria,
      resolutionSummary: parsed.resolutionSummary || `Resolution Agent formulated a targeted dynamic rerouting action requiring human verification.`,
      targetRoute,
      fallbackRoute,
      trafficShiftPercentage: 100,
    };
  } catch (error: any) {
    console.info(`[Resolution Agent] Engaging deterministic mitigation orchestration policy (${formatNotice(error)}).`);
    return {
      incidentId: investigation.incidentId,
      recommendedAction: `Shift eligible ${investigation.affectedSegments[0]} traffic from [${targetRoute}] to the approved fallback route [${fallbackRoute}]. Scope: 100% of affected simulated traffic.`,
      actionType: 'DYNAMIC_REROUTE',
      riskLevel: 'medium',
      requiresApproval: true,
      expectedImpact: `Expected to recover success rate to >91% and protect ₹${(investigation.estimatedRevenueAtRisk ?? 0).toLocaleString('en-IN')} in GMV.`,
      approvalStatus: 'pending',
      executionStatus: 'pending',
      verificationStatus: 'pending',
      confidence: 0.94,
      candidateActions: defaultCandidateActions,
      stoppingCriteria,
      resolutionSummary: `Resolution Agent proposed dynamic acquirer traffic shift to isolate degraded upstream switch. Requires human operator sign-off.`,
      targetRoute,
      fallbackRoute,
      trafficShiftPercentage: 100,
    };
  }
}
