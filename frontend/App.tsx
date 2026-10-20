import React, { useState, useEffect } from 'react';
// Fix: Replace non-existent MessageSquareSparkles icon with MessageSquare from lucide-react
import {
  Sparkles,
  Plus,
  LayoutGrid,
  DollarSign,
  CalendarClock,
  CheckSquare,
  Palette,
  MessageSquare,
} from 'lucide-react';
import { INITIAL_EVENTS } from './constants';
import { EventPlan, WorkspaceTab } from './types';
import { OverviewCanvas } from './components/OverviewCanvas';
import { BudgetManager } from './components/BudgetManager';
import { TimelinePlanner } from './components/TimelinePlanner';
import { VendorChecklist } from './components/VendorChecklist';
import { CreativeStudio } from './components/CreativeStudio';
import { NewEventWizardModal } from './components/NewEventWizardModal';
import { CopilotDrawer } from './components/CopilotDrawer';

const STORAGE_KEY = 'fete_and_folio_events_v1';

export function App() {
  const [events, setEvents] = useState<EventPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to initial events
    }
    return INITIAL_EVENTS;
  });

  const [activeEventId, setActiveEventId] = useState<string>(events[0].id);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(
    WorkspaceTab.OVERVIEW
  );
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      // ignore storage quota errors
    }
  }, [events]);

  const activeEvent =
    events.find((e) => e.id === activeEventId) || events[0];

  const handleUpdateActiveEvent = (updates: Partial<EventPlan>) => {
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === activeEvent.id ? { ...evt, ...updates } : evt
      )
    );
  };

  const handleCreatedEvent = (newPlan: EventPlan) => {
    setEvents((prev) => [newPlan, ...prev]);
    setActiveEventId(newPlan.id);
    setActiveTab(WorkspaceTab.OVERVIEW);
  };

  const handleOpenCopilotWithPrompt = (prompt: string) => {
    setCopilotPrompt(prompt);
    setIsCopilotOpen(true);
  };

  const navItems = [
    {
      tab: WorkspaceTab.OVERVIEW,
      label: 'Overview & Blueprint',
      icon: LayoutGrid,
    },
    {
      tab: WorkspaceTab.BUDGET,
      label: 'Budget Ledger',
      icon: DollarSign,
    },
    {
      tab: WorkspaceTab.TIMELINE,
      label: 'Timeline & Run of Show',
      icon: CalendarClock,
    },
    {
      tab: WorkspaceTab.VENDORS,
      label: 'Vendor Checklist',
      icon: CheckSquare,
    },
    {
      tab: WorkspaceTab.STUDIO,
      label: 'Creative AI Studio',
      icon: Palette,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FBF9F5] text-[#1C1917]">
      {/* Left Atelier Navigation Sidebar */}
      <aside className="w-full lg:w-72 bg-[#F3EFEA] border-b lg:border-b-0 lg:border-r border-[#E6E0D6] flex flex-col justify-between shrink-0">
        <div className="p-6 space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C86D51]" />
                <span className="font-serif text-2xl font-semibold tracking-tight text-[#1C1917]">
                  Fête &amp; Folio
                </span>
              </div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-[#68625D] mt-0.5">
                Bespoke Event Atelier
              </p>
            </div>

            <button
              onClick={() => setIsWizardOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C86D51] hover:bg-[#b55d42] text-white text-xs font-semibold shadow-sm transition-colors"
              title="Commission a new AI Event Blueprint"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Event</span>
            </button>
          </div>

          {/* Event Portfolio Switcher */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.14em] font-semibold text-[#68625D] mb-2">
              Active Event Folios
            </label>
            <div className="space-y-1.5">
              {events.map((evt) => {
                const selected = evt.id === activeEvent.id;
                return (
                  <button
                    key={evt.id}
                    onClick={() => setActiveEventId(evt.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selected
                        ? 'bg-white border-[#C86D51] shadow-sm'
                        : 'bg-[#FBF9F5]/60 border-[#E6E0D6] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold text-[#C86D51] mb-0.5">
                      <span>{evt.type}</span>
                      <span className="font-mono text-[#68625D]">
                        ${(evt.totalBudget / 1000).toFixed(1)}k
                      </span>
                    </div>
                    <div className="font-serif text-base font-semibold text-[#1C1917] leading-snug line-clamp-1">
                      {evt.title}
                    </div>
                    <div className="text-[11px] text-[#68625D] mt-0.5">
                      {evt.guestCount} guests • {evt.location.split(',')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workspace Module Navigation */}
          <nav className="space-y-1">
            <div className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#68625D] mb-2">
              Planning Modules
            </div>
            {navItems.map(({ tab, label, icon: Icon }) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#1C1917] text-[#FBF9F5] shadow-sm'
                      : 'text-[#68625D] hover:text-[#1C1917] hover:bg-white/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      active ? 'text-[#C86D51]' : 'text-[#68625D]'
                    }`}
                  />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom AI Copilot Launcher & Local Persistence Notice */}
        <div className="p-6 border-t border-[#E6E0D6] space-y-3">
          <button
            onClick={() => setIsCopilotOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#1C1917] to-[#322C28] hover:from-[#C86D51] hover:to-[#b55d42] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#D4A359]" />
            <span>Open AI Producer Desk</span>
          </button>
          <p className="text-[11px] text-[#68625D] text-center leading-relaxed">
            Folios auto-save locally in this browser.
          </p>
        </div>
      </aside>

      {/* Main Editorial Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Utility Bar */}
        <header className="sticky top-0 z-20 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#E6E0D6] px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-serif italic text-[#68625D] hidden sm:inline">
              Active Folio:
            </span>
            <h2 className="font-serif text-lg md:text-xl font-semibold text-[#1C1917] truncate">
              {activeEvent.title}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E6E0D6] bg-white hover:border-[#C86D51] text-xs font-semibold text-[#1C1917] transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#C86D51]" />
              <span>AI Blueprint Wizard</span>
            </button>

            <button
              onClick={() => setIsCopilotOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C86D51] hover:bg-[#b55d42] text-white text-xs font-semibold transition-colors"
            >
              {/* Fix: Use MessageSquare instead of MessageSquareSparkles */}
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Copilot</span>
            </button>
          </div>
        </header>

        {/* Central Canvas */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10">
          {activeTab === WorkspaceTab.OVERVIEW && (
            <OverviewCanvas
              event={activeEvent}
              onNavigateTab={setActiveTab}
              onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
            />
          )}

          {activeTab === WorkspaceTab.BUDGET && (
            <BudgetManager
              event={activeEvent}
              onUpdateEvent={handleUpdateActiveEvent}
              onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
            />
          )}

          {activeTab === WorkspaceTab.TIMELINE && (
            <TimelinePlanner
              event={activeEvent}
              onUpdateEvent={handleUpdateActiveEvent}
              onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
            />
          )}

          {activeTab === WorkspaceTab.VENDORS && (
            <VendorChecklist
              event={activeEvent}
              onUpdateEvent={handleUpdateActiveEvent}
              onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
            />
          )}

          {activeTab === WorkspaceTab.STUDIO && (
            <CreativeStudio
              event={activeEvent}
              onUpdateEvent={handleUpdateActiveEvent}
            />
          )}
        </main>
      </div>

      {/* New Event Blueprint Modal */}
      <NewEventWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreated={handleCreatedEvent}
      />

      {/* Contextual AI Copilot Drawer */}
      <CopilotDrawer
        event={activeEvent}
        isOpen={isCopilotOpen}
        initialPrompt={copilotPrompt}
        onClearInitialPrompt={() => setCopilotPrompt(null)}
        onClose={() => setIsCopilotOpen(false)}
        onApplyPlanUpdates={handleUpdateActiveEvent}
      />
    </div>
  );
}

export default App;
