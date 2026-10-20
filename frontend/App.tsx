import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  LayoutGrid,
  IndianRupee,
  CalendarClock,
  CheckSquare,
  Palette,
  MessageSquare,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { INITIAL_EVENTS } from './constants';
import { EventPlan, SupportedLanguage, WorkspaceTab } from './types';
import {
  SUPPORTED_LANGUAGES,
  UI_TRANSLATIONS,
  formatINR,
} from './services/i18nService';
import { OverviewCanvas } from './components/OverviewCanvas';
import { BudgetManager } from './components/BudgetManager';
import { TimelinePlanner } from './components/TimelinePlanner';
import { VendorChecklist } from './components/VendorChecklist';
import { CreativeStudio } from './components/CreativeStudio';
import { NewEventWizardModal } from './components/NewEventWizardModal';
import { CopilotDrawer } from './components/CopilotDrawer';
import { GuardrailDiagnostics } from './components/GuardrailDiagnostics';

const STORAGE_KEY = 'fete_and_folio_india_events_v2';

export function App() {
  const [events, setEvents] = useState<EventPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to initial curated Indian events
    }
    return INITIAL_EVENTS;
  });

  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [activeEventId, setActiveEventId] = useState<string>(events[0].id);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(
    WorkspaceTab.OVERVIEW
  );
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState<string | null>(null);

  const t = UI_TRANSLATIONS[language];

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
      label: t.tabNames[WorkspaceTab.OVERVIEW],
      icon: LayoutGrid,
    },
    {
      tab: WorkspaceTab.BUDGET,
      label: t.tabNames[WorkspaceTab.BUDGET],
      icon: IndianRupee,
    },
    {
      tab: WorkspaceTab.TIMELINE,
      label: t.tabNames[WorkspaceTab.TIMELINE],
      icon: CalendarClock,
    },
    {
      tab: WorkspaceTab.VENDORS,
      label: t.tabNames[WorkspaceTab.VENDORS],
      icon: CheckSquare,
    },
    {
      tab: WorkspaceTab.STUDIO,
      label: t.tabNames[WorkspaceTab.STUDIO],
      icon: Palette,
    },
    {
      tab: WorkspaceTab.DIAGNOSTICS,
      label: t.tabNames[WorkspaceTab.DIAGNOSTICS],
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FBF9F5] text-[#1C1917]">
      {/* Left Atelier Navigation Sidebar */}
      <aside
        aria-label="Event Folio & Module Navigation"
        className="w-full lg:w-76 bg-[#F3EFEA] border-b lg:border-b-0 lg:border-r border-[#E6E0D6] flex flex-col justify-between shrink-0"
      >
        <div className="p-6 space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C86D51]" />
                <span className="font-serif text-2xl font-semibold tracking-tight text-[#1C1917]">
                  Fête &amp; Folio
                </span>
              </div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#68625D] mt-0.5">
                {t.appSubtitle}
              </p>
            </div>

            <button
              onClick={() => setIsWizardOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C86D51] hover:bg-[#b55d42] text-white text-xs font-semibold shadow-sm transition-colors"
              title="Commission a new AI Event Blueprint"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.newEventBtn}</span>
            </button>
          </div>

          {/* Multilingual Selector (English, Hindi, Marathi, French, Spanish) */}
          <div className="bg-white/80 border border-[#E6E0D6] rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#68625D] mb-2">
              <Globe className="w-3.5 h-3.5 text-[#C86D51]" />
              <span>Language / भाषा निवड</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const active = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all truncate ${
                      active
                        ? 'bg-[#1C1917] text-white shadow-sm'
                        : 'bg-[#F3EFEA] text-[#1C1917] hover:bg-[#E6E0D6]'
                    }`}
                  >
                    {lang.nativeName.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event Portfolio Switcher */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.14em] font-semibold text-[#68625D] mb-2">
              {t.activeFolios}
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
                      <span>{t.eventTypeNames[evt.type]}</span>
                      <span className="font-mono text-[#68625D]">
                        {formatINR(evt.totalBudget, language)}
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
          <nav className="space-y-1" aria-label="Workspace Tabs">
            <div className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#68625D] mb-2">
              {t.planningModules}
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
            <span>{t.openAiProducer}</span>
          </button>
          <p className="text-[11px] text-[#68625D] text-center leading-relaxed">
            {t.localPersistenceNotice}
          </p>
        </div>
      </aside>

      {/* Main Editorial Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Utility Bar */}
        <header className="sticky top-0 z-20 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#E6E0D6] px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-serif italic text-[#68625D] hidden sm:inline">
              {t.activeFolioLabel}
            </span>
            <h2 className="font-serif text-lg md:text-xl font-semibold text-[#1C1917] truncate">
              {activeEvent.title}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab(WorkspaceTab.DIAGNOSTICS)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#3B6E52]/30 bg-[#3B6E52]/10 text-xs font-semibold text-[#3B6E52] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Guardrails Verified</span>
            </button>

            <button
              onClick={() => setIsWizardOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E6E0D6] bg-white hover:border-[#C86D51] text-xs font-semibold text-[#1C1917] transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#C86D51]" />
              <span>{t.aiBlueprintWizard}</span>
            </button>

            <button
              onClick={() => setIsCopilotOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C86D51] hover:bg-[#b55d42] text-white text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t.aiCopilot}</span>
            </button>
          </div>
        </header>

        {/* Central Canvas */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10">
          {activeTab === WorkspaceTab.OVERVIEW && (
            <OverviewCanvas
              event={activeEvent}
              language={language}
              onNavigateTab={setActiveTab}
              onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
              onUpdateEvent={handleUpdateActiveEvent}
            />
          )}

          {activeTab === WorkspaceTab.BUDGET && (
            <BudgetManager
              event={activeEvent}
              language={language}
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

          {activeTab === WorkspaceTab.DIAGNOSTICS && (
            <GuardrailDiagnostics event={activeEvent} language={language} />
          )}
        </main>
      </div>

      {/* New Event Blueprint Modal */}
      <NewEventWizardModal
        isOpen={isWizardOpen}
        language={language}
        onClose={() => setIsWizardOpen(false)}
        onCreated={handleCreatedEvent}
      />

      {/* Contextual AI Copilot Drawer */}
      <CopilotDrawer
        event={activeEvent}
        language={language}
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
