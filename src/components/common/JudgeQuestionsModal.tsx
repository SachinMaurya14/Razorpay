import React, { useState } from 'react';
import { Modal } from './Modal';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Bot, 
  ShieldCheck, 
  Lock, 
  Database, 
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface JudgeQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuestionItem {
  id: string;
  question: string;
  category: 'architecture' | 'fintech_safety' | 'business_value';
  answer: string;
  keyTakeaway: string;
}

const FAQ_ITEMS: QuestionItem[] = [
  {
    id: 'q1',
    question: 'Why three agents?',
    category: 'architecture',
    answer: 'Three distinct agents mirror production SRE separation of concerns: (1) Detection Agent monitors rolling 15m telemetry baselines and flags 3σ statistical deviations; (2) Investigation Agent segments failing vs healthy transaction cohorts to isolate root causes with inspectable mathematical evidence; (3) Resolution Agent formulates bounded mitigation policies and prepares safe rerouting orders. Keeping them separate prevents hallucination loops and allows independent latency and confidence calibration.',
    keyTakeaway: 'Separation of concerns: Detection (Alerting) -> Investigation (Attribution) -> Resolution (Mitigation).'
  },
  {
    id: 'q2',
    question: 'Why not use one single LLM for everything?',
    category: 'architecture',
    answer: 'A single monolithic LLM prompt creates an untrusted black box where monetary calculations, root cause attribution, and execution permissions are conflated. Monolithic prompts frequently suffer from context drift and uncalibrated hallucinations. By enforcing structured typed handoffs (DetectionResult -> InvestigationResult -> ResolutionResult -> PolicyEngine), every transition is deterministic, inspectable, and subject to hard validation.',
    keyTakeaway: 'Prevents monolithic hallucinations. Enforces structured, audit-ready handoffs between typed stages.'
  },
  {
    id: 'q3',
    question: 'How is revenue at risk calculated?',
    category: 'fintech_safety',
    answer: 'Revenue at risk is NEVER estimated by an LLM. It is calculated deterministically on the server by summing the actual transaction amount in minor currency units (INR paise/rupees) of all transactions that encountered payment degradation within the detected anomaly window. The AI reasoning layer is only used to summarize the business implications.',
    keyTakeaway: 'Calculated deterministically from actual transaction amounts. AI models never compute monetary truth.'
  },
  {
    id: 'q4',
    question: 'How is recoverability determined?',
    category: 'fintech_safety',
    answer: 'Recoverability is qualified by evaluating error code categories and transaction state machines: (1) RECOVERABLE: Transient gateway 504 timeouts, switch socket drops, and acquirer rate limits that qualify for alternative route switching; (2) NOT RECOVERABLE: Terminal customer errors such as insufficient funds, incorrect MPIN, expired card tokens, or merchant cancellation. Retrying non-recoverable transactions is strictly blocked by Policy POL-CRED-01.',
    keyTakeaway: 'Classifies failures into retryable gateway delays vs terminal customer drops to protect user experience.'
  },
  {
    id: 'q5',
    question: 'How is duplicate payment prevented?',
    category: 'fintech_safety',
    answer: 'Before every simulated recovery action or reroute, the system verifies idempotency (Policy POL-IDEMP-01). If a transaction has already succeeded, has an unsettled bank authorization, or is currently in flight, the recovery engine triggers a SAFE_STOP. No duplicate simulated transaction can occur.',
    keyTakeaway: 'Strict idempotency keys (POL-IDEMP-01) and pre-flight state checks halt duplicate charges with SAFE_STOP.'
  },
  {
    id: 'q6',
    question: 'How are retries bounded?',
    category: 'fintech_safety',
    answer: 'Retries are bounded by three hard stopping constraints: (1) Maximum attempt budget (strictly capped at 2 attempts per transaction); (2) 24-hour recovery window; (3) Circuit breaker thresholds that halt execution if the recovery route success rate drops below 80%. Every stop logs an explicit stopping reason in the audit ledger.',
    keyTakeaway: 'Hard limit of 2 attempts, 24-hour window, and circuit breaker trip thresholds.'
  },
  {
    id: 'q7',
    question: 'When is human approval required?',
    category: 'fintech_safety',
    answer: 'Human-in-the-loop signoff is required whenever a proposed mitigation involves high-impact routing alterations (>15% traffic shift), enterprise-tier merchant cohorts, or high financial exposure (>₹5,00,000 GMV). The operator can inspect candidate trade-offs, approve, reject, or trigger instant 1-click rollback.',
    keyTakeaway: 'Required for high-impact routing shifts, enterprise merchant volume, and high financial risk.'
  },
  {
    id: 'q8',
    question: 'What happens when AI fails or times out?',
    category: 'architecture',
    answer: 'The application operates with deterministic-first safety. If the AI model times out (>2500ms), returns rate limits (429), or is unreachable, the system automatically falls back to deterministic rule-based heuristic analysis. Incidents are still created, metrics remain mathematically accurate, and the UI displays an informative status notice without crashing.',
    keyTakeaway: 'Deterministic fallback guarantees zero crash, preserving full operational continuity.'
  },
  {
    id: 'q9',
    question: 'How is recovery measured?',
    category: 'business_value',
    answer: 'Recovery is measured from actual post-mitigation telemetry. The system compares the degraded success rate (e.g. 49.6%) against the post-action stream (e.g. 95.2%) over a statistical sample of subsequent transactions. Revenue recovered is measured from transactions successfully settled on the fallback route, not merely because an action was dispatched.',
    keyTakeaway: 'Closed-loop verification: compares pre vs post success rates on real settled transaction telemetry.'
  },
  {
    id: 'q10',
    question: 'Is this connected to Razorpay production?',
    category: 'business_value',
    answer: 'No. This application is an independent simulation prototype designed for hackathon demonstration. It runs against an authentic synthetic transaction engine modeled after Indian payment gateway architectures (UPI, Cards, Netbanking, NPCI). No real customer funds or production credentials are involved.',
    keyTakeaway: '100% simulated prototype. Authentic payment gateway domain logic with zero production risk.'
  }
];

export const JudgeQuestionsModal: React.FC<JudgeQuestionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'architecture' | 'fintech_safety' | 'business_value'>('all');
  const [expandedId, setExpandedId] = useState<string | null>('q1');

  const filteredItems = selectedCategory === 'all' 
    ? FAQ_ITEMS 
    : FAQ_ITEMS.filter(item => item.category === selectedCategory);

  const toggleItem = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reviewer & Judge Frequently Asked Questions"
      subtitle="Direct, technical, and authoritative answers to core architectural and governance questions."
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2.5 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Questions (10)
          </button>
          <button
            onClick={() => setSelectedCategory('architecture')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'architecture'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Agent Architecture & LLM Safety
          </button>
          <button
            onClick={() => setSelectedCategory('fintech_safety')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'fintech_safety'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Fintech Safety & Bounded Retries
          </button>
          <button
            onClick={() => setSelectedCategory('business_value')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'business_value'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Business Outcomes & Integrity
          </button>
        </div>

        {/* Questions Accordion */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs transition-all"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    {item.question}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-2.5 text-xs text-slate-600 leading-relaxed">
                    <p>{item.answer}</p>
                    <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-900 text-[11px] font-medium flex items-center gap-2">
                      <strong className="font-bold text-blue-800 shrink-0">Takeaway:</strong>
                      <span>{item.keyTakeaway}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Razorpay — V6 Hackathon Edition</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
          >
            Close FAQ
          </button>
        </div>
      </div>
    </Modal>
  );
};
