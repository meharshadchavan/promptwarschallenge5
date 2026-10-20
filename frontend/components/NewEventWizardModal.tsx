import React, { useState } from 'react';
import { Sparkles, X, Calendar, MapPin, Users, DollarSign, Wand2, Loader2 } from 'lucide-react';
import { EventPlan, EventType } from '../types';
import { generateFullEventBlueprint } from '../services/geminiService';

interface NewEventWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newPlan: EventPlan) => void;
}

const PRESET_VIBES: Record<EventType, string[]> = {
  [EventType.WEDDING]: [
    'Coastal Linen & Driftwood',
    'Candlelit Tuscan Greenhouse',
    'Modern Art Gallery Black-Tie',
    'Wildflower Meadow & Folk Band',
  ],
  [EventType.BIRTHDAY]: [
    '70s Tokyo Vinyl & Mezcal Lounge',
    'Amalfi Citrus Garden Brunch',
    'Midnight Velvet Speakeasy Dinner',
    'Desert Stargazing & Chef’s Table',
  ],
  [EventType.COMMUNITY]: [
    'Autumn Farm-to-Street Harvest Table',
    'Neighborhood Botanical & Ceramics Market',
    'Summer Solstice Twilight Cinema & Food Trucks',
    'Charity Art Auction & Jazz Courtyard',
  ],
};

export const NewEventWizardModal: React.FC<NewEventWizardModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [type, setType] = useState<EventType>(EventType.WEDDING);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2025-10-12');
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState(100);
  const [totalBudget, setTotalBudget] = useState(35000);
  const [vibeDescription, setVibeDescription] = useState(
    'Warm architectural minimalism, long linen banquet tables, seasonal botanical installations, and unforgettable hospitality.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectType = (newType: EventType) => {
    setType(newType);
    if (newType === EventType.WEDDING) {
      setGuestCount(120);
      setTotalBudget(48000);
    } else if (newType === EventType.BIRTHDAY) {
      setGuestCount(50);
      setTotalBudget(9500);
    } else {
      setGuestCount(250);
      setTotalBudget(15000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsGenerating(true);
    try {
      const plan = await generateFullEventBlueprint({
        title:
          title.trim() ||
          (type === EventType.WEDDING
            ? 'Autumn Conservatory Wedding'
            : type === EventType.BIRTHDAY
            ? 'Milestone Golden Hour Soirée'
            : 'Neighborhood Makers & Harvest Gathering'),
        type,
        date,
        location: location.trim() || 'Botanical Courtyard & Loft',
        guestCount: Number(guestCount) || 80,
        totalBudget: Number(totalBudget) || 20000,
        vibeDescription,
      });
      onCreated(plan);
      onClose();
    } catch (err: any) {
      setError(
        err?.message ||
          'We encountered an issue generating your blueprint. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#FBF9F5] border border-[#E6E0D6] rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          disabled={isGenerating}
          className="absolute top-5 right-5 p-2 rounded-full text-[#68625D] hover:text-[#1C1917] hover:bg-[#F3EFEA] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#C86D51] font-semibold mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Bespoke AI Event Architect</span>
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#1C1917] mb-2">
          Commission a New Event Blueprint
        </h2>
        <p className="text-sm text-[#68625D] mb-6">
          Gemini will architect a tailored budget allocation, multi-month production timeline, vendor checklist, and sensory moodboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Event Archetype */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#68625D] mb-2">
              1. Select Event Archetype
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[EventType.WEDDING, EventType.BIRTHDAY, EventType.COMMUNITY].map((item) => {
                const active = type === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelectType(item)}
                    className={`py-3 px-4 rounded-xl border text-left transition-all ${
                      active
                        ? 'bg-[#1C1917] text-[#FBF9F5] border-[#1C1917] shadow-sm'
                        : 'bg-[#F3EFEA]/60 text-[#1C1917] border-[#E6E0D6] hover:border-[#C86D51]'
                    }`}
                  >
                    <div className="font-serif text-lg font-medium">{item}</div>
                    <div
                      className={`text-xs mt-0.5 ${
                        active ? 'text-[#E6E0D6]' : 'text-[#68625D]'
                      }`}
                    >
                      {item === EventType.WEDDING
                        ? 'Ceremony & reception'
                        : item === EventType.BIRTHDAY
                        ? 'Milestone & dinner'
                        : 'Festival & local gather'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#68625D] mb-1.5">
                Event Title
              </label>
              <input
                type="text"
                required
                placeholder={
                  type === EventType.WEDDING
                    ? 'e.g., Elena & Marcus — Sonoma Vineyard Wedding'
                    : type === EventType.BIRTHDAY
                    ? 'e.g., Naomi’s 40th — Candlelit Jazz Supper'
                    : 'e.g., Linden Street Spring Botanical Fair'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E6E0D6] text-sm text-[#1C1917] focus:outline-none focus:border-[#C86D51]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#68625D] mb-1.5">
                City or Venue Setting
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#68625D] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g., Santa Barbara, CA or Rooftop Conservatory"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white border border-[#E6E0D6] text-sm text-[#1C1917] focus:outline-none focus:border-[#C86D51]"
                />
              </div>
            </div>
          </div>

          {/* Date, Guests, Budget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#68625D] mb-1.5">
                Target Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#68625D] absolute left-3 top-3" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-[#E6E0D6] text-sm font-mono text-[#1C1917] focus:outline-none focus:border-[#C86D51]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#68625D] mb-1.5">
                Guest Count
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-[#68625D] absolute left-3 top-3" />
                <input
                  type="number"
                  min={5}
                  max={5000}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-[#E6E0D6] text-sm font-mono text-[#1C1917] focus:outline-none focus:border-[#C86D51]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#68625D] mb-1.5">
                Total Budget (USD)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-[#68625D] absolute left-3 top-3" />
                <input
                  type="number"
                  min={500}
                  step={500}
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-[#E6E0D6] text-sm font-mono text-[#1C1917] focus:outline-none focus:border-[#C86D51]"
                />
              </div>
            </div>
          </div>

          {/* Aesthetic & Sensory Direction */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#68625D]">
                Aesthetic Direction &amp; Priorities
              </label>
              <span className="text-xs text-[#68625D]">Click a quick vibe tag to append</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_VIBES[type].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    setVibeDescription((prev) =>
                      prev.includes(preset) ? prev : `${prev.trim()} • ${preset}`
                    )
                  }
                  className="text-xs px-2.5 py-1 rounded-full bg-[#F3EFEA] hover:bg-[#E6E0D6] text-[#1C1917] transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              value={vibeDescription}
              onChange={(e) => setVibeDescription(e.target.value)}
              placeholder="Describe the atmosphere, music, culinary style, and non-negotiables..."
              className="w-full p-3.5 rounded-lg bg-white border border-[#E6E0D6] text-sm text-[#1C1917] focus:outline-none focus:border-[#C86D51]"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[#B84A39]/10 border border-[#B84A39]/30 text-xs text-[#B84A39]">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E6E0D6]">
            <button
              type="button"
              disabled={isGenerating}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#68625D] hover:text-[#1C1917]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C86D51] hover:bg-[#b55d42] text-white text-sm font-medium shadow-sm transition-all disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Architecting Blueprint with Gemini...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Full Event Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
