import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  X,
  CheckCircle2,
  Wand2,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { EventPlan, SupportedLanguage } from '../types';
import { runEventCopilotAction } from '../services/geminiService';
import { formatINR, SUPPORTED_LANGUAGES } from '../services/i18nService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  appliedBadge?: string;
  securityFlagged?: boolean;
}

interface CopilotDrawerProps {
  event: EventPlan;
  language: SupportedLanguage;
  isOpen: boolean;
  initialPrompt: string | null;
  onClearInitialPrompt: () => void;
  onClose: () => void;
  onApplyPlanUpdates: (updates: Partial<EventPlan>) => void;
}

const QUICK_PROMPTS = [
  'Rebalance budget to 100% of cap with an 8% contingency buffer',
  'Add 3 Day-Of Muhurat, Baraat & Pangat dining cues to timeline',
  'Add Pure Jain & Sattvic catering vetting questions to vendors',
  'Suggest 2 eco-friendly Indian welcome ideas for senior & young guests',
];

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  event,
  language,
  isOpen,
  initialPrompt,
  onClearInitialPrompt,
  onClose,
  onApplyPlanUpdates,
}) => {
  const langMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) ||
    SUPPORTED_LANGUAGES[0];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Namaste! Welcome to the Fête & Folio Producer Desk (${langMeta.nativeName}). I have full context on **${event.title}** (${event.guestCount} guests, ${formatINR(event.totalBudget, language)} cap). All inputs are protected by <user_event_context> guardrails and 5–10% contingency enforcement.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await runEventCopilotAction(event, trimmed, language);
      if (result.updatedPlan) {
        onApplyPlanUpdates(result.updatedPlan);
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: result.replyText,
          appliedBadge: result.appliedBadge,
          securityFlagged: result.securityFlagged,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text:
            err?.message ||
            'I encountered a temporary hiccup reaching the studio model. Please try your request again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSend(initialPrompt);
      onClearInitialPrompt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialPrompt]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[430px] bg-[#FBF9F5] border-l border-[#E6E0D6] shadow-2xl flex flex-col">
      {/* Drawer Header */}
      <div className="p-5 bg-[#F3EFEA] border-b border-[#E6E0D6] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#C86D51] text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif text-lg font-semibold text-[#1C1917] leading-none">
                AI Executive Producer
              </h3>
              <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-[#3B6E52]/15 text-[#3B6E52] font-semibold">
                <ShieldCheck className="w-3 h-3" /> Guarded
              </span>
            </div>
            <p className="text-[11px] text-[#68625D] mt-0.5 truncate max-w-[240px]">
              {langMeta.nativeName} • {event.title}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full text-[#68625D] hover:text-[#1C1917] hover:bg-white/60 transition-colors"
          aria-label="Close Copilot"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Action Chips */}
      <div className="px-4 py-3 bg-[#FBF9F5] border-b border-[#E6E0D6] overflow-x-auto">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-[#68625D] mb-2">
          One-Click Guardrail-Verified Actions
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              disabled={isLoading}
              className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-[#F3EFEA] hover:bg-[#E6E0D6] text-[#1C1917] transition-colors inline-flex items-center gap-1"
            >
              <Wand2 className="w-3 h-3 text-[#C86D51] shrink-0" />
              <span className="line-clamp-1">{qp}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#1C1917] text-[#FBF9F5]'
                  : 'bg-white border border-[#E6E0D6] text-[#1C1917] shadow-sm'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {msg.appliedBadge && (
                <div
                  className={`mt-2.5 pt-2 border-t border-[#E6E0D6] flex items-center gap-1.5 text-[11px] font-semibold ${
                    msg.securityFlagged ? 'text-[#B84A39]' : 'text-[#3B6E52]'
                  }`}
                >
                  {msg.securityFlagged ? (
                    <ShieldAlert className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>{msg.appliedBadge}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[#68625D] bg-white border border-[#E6E0D6] rounded-2xl px-4 py-3 w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-[#C86D51]" />
            <span>Validating guardrails &amp; updating blueprint...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-4 bg-[#F3EFEA] border-t border-[#E6E0D6] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask in ${langMeta.nativeName} to adjust budget, timeline, or vendors...`}
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E0D6] text-xs text-[#1C1917] focus:outline-none focus:border-[#C86D51]"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 rounded-xl bg-[#C86D51] hover:bg-[#b55d42] text-white disabled:opacity-50 transition-colors"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
