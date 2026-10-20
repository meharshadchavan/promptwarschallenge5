import React, { useState } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Loader2,
  Feather,
  Utensils,
  Compass,
  Wand2,
} from 'lucide-react';
import { CreativeIdea, EventPlan } from '../types';
import {
  generateBespokeCreativeConcept,
  generateMoodboardVisual,
} from '../services/geminiService';

interface CreativeStudioProps {
  event: EventPlan;
  onUpdateEvent: (updated: Partial<EventPlan>) => void;
}

export const CreativeStudio: React.FC<CreativeStudioProps> = ({
  event,
  onUpdateEvent,
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState<CreativeIdea['category']>('Theme & Decor');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);

  const [visualPrompt, setVisualPrompt] = useState(
    `Tablescape and atmosphere for ${event.title} featuring ${event.vibeKeywords
      .slice(0, 2)
      .join(' and ')}`
  );
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<
    { url: string; caption: string }[]
  >([]);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleGenerateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingIdea(true);
    try {
      const idea = await generateBespokeCreativeConcept(
        event,
        selectedCategory,
        customPrompt
      );
      onUpdateEvent({
        creativeIdeas: [idea, ...event.creativeIdeas],
      });
      setCustomPrompt('');
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  const handleGenerateVisual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visualPrompt.trim()) return;
    setImageError(null);
    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateMoodboardVisual(event, visualPrompt);
      setGeneratedImages((prev) => [
        { url: imageUrl, caption: visualPrompt },
        ...prev,
      ]);
    } catch (err: any) {
      setImageError(
        err?.message || 'Could not generate concept art right now. Please try again.'
      );
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Studio Dual Generators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Concept, Menu & Speech Generator */}
        <div className="bg-white border border-[#E6E0D6] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#C86D51] font-semibold mb-1">
              <Wand2 className="w-3.5 h-3.5" />
              <span>Editorial Concept &amp; Copy Studio</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#1C1917] mb-2">
              Brainstorm Bespoke Ideas &amp; Speeches
            </h2>
            <p className="text-xs text-[#68625D] mb-4">
              Generate tactile decor installations, interactive guest moments, signature menus, or heartfelt toast scripts.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {(
                [
                  'Theme & Decor',
                  'Culinary & Libations',
                  'Guest Experience',
                  'Script & Copy',
                ] as CreativeIdea['category'][]
              ).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#1C1917] text-white border-[#1C1917]'
                      : 'bg-[#FBF9F5] text-[#1C1917] border-[#E6E0D6] hover:border-[#C86D51]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleGenerateIdea} className="space-y-3">
            <input
              type="text"
              placeholder={
                selectedCategory === 'Script & Copy'
                  ? 'e.g., Warm 2-minute welcome toast from the hosts thanking out-of-town friends...'
                  : 'e.g., Interactive escort card display using local botanicals or vinyl records...'
              }
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6] text-xs text-[#1C1917] focus:outline-none focus:border-[#C86D51]"
            />
            <button
              type="submit"
              disabled={isGeneratingIdea}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#C86D51] hover:bg-[#b55d42] text-white text-xs font-semibold transition-colors disabled:opacity-60"
            >
              {isGeneratingIdea ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Curating Concept with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate {selectedCategory} Concept</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Visual Moodboard Renderer (gemini-3.1-flash-image) */}
        <div className="bg-white border border-[#E6E0D6] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#4A6B5D] font-semibold mb-1">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>AI Visual Moodboard Studio</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#1C1917] mb-2">
              Render Event Concept Art
            </h2>
            <p className="text-xs text-[#68625D] mb-4">
              Visualize tablescapes, floral arches, lighting installations, or cocktail presentations using Gemini Flash Image.
            </p>
          </div>

          <form onSubmit={handleGenerateVisual} className="space-y-3">
            <textarea
              rows={3}
              value={visualPrompt}
              onChange={(e) => setVisualPrompt(e.target.value)}
              placeholder="Describe the tablescape, lighting, florals, or architectural vignette..."
              className="w-full p-3 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6] text-xs text-[#1C1917] focus:outline-none focus:border-[#4A6B5D]"
            />
            {imageError && (
              <p className="text-xs text-[#B84A39]">{imageError}</p>
            )}
            <button
              type="submit"
              disabled={isGeneratingImage}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#4A6B5D] hover:bg-[#3d594d] text-white text-xs font-semibold transition-colors disabled:opacity-60"
            >
              {isGeneratingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Rendering Editorial Photograph...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  <span>Generate Moodboard Vignette</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Rendered AI Moodboard Gallery */}
      {generatedImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-serif text-2xl font-semibold text-[#1C1917]">
            Rendered Visual Vignettes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedImages.map((img, i) => (
              <div
                key={i}
                className="bg-white border border-[#E6E0D6] rounded-2xl overflow-hidden shadow-sm"
              >
                <img
                  src={img.url}
                  alt={img.caption}
                  className="w-full h-72 object-cover"
                />
                <div className="p-4">
                  <span className="text-[11px] uppercase tracking-wider text-[#4A6B5D] font-semibold">
                    AI Concept Render
                  </span>
                  <p className="text-xs text-[#1C1917] mt-1">{img.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Curated Creative Ideas Folio */}
      <div className="space-y-4">
        <h3 className="font-serif text-2xl font-semibold text-[#1C1917]">
          Bespoke Ideas, Details &amp; Scripts ({event.creativeIdeas.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {event.creativeIdeas.map((idea) => (
            <div
              key={idea.id}
              className="bg-white border border-[#E6E0D6] rounded-2xl p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#C86D51]">
                    {idea.category === 'Script & Copy' ? (
                      <Feather className="w-3.5 h-3.5" />
                    ) : idea.category === 'Culinary & Libations' ? (
                      <Utensils className="w-3.5 h-3.5" />
                    ) : (
                      <Compass className="w-3.5 h-3.5" />
                    )}
                    {idea.category}
                  </span>

                  {idea.colorSwatches && idea.colorSwatches.length > 0 && (
                    <div className="flex items-center gap-1">
                      {idea.colorSwatches.map((hex, idx) => (
                        <span
                          key={idx}
                          className="w-3.5 h-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <h4 className="font-serif text-2xl font-semibold text-[#1C1917] mb-2">
                  {idea.title}
                </h4>
                <p className="text-sm text-[#45403C] whitespace-pre-line leading-relaxed mb-4">
                  {idea.description}
                </p>
              </div>

              {idea.details && idea.details.length > 0 && (
                <div className="pt-4 border-t border-[#E6E0D6]">
                  <div className="text-[11px] uppercase tracking-wider text-[#68625D] font-semibold mb-2">
                    Execution Notes
                  </div>
                  <ul className="space-y-1 text-xs text-[#68625D]">
                    {idea.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#C86D51]">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
