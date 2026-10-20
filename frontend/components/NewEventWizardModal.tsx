import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Wand2,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { EventPlan, EventType, SupportedLanguage } from '../types';
import { generateFullEventBlueprint } from '../services/geminiService';
import { SUPPORTED_LANGUAGES } from '../services/i18nService';

interface NewEventWizardModalProps {
  isOpen: boolean;
  language: SupportedLanguage;
  onClose: () => void;
  onCreated: (newPlan: EventPlan) => void;
}

const PRESET_VIBES: Record<EventType, string[]> = {
  [EventType.WEDDING]: [
    'Royal Rajasthani Haveli & Marigolds',
    'Maharashtrian Paithani & Temple Courtyard',
    'South Indian Banana Leaf & Mogra Mandapam',
    'Intimate Glasshouse Sangeet & Sufi Night',
  ],
  [EventType.BIRTHDAY]: [
    'Bombay Art Deco Terrace & Unplugged Ghazals',
    'Golden 50th Courtyard High-Tea & Thali',
    '70s Retro Bollywood Vinyl & Chaat Bar',
    'Starlit Farmhouse Chef’s Table',
  ],
  [EventType.COMMUNITY]: [
    'Eco-Friendly Ganeshotsav / Diwali Faral Bazaar',
    'Society Winter Millet & Organic Farmers Haat',
    'Classical Marathi Abhang & Clay Diya Utsav',
    'Neighborhood Zero-Waste Cultural Mela',
  ],
};

export const NewEventWizardModal: React.FC<NewEventWizardModalProps> = ({
  isOpen,
  language,
  onClose,
  onCreated,
}) => {
  const [type, setType] = useState<EventType>(EventType.WEDDING);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2025-11-28');
  const [location, setLocation] = useState('Pune / Udaipur Heritage Courtyard');
  const [guestCount, setGuestCount] = useState(200);
  const [totalBudget, setTotalBudget] = useState(1800000);
  const [vibeDescription, setVibeDescription] = useState(
    'Warm Indian heritage hospitality, marigold & mogra floral installations, live chaat & regional feast counters, and soulful acoustic music.'
  );
  const [dietaryNotes, setDietaryNotes] = useState(
    'Pure Vegetarian, Separate Jain Counter (No onion/garlic), Vegan & Diabetic-friendly options'
  );
  const [accessibilityNotes, setAccessibilityNotes] = useState(
    'Step-free wheelchair ramps to Mandap/Stage, shaded senior citizen lounge, low-decibel dining zone'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const langMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) ||
    SUPPORTED_LANGUAGES[0];

  const handleSelectType = (newType: EventType) => {
    setType(newType);
    if (newType === EventType.WEDDING) {
      setGuestCount(200);
      setTotalBudget(1800000);
    } else if (newType === EventType.BIRTHDAY) {
      setGuestCount(80);
      setTotalBudget(450000);
    } else {
      setGuestCount(500);
      setTotalBudget(400000);
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
            ? 'Rohan & Ishita — Heritage Courtyard Vivah'
            : type === EventType.BIRTHDAY
            ? 'Golden Jubilee Sufi & Art Deco Soirée'
            : 'Neighborhood Eco-Diwali & Craft Utsav'),
        type,
        date,
        location: location.trim() || 'Pune, Maharashtra',
        guestCount: Number(guestCount) || 150,
        totalBudget: Number(totalBudget) || 1000000,
        vibeDescription,
        dietaryNotes,
        accessibilityNotes,
        language,
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

        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#C86D51] font-semibold mb-2">
          <Sparkles className="w-4 h-4" />
          <span>PromptWars Enterprise Architect ({langMeta.nativeName})</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3B6E52]/10 text-[#3B6E52] text-[10px]">
            <ShieldCheck className="w-3 h-3" />
            <span>&lt;user_event_context&gt; Sanitized</span>
          </span>
        </div>

        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#1C1917] mb-2">
          Commission a New Event Blueprint
        </h2>
        <p className="text-sm text-[#68625D] mb-6">
          Automatically enforces a 100% balanced budget with an 8% emergency contingency buffer, realistic countdown timeline, and cultural/dietary inclusivity.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Archetype */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#68625D] mb-2">
              1. Select Celebration Archetype
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[EventType.WEDDING, EventType.BIRTHDAY, EventType.COMMUNITY].map(
                (item) => {
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
                          ? 'Vivah, Sangeet & Reception'
                          : item === EventType.BIRTHDAY
                          ? 'Milestone Soirée & Feast'
                          : 'Sarvajanik Utsav & Mela'}
                      </div>
                    </button>
                  );
                }
              )}
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
                placeholder="e.g., Siddharth & Kiara — Royal Pune Peshwa Wedding"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E6E0D6] text-sm text-[#1C1917] focus:outline-none focus:border-[#C86D51]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#68625D] mb-1.5">
                City &amp; Venue Setting
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#68625D] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g., Jaipur, Mumbai, Pune, Goa"
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
                Target Date / Muhurat
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
                  min={10}
                  max={10000}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-[#E6E0D6] text-sm font-mono text-[#1C1917] focus:outline-none focus:border-[#C86D51]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#68625D] mb-1.5">
                Total Budget Cap (INR ₹)
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-[#68625D] absolute left-3 top-3" />
                <input
                  type="number"
                  min={10000}
                  step={10000}
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-[#E6E0D6] text-sm font-mono text-[#1C1917] focus:outline-none focus:border-[#C86D51]"
                />
              </div>
            </div>
          </div>

          {/* Dietary & Accessibility Guardrail #4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#68625D] mb-1.5">
                Dietary Nuances (Jain / Sattvic / Vegan)
              </label>
              <input
                type="text"
                value={dietaryNotes}
                onChange={(e) => setDietaryNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E6E0D6] text-xs text-[#1C1917]"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#68625D] mb-1.5">
                Accessibility &amp; Elder Care Needs
              </label>
              <input
                type="text"
                value={accessibilityNotes}
                onChange={(e) => setAccessibilityNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E6E0D6] text-xs text-[#1C1917]"
              />
            </div>
          </div>

          {/* Aesthetic & Cultural Direction */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#68625D]">
                Cultural &amp; Aesthetic Direction
              </label>
              <span className="text-xs text-[#68625D]">Click a tag to append</span>
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
              rows={2}
              value={vibeDescription}
              onChange={(e) => setVibeDescription(e.target.value)}
              className="w-full p-3 rounded-lg bg-white border border-[#E6E0D6] text-sm text-[#1C1917] focus:outline-none focus:border-[#C86D51]"
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
                  <span>Architecting in {langMeta.nativeName}...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Blueprint ({langMeta.nativeName})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
