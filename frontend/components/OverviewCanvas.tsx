import React from 'react';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  CheckCircle2,
  Sparkles,
  UtensilsCrossed,
  Palette,
  ArrowUpRight,
} from 'lucide-react';
import { EventPlan, WorkspaceTab } from '../types';

interface OverviewCanvasProps {
  event: EventPlan;
  onNavigateTab: (tab: WorkspaceTab) => void;
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

export const OverviewCanvas: React.FC<OverviewCanvasProps> = ({
  event,
  onNavigateTab,
  onOpenCopilotWithPrompt,
}) => {
  const totalEstimated = event.budgetItems.reduce((sum, item) => sum + item.estimated, 0);
  const totalActual = event.budgetItems.reduce((sum, item) => sum + item.actual, 0);
  const completedTimeline = event.timelineItems.filter((t) => t.completed).length;
  const bookedVendors = event.vendorChecklist.filter(
    (v) => v.status === 'Booked' || v.status === 'Paid'
  ).length;

  const daysUntil = Math.max(
    0,
    Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="space-y-8">
      {/* Editorial Hero Banner */}
      <div className="bg-gradient-to-br from-[#F3EFEA] via-[#FBF9F5] to-[#EFE8DD] border border-[#E6E0D6] rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs uppercase tracking-[0.12em] font-semibold bg-[#C86D51]/15 text-[#C86D51]">
              {event.type} Folio
            </span>
            <span className="text-xs font-mono text-[#68625D] bg-white/80 px-2.5 py-1 rounded-full border border-[#E6E0D6]">
              {daysUntil} days to curtain call
            </span>
          </div>

          <button
            onClick={() =>
              onOpenCopilotWithPrompt(
                `Review our ${event.title} plan and suggest 3 high-impact ways to elevate the guest experience while staying under $${event.totalBudget.toLocaleString()}.`
              )
            }
            className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#1C1917] text-[#FBF9F5] hover:bg-[#C86D51] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI Producer for Executive Audit</span>
          </button>
        </div>

        <h1 className="font-serif text-3xl md:text-5xl font-semibold text-[#1C1917] tracking-tight leading-[1.12] mb-4">
          {event.title}
        </h1>

        <p className="text-base md:text-lg text-[#45403C] max-w-3xl leading-relaxed mb-6 font-normal">
          {event.editorialSummary}
        </p>

        {/* Key Metadata Pill Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-[#E6E0D6]">
          <div className="bg-white/70 rounded-xl p-3.5 border border-[#E6E0D6]/80">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#68625D] mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#C86D51]" />
              <span>Event Date</span>
            </div>
            <div className="font-mono text-sm md:text-base font-semibold text-[#1C1917]">
              {new Date(event.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>

          <div className="bg-white/70 rounded-xl p-3.5 border border-[#E6E0D6]/80">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#68625D] mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#C86D51]" />
              <span>Setting</span>
            </div>
            <div className="text-sm md:text-base font-semibold text-[#1C1917] truncate">
              {event.location}
            </div>
          </div>

          <div className="bg-white/70 rounded-xl p-3.5 border border-[#E6E0D6]/80">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#68625D] mb-1">
              <Users className="w-3.5 h-3.5 text-[#4A6B5D]" />
              <span>Guest List</span>
            </div>
            <div className="font-mono text-sm md:text-base font-semibold text-[#1C1917]">
              {event.guestCount} Guests{' '}
              <span className="text-xs font-normal text-[#68625D]">
                (${Math.round(event.totalBudget / Math.max(1, event.guestCount))}/guest)
              </span>
            </div>
          </div>

          <div className="bg-white/70 rounded-xl p-3.5 border border-[#E6E0D6]/80">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#68625D] mb-1">
              <DollarSign className="w-3.5 h-3.5 text-[#4A6B5D]" />
              <span>Target Cap</span>
            </div>
            <div className="font-mono text-sm md:text-base font-semibold text-[#1C1917]">
              ${event.totalBudget.toLocaleString()}
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
                Financial Ledger
              </span>
              <button
                onClick={() => onNavigateTab(WorkspaceTab.BUDGET)}
                className="text-xs font-semibold text-[#C86D51] hover:underline inline-flex items-center gap-1"
              >
                Open Ledger <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="font-serif text-2xl font-semibold text-[#1C1917] mb-1">
              ${totalActual.toLocaleString()}{' '}
              <span className="text-sm font-sans font-normal text-[#68625D]">
                committed of ${event.totalBudget.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-[#68625D] mb-4">
              Estimated allocation: ${totalEstimated.toLocaleString()} across{' '}
              {event.budgetItems.length} categories
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
                {Math.round((totalActual / Math.max(1, event.totalBudget)) * 100)}% Utilized
              </span>
              <span>
                {event.totalBudget - totalActual >= 0
                  ? `$${(event.totalBudget - totalActual).toLocaleString()} buffer`
                  : `$${Math.abs(event.totalBudget - totalActual).toLocaleString()} over`}
              </span>
            </div>
          </div>
        </div>

        {/* Production Milestones Card */}
        <div className="bg-white border border-[#E6E0D6] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.08em] font-semibold text-[#68625D]">
                Run of Show &amp; Milestones
              </span>
              <button
                onClick={() => onNavigateTab(WorkspaceTab.TIMELINE)}
                className="text-xs font-semibold text-[#C86D51] hover:underline inline-flex items-center gap-1"
              >
                Timeline <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="font-serif text-2xl font-semibold text-[#1C1917] mb-1">
              {completedTimeline} of {event.timelineItems.length} Milestones Done
            </div>
            <p className="text-xs text-[#68625D] mb-4">
              Next up:{' '}
              <span className="text-[#1C1917] font-medium">
                {event.timelineItems.find((t) => !t.completed)?.title ||
                  'All milestones completed!'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-[#E6E0D6]">
            <CheckCircle2 className="w-4 h-4 text-[#4A6B5D]" />
            <span className="text-xs text-[#68625D]">
              Spans 6+ Months Out through Day-Of Run of Show
            </span>
          </div>
        </div>

        {/* Vendor Roster Card */}
        <div className="bg-white border border-[#E6E0D6] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.08em] font-semibold text-[#68625D]">
                Vendor Team
              </span>
              <button
                onClick={() => onNavigateTab(WorkspaceTab.VENDORS)}
                className="text-xs font-semibold text-[#C86D51] hover:underline inline-flex items-center gap-1"
              >
                Checklist <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="font-serif text-2xl font-semibold text-[#1C1917] mb-1">
              {bookedVendors} of {event.vendorChecklist.length} Vendors Secured
            </div>
            <p className="text-xs text-[#68625D] mb-4">
              Includes AI outreach email drafter &amp; contract interview questions
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

      {/* Sensory Direction: Color Story & Culinary Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Palette */}
        <div className="bg-white border border-[#E6E0D6] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#C86D51]" />
              <h3 className="font-serif text-xl font-semibold text-[#1C1917]">
                Curated Color Story &amp; Atmosphere
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab(WorkspaceTab.STUDIO)}
              className="text-xs text-[#C86D51] font-medium hover:underline"
            >
              Generate Visual Concept →
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
                Signature Menu &amp; Libation Notes
              </h3>
            </div>
            <button
              onClick={() =>
                onOpenCopilotWithPrompt(
                  `Create 3 additional seasonal menu or signature cocktail pairings that match our "${event.vibeKeywords.join(
                    ', '
                  )}" aesthetic.`
                )
              }
              className="text-xs text-[#4A6B5D] font-medium hover:underline"
            >
              + Ask AI Sommelier
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
