import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Sparkles,
  UtensilsCrossed,
  Palette,
  ArrowUpRight,
  ShieldCheck,
  HeartHandshake,
  Accessibility,
  Languages,
  Loader2,
  IndianRupee,
} from 'lucide-react';
import { EventPlan, SupportedLanguage, WorkspaceTab } from '../types';
import { UI_TRANSLATIONS, formatINR } from '../services/i18nService';
import { translateEventPlanContent } from '../services/geminiService';

interface OverviewCanvasProps {
  event: EventPlan;
  language: SupportedLanguage;
  onNavigateTab: (tab: WorkspaceTab) => void;
  onOpenCopilotWithPrompt: (prompt: string) => void;
  onUpdateEvent: (updated: Partial<EventPlan>) => void;
}

export const OverviewCanvas: React.FC<OverviewCanvasProps> = ({
  event,
  language,
  onNavigateTab,
  onOpenCopilotWithPrompt,
  onUpdateEvent,
}) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const t = UI_TRANSLATIONS[language];

  const totalEstimated = event.budgetItems.reduce((sum, item) => sum + item.estimated, 0);
  const totalActual = event.budgetItems.reduce((sum, item) => sum + item.actual, 0);
  const completedTimeline = event.timelineItems.filter((item) => item.completed).length;
  const bookedVendors = event.vendorChecklist.filter(
    (v) => v.status === 'Booked' || v.status === 'Paid'
  ).length;

  const contingencySum = event.budgetItems
    .filter(
      (i) =>
        i.isContingency ||
        /contingency|emergency|आपातकालीन|राखीव/i.test(`${i.category} ${i.itemName}`)
    )
    .reduce((s, i) => s + i.estimated, 0);
  const contingencyPct =
    event.totalBudget > 0
      ? ((contingencySum / event.totalBudget) * 100).toFixed(1)
      : '8.0';

  const daysUntil = Math.max(
    0,
    Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  const handleTranslateFolio = async () => {
    setIsTranslating(true);
    try {
      const translatedFields = await translateEventPlanContent(event, language);
      onUpdateEvent(translatedFields);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Editorial Hero Banner */}
      <div className="bg-gradient-to-br from-[#F3EFEA] via-[#FBF9F5] to-[#EFE8DD] border border-[#E6E0D6] rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs uppercase tracking-[0.12em] font-semibold bg-[#C86D51]/15 text-[#C86D51]">
              {t.eventTypeNames[event.type]}
            </span>
            <span className="text-xs font-mono text-[#68625D] bg-white/80 px-2.5 py-1 rounded-full border border-[#E6E0D6]">
              {daysUntil} {t.daysToCurtainCall}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#3B6E52] bg-[#3B6E52]/10 px-2.5 py-1 rounded-full border border-[#3B6E52]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.guardrailActiveBadge} ({contingencyPct}%)</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTranslateFolio}
              disabled={isTranslating}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-[#E6E0D6] text-[#1C1917] hover:border-[#C86D51] transition-colors disabled:opacity-60"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C86D51]" />
                  <span>{t.translatingPlan}</span>
                </>
              ) : (
                <>
                  <Languages className="w-3.5 h-3.5 text-[#C86D51]" />
                  <span>{t.translatePlanBtn}</span>
                </>
              )}
            </button>

            <button
              onClick={() =>
                onOpenCopilotWithPrompt(
                  `Audit our ${event.title} plan for cultural nuances, Jain/dietary inclusivity, senior citizen accessibility, and ensure our budget stays 100% locked within ${formatINR(event.totalBudget, language)} with an 8% contingency buffer.`
                )
              }
              className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#1C1917] text-[#FBF9F5] hover:bg-[#C86D51] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.askAiAudit}</span>
            </button>
          </div>
        </div>

        <h1 className="font-serif text-3xl md:text-5xl font-semibold text-[#1C1917] tracking-tight leading-[1.14] mb-4">
          {event.title}
        </h1>

        <p className="text-base md:text-lg text-[#45403C] max-w-3xl leading-relaxed mb-6 font-normal">
          {event.editorialSummary}
        </p>

        {/* Key Metadata Pill Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-[#E6E0D6]">
          <div className="bg-white/80 rounded-xl p-3.5 border border-[#E6E0D6]">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#68625D] mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#C86D51]" />
              <span>{t.eventDate}</span>
            </div>
            <div className="font-mono text-sm md:text-base font-semibold text-[#1C1917]">
              {new Date(event.date).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>

          <div className="bg-white/80 rounded-xl p-3.5 border border-[#E6E0D6]">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#68625D] mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#C86D51]" />
              <span>{t.setting}</span>
            </div>
            <div className="text-sm md:text-base font-semibold text-[#1C1917] truncate">
              {event.location}
            </div>
          </div>

          <div className="bg-white/80 rounded-xl p-3.5 border border-[#E6E0D6]">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#68625D] mb-1">
              <Users className="w-3.5 h-3.5 text-[#4A6B5D]" />
              <span>{t.guestList}</span>
            </div>
            <div className="font-mono text-sm md:text-base font-semibold text-[#1C1917]">
              {event.guestCount}{' '}
              <span className="text-xs font-normal text-[#68625D]">
                ({formatINR(Math.round(event.totalBudget / Math.max(1, event.guestCount)), language)}
                {t.perGuest})
              </span>
            </div>
          </div>

          <div className="bg-white/80 rounded-xl p-3.5 border border-[#E6E0D6]">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#68625D] mb-1">
              <IndianRupee className="w-3.5 h-3.5 text-[#4A6B5D]" />
              <span>{t.targetCap}</span>
            </div>
            <div className="font-mono text-sm md:text-base font-semibold text-[#1C1917]">
              {formatINR(event.totalBudget, language)}
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Bento Readiness Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Budget Pulse Card */}
        <div className="bg-white border border-[#E6E0D6] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.08em] font-semibold text-[#68625D]">
                {t.financialLedger}
              </span>
              <button
                onClick={() => onNavigateTab(WorkspaceTab.BUDGET)}
                className="text-xs font-semibold text-[#C86D51] hover:underline inline-flex items-center gap-1"
              >
                {t.openLedger} <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="font-serif text-2xl font-semibold text-[#1C1917] mb-1">
              {formatINR(totalActual, language)}{' '}
              <span className="text-sm font-sans font-normal text-[#68625D]">
                {t.committedOf} {formatINR(event.totalBudget, language)}
              </span>
            </div>
            <p className="text-xs text-[#68625D] mb-4">
              Includes {formatINR(contingencySum, language)} ({contingencyPct}%) emergency reserve
            </p>
          </div>

          <div>
            <div className="w-full h-2.5 bg-[#F3EFEA] rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all ${
                  totalActual > event.totalBudget ? 'bg-[#B84A39]' : 'bg-[#4A6B5D]'
                }`}
                style={{
                  width: `${Math.min(100, Math.round((totalActual / Math.max(1, event.totalBudget)) * 100))}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono text-[#68625D]">
              <span>
                {Math.round((totalEstimated / Math.max(1, event.totalBudget)) * 100)}% {t.utilized}
              </span>
              <span>
                {event.totalBudget - totalActual >= 0
                  ? `${formatINR(event.totalBudget - totalActual, language)} ${t.buffer}`
                  : `${formatINR(Math.abs(event.totalBudget - totalActual), language)} ${t.overBudget}`}
              </span>
            </div>
          </div>
        </div>

        {/* Production Milestones Card */}
        <div className="bg-white border border-[#E6E0D6] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.08em] font-semibold text-[#68625D]">
                {t.runOfShowMilestones}
              </span>
              <button
                onClick={() => onNavigateTab(WorkspaceTab.TIMELINE)}
                className="text-xs font-semibold text-[#C86D51] hover:underline inline-flex items-center gap-1"
              >
                Timeline <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="font-serif text-2xl font-semibold text-[#1C1917] mb-1">
              {completedTimeline} / {event.timelineItems.length} {t.milestonesDone}
            </div>
            <p className="text-xs text-[#68625D] mb-4">
              Next:{' '}
              <span className="text-[#1C1917] font-medium">
                {event.timelineItems.find((item) => !item.completed)?.title ||
                  'All milestones completed!'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-[#E6E0D6]">
            <CheckCircle2 className="w-4 h-4 text-[#4A6B5D]" />
            <span className="text-xs text-[#68625D]">
              Tailored realistically to {daysUntil} days remaining
            </span>
          </div>
        </div>

        {/* Vendor Roster Card */}
        <div className="bg-white border border-[#E6E0D6] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.08em] font-semibold text-[#68625D]">
                {t.vendorTeam}
              </span>
              <button
                onClick={() => onNavigateTab(WorkspaceTab.VENDORS)}
                className="text-xs font-semibold text-[#C86D51] hover:underline inline-flex items-center gap-1"
              >
                Checklist <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="font-serif text-2xl font-semibold text-[#1C1917] mb-1">
              {bookedVendors} / {event.vendorChecklist.length} {t.vendorsSecured}
            </div>
            <p className="text-xs text-[#68625D] mb-4">
              Multilingual outreach drafter &amp; contract vetting questions
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#E6E0D6]">
            {event.vendorChecklist.slice(0, 4).map((v) => (
              <span
                key={v.id}
                className="text-xs px-2.5 py-0.5 rounded-full bg-[#F3EFEA] text-[#1C1917]"
              >
                {v.category}: {v.status}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Guardrail 4: Cultural, Dietary & Accessibility Inclusivity Matrix */}
      {event.inclusivity && (
        <div className="bg-white border border-[#E6E0D6] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[#C86D51]" />
              <h3 className="font-serif text-2xl font-semibold text-[#1C1917]">
                {t.inclusivityTitle}
              </h3>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-[#4A6B5D]/10 text-[#4A6B5D] font-semibold">
              Guardrail #4 • Universal Inclusivity
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6]">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C86D51] mb-2">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>{t.dietaryLabel}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#1C1917]">
                {event.inclusivity.dietaryRequirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#C86D51]">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6]">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#4A6B5D] mb-2">
                <Accessibility className="w-3.5 h-3.5" />
                <span>{t.accessibilityLabel}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#1C1917]">
                {event.inclusivity.accessibilityNeeds.map((acc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#4A6B5D]">•</span>
                    <span>{acc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6]">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D4A359] mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.culturalLabel}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#1C1917]">
                {event.inclusivity.culturalTraditions.map((trad, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#D4A359]">•</span>
                    <span>{trad}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Sensory Direction: Color Story & Culinary Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Palette */}
        <div className="bg-white border border-[#E6E0D6] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#C86D51]" />
              <h3 className="font-serif text-xl font-semibold text-[#1C1917]">
                {t.colorStoryTitle}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab(WorkspaceTab.STUDIO)}
              className="text-xs text-[#C86D51] font-medium hover:underline"
            >
              Render AI Visual →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
            {event.colorPalette.map((swatch, index) => (
              <div
                key={`${swatch.name}-${index}`}
                className="group rounded-xl border border-[#E6E0D6] p-2 bg-[#FBF9F5]"
              >
                <div
                  className="h-14 w-full rounded-lg mb-2 border border-black/5 shadow-inner"
                  style={{ backgroundColor: swatch.hex }}
                />
                <div className="text-xs font-medium text-[#1C1917] truncate">
                  {swatch.name}
                </div>
                <div className="text-[11px] font-mono text-[#68625D] uppercase">
                  {swatch.hex}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {event.vibeKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-xs bg-[#F3EFEA] text-[#1C1917] border border-[#E6E0D6]"
              >
                ✦ {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Culinary & Libations */}
        <div className="bg-white border border-[#E6E0D6] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-[#4A6B5D]" />
              <h3 className="font-serif text-xl font-semibold text-[#1C1917]">
                {t.signatureMenuTitle}
              </h3>
            </div>
            <button
              onClick={() =>
                onOpenCopilotWithPrompt(
                  `Suggest 3 additional authentic regional Indian dishes or zero-proof botanical beverages for ${event.title} that accommodate Jain, Vegan, and elder guests.`
                )
              }
              className="text-xs text-[#4A6B5D] font-medium hover:underline"
            >
              + Ask AI Culinary Director
            </button>
          </div>

          <ul className="space-y-3">
            {event.signatureCocktailsOrMenu.map((dish, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6]/70"
              >
                <span className="font-serif italic text-base text-[#C86D51] font-semibold">
                  0{idx + 1}.
                </span>
                <span className="text-sm text-[#1C1917] font-medium">{dish}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
