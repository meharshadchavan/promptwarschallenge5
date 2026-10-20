import {
  BudgetLineItem,
  EventPlan,
  GuardrailTelemetry,
  TimelineItem,
  TimelinePhase,
} from '../types';

const INJECTION_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i, label: 'Instruction Override Attempt' },
  { pattern: /reveal\s+(your\s+)?(system\s+prompt|hidden\s+instructions|developer\s+message)/i, label: 'System Prompt Exfiltration' },
  { pattern: /you\s+are\s+now\s+(dan|unrestricted|jailbroken|a\s+different\s+ai)/i, label: 'Persona Hijack Attempt' },
  { pattern: /<\s*\/?\s*user_event_context\s*>/i, label: 'XML Boundary Escape Attempt' },
  { pattern: /(drop\s+table|union\s+select|<script\b|javascript:)/i, label: 'Code/Script Injection Vector' },
  { pattern: /(write\s+python\s+code|solve\s+leetcode|hack\s+into|bypass\s+security)/i, label: 'Off-Domain Task Execution' },
];

export interface SanitizationResult {
  sanitizedText: string;
  wrappedXmlContext: string;
  flagged: boolean;
  detectedTriggers: string[];
}

/**
 * Operational Guardrail 1: Security & Prompt Injection Defense
 * Strips XML boundary tags, neutralizes injection directives, and encapsulates untrusted input inside <user_event_context>.
 */
export function sanitizeAndWrapUntrustedInput(rawInput: string): SanitizationResult {
  const safeString = (rawInput || '').slice(0, 2500);
  const detectedTriggers: string[] = [];

  let cleaned = safeString
    .replace(/<\s*\/?\s*user_event_context\s*>/gi, '[STRIPPED_TAG]')
    .replace(/<\s*script[^>]*>.*?<\s*\/\s*script\s*>/gi, '[STRIPPED_SCRIPT]');

  for (const rule of INJECTION_PATTERNS) {
    if (rule.pattern.test(safeString)) {
      detectedTriggers.push(rule.label);
      cleaned = cleaned.replace(rule.pattern, '[REDACTED_BY_GUARDRAIL]');
    }
  }

  return {
    sanitizedText: cleaned.trim(),
    wrappedXmlContext: `<user_event_context>\n${cleaned.trim()}\n</user_event_context>`,
    flagged: detectedTriggers.length > 0,
    detectedTriggers,
  };
}

/**
 * Operational Guardrail 3: Realism & Alignment
 * Guarantees that:
 * 1) A dedicated 5–10% Emergency Contingency Buffer line item exists (defaults to 8% if missing or out of bounds).
 * 2) All budget items sum to EXACTLY 100% of totalBudget (never exceeding the stated cap, zero rounding drift).
 */
export function normalizeBudgetWithContingency(
  items: BudgetLineItem[],
  totalBudget: number,
  targetContingencyRatio = 0.08
): { normalizedItems: BudgetLineItem[]; contingencyPct: number } {
  const safeCap = Math.max(1000, Math.round(totalBudget));
  const clampedRatio = Math.min(0.1, Math.max(0.05, targetContingencyRatio));

  // Separate regular items from any existing contingency item
  const nonContingency = items.filter(
    (item) =>
      !item.isContingency &&
      !/contingency|emergency\s*buffer|आपातकालीन|राखीव\s*निधी/i.test(
        `${item.category} ${item.itemName}`
      )
  );

  const fallbackItems: BudgetLineItem[] =
    nonContingency.length > 0
      ? nonContingency
      : [
          {
            id: `b-fallback-1`,
            category: 'Venue & Mandap',
            itemName: 'Heritage Venue & Lawn Booking',
            estimated: Math.round(safeCap * 0.32),
            actual: Math.round(safeCap * 0.32),
          },
          {
            id: `b-fallback-2`,
            category: 'Catering & Royal Feast',
            itemName: 'Multi-Regional Live Counters & Mithai',
            estimated: Math.round(safeCap * 0.35),
            actual: Math.round(safeCap * 0.35),
          },
          {
            id: `b-fallback-3`,
            category: 'Decor, Florals & Sound',
            itemName: 'Marigold Installations, Lighting & Sangeet Audio',
            estimated: Math.round(safeCap * 0.25),
            actual: Math.round(safeCap * 0.25),
          },
        ];

  const contingencyAmount = Math.round(safeCap * clampedRatio);
  const allocatablePool = safeCap - contingencyAmount;

  const rawEstimatedSum = fallbackItems.reduce(
    (sum, i) => sum + Math.max(1, Number(i.estimated) || 1),
    0
  );

  let runningEstimatedSum = 0;
  const scaledNonContingency: BudgetLineItem[] = fallbackItems.map((item, idx) => {
    const isLast = idx === fallbackItems.length - 1;
    const weight = Math.max(1, Number(item.estimated) || 1) / rawEstimatedSum;
    const exactShare = isLast
      ? Math.max(0, allocatablePool - runningEstimatedSum)
      : Math.round(allocatablePool * weight);

    runningEstimatedSum += exactShare;

    // Keep actual <= exactShare so total never exceeds cap on initial normalization
    const cappedActual =
      item.actual && item.actual <= exactShare ? Math.round(item.actual) : exactShare;

    return {
      ...item,
      estimated: exactShare,
      actual: cappedActual,
      isContingency: false,
    };
  });

  const contingencyItem: BudgetLineItem = {
    id: `b-contingency-guardrail`,
    category: 'Emergency Contingency (Guardrail 5–10%)',
    itemName: 'Unforeseen Weather, Last-Minute Guests & Vendor Overtime Buffer (8%)',
    estimated: contingencyAmount,
    actual: contingencyAmount,
    isContingency: true,
    notes: 'Mandatory 5–10% PromptWars Operational Guardrail Reserve',
  };

  const finalItems = [...scaledNonContingency, contingencyItem];
  const actualContingencyPct = Number(((contingencyAmount / safeCap) * 100).toFixed(1));

  return {
    normalizedItems: finalItems,
    contingencyPct: actualContingencyPct,
  };
}

/**
 * Operational Guardrail 3 (Part B): Tailor timeline phases realistically to days remaining until event date.
 */
export function tailorTimelineToDaysRemaining(
  items: TimelineItem[],
  eventDateStr: string
): { tailoredItems: TimelineItem[]; daysRemaining: number } {
  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (new Date(eventDateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  const tailoredItems = items.map((item) => {
    let adjustedPhase: TimelinePhase = item.phase;
    if (daysRemaining < 30 && (item.phase === '6+ Months Out' || item.phase === '3 Months Out')) {
      adjustedPhase = 'Week Of';
    } else if (daysRemaining < 90 && item.phase === '6+ Months Out') {
      adjustedPhase = '1 Month Out';
    } else if (daysRemaining < 180 && item.phase === '6+ Months Out') {
      adjustedPhase = '3 Months Out';
    }
    return {
      ...item,
      phase: adjustedPhase,
    };
  });

  return { tailoredItems, daysRemaining };
}

/**
 * Computes full audit telemetry for an EventPlan
 */
export function evaluateEventGuardrails(
  event: EventPlan,
  threatTriggers: string[] = []
): GuardrailTelemetry {
  const totalEstimated = event.budgetItems.reduce((s, i) => s + i.estimated, 0);
  const totalActual = event.budgetItems.reduce((s, i) => s + i.actual, 0);
  const contingencySum = event.budgetItems
    .filter(
      (i) =>
        i.isContingency ||
        /contingency|emergency|आपातकालीन|राखीव/i.test(`${i.category} ${i.itemName}`)
    )
    .reduce((s, i) => s + i.estimated, 0);

  const contingencyPct =
    event.totalBudget > 0
      ? Number(((contingencySum / event.totalBudget) * 100).toFixed(1))
      : 0;

  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  return {
    promptInjectionBlocked: threatTriggers.length > 0,
    threatTriggersDetected: threatTriggers,
    budgetExact100PercentSum: Math.abs(totalEstimated - event.totalBudget) <= 1,
    contingencyPercentage: contingencyPct,
    withinCap: totalEstimated <= event.totalBudget && totalActual <= event.totalBudget,
    daysRemainingToEvent: daysRemaining,
    lastValidatedAt: new Date().toLocaleTimeString(),
  };
}
