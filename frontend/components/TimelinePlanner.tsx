import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Sparkles,
  User,
  Trash2,
} from 'lucide-react';
import { EventPlan, TimelineItem, TimelinePhase } from '../types';

interface TimelinePlannerProps {
  event: EventPlan;
  onUpdateEvent: (updated: Partial<EventPlan>) => void;
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

const PHASES: TimelinePhase[] = [
  '6+ Months Out',
  '3 Months Out',
  '1 Month Out',
  'Week Of',
  'Day Of',
];

export const TimelinePlanner: React.FC<TimelinePlannerProps> = ({
  event,
  onUpdateEvent,
  onOpenCopilotWithPrompt,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<TimelinePhase | 'ALL'>('ALL');
  const [newPhase, setNewPhase] = useState<TimelinePhase>('Day Of');
  const [newTimeLabel, setNewTimeLabel] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newOwner, setNewOwner] = useState('Lead Planner');

  const toggleCompleted = (id: string) => {
    const updated = event.timelineItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onUpdateEvent({ timelineItems: updated });
  };

  const deleteItem = (id: string) => {
    onUpdateEvent({
      timelineItems: event.timelineItems.filter((t) => t.id !== id),
    });
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const item: TimelineItem = {
      id: `t-${Date.now()}`,
      phase: newPhase,
      timeLabel: newTimeLabel.trim() || 'TBD',
      title: newTitle.trim(),
      description: newDescription.trim() || 'Production milestone',
      completed: false,
      owner: newOwner.trim() || 'Planner',
    };

    onUpdateEvent({
      timelineItems: [...event.timelineItems, item],
    });
    setNewTimeLabel('');
    setNewTitle('');
    setNewDescription('');
  };

  const visiblePhases =
    selectedPhase === 'ALL' ? PHASES : [selectedPhase];

  return (
    <div className="space-y-8">
      {/* Header & AI Generator */}
      <div className="bg-white border border-[#E6E0D6] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <span className="text-xs uppercase tracking-[0.12em] text-[#C86D51] font-semibold">
              Chronological Production
            </span>
            <h2 className="font-serif text-3xl font-semibold text-[#1C1917]">
              Master Timeline &amp; Day-Of Run of Show
            </h2>
          </div>

          <button
            onClick={() =>
              onOpenCopilotWithPrompt(
                `Add 4 detailed "Day Of" hour-by-hour Run of Show cues for ${event.title} including vendor load-in, golden hour photos, main culinary service, and last song.`
              )
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#C86D51] text-white text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Hour-by-Hour Day-Of Cues</span>
          </button>
        </div>

        {/* Phase Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedPhase('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedPhase === 'ALL'
                ? 'bg-[#1C1917] text-white'
                : 'bg-[#F3EFEA] text-[#68625D] hover:text-[#1C1917]'
            }`}
          >
            All Phases ({event.timelineItems.length})
          </button>
          {PHASES.map((phase) => {
            const count = event.timelineItems.filter((t) => t.phase === phase).length;
            const active = selectedPhase === phase;
            return (
              <button
                key={phase}
                onClick={() => setSelectedPhase(phase)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  active
                    ? 'bg-[#C86D51] text-white'
                    : 'bg-[#F3EFEA] text-[#68625D] hover:text-[#1C1917]'
                }`}
              >
                {phase} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Phase Sections */}
      <div className="space-y-6">
        {visiblePhases.map((phase) => {
          const items = event.timelineItems.filter((t) => t.phase === phase);
          if (items.length === 0 && selectedPhase === 'ALL') return null;

          return (
            <div
              key={phase}
              className="bg-white border border-[#E6E0D6] rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E6E0D6]">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C86D51]" />
                  <h3 className="font-serif text-2xl font-semibold text-[#1C1917]">
                    {phase}
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#68625D]">
                  {items.filter((i) => i.completed).length}/{items.length} Completed
                </span>
              </div>

              {items.length === 0 ? (
                <p className="text-sm text-[#68625D] italic py-4">
                  No milestones scheduled for this phase yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`group flex items-start gap-4 p-4 rounded-xl border transition-all ${
                        item.completed
                          ? 'bg-[#F3EFEA]/40 border-[#E6E0D6] opacity-70'
                          : 'bg-[#FBF9F5] border-[#E6E0D6] hover:border-[#C86D51]'
                      }`}
                    >
                      <button
                        onClick={() => toggleCompleted(item.id)}
                        className="mt-0.5 text-[#4A6B5D] hover:scale-110 transition-transform"
                        aria-label={`Mark ${item.title} as complete`}
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-[#3B6E52]" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#68625D]" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-[#F3EFEA] text-[#1C1917]">
                            <Clock className="w-3 h-3 text-[#C86D51]" />
                            {item.timeLabel}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs bg-white border border-[#E6E0D6] text-[#68625D]">
                            <User className="w-3 h-3" />
                            {item.owner}
                          </span>
                        </div>

                        <h4
                          className={`text-base font-semibold text-[#1C1917] ${
                            item.completed ? 'line-through text-[#68625D]' : ''
                          }`}
                        >
                          {item.title}
                        </h4>
                        <p className="text-sm text-[#68625D] mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-[#68625D] hover:text-[#B84A39] transition-opacity"
                        title="Delete milestone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Custom Milestone Form */}
      <form
        onSubmit={handleAddMilestone}
        className="bg-white border border-[#E6E0D6] rounded-2xl p-6 shadow-sm space-y-4"
      >
        <h3 className="font-serif text-xl font-semibold text-[#1C1917]">
          Add Custom Production Milestone or Cue
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select
            value={newPhase}
            onChange={(e) => setNewPhase(e.target.value as TimelinePhase)}
            className="px-3 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6] text-xs font-medium text-[#1C1917]"
          >
            {PHASES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Time / Date (e.g., 5:45 PM)"
            value={newTimeLabel}
            onChange={(e) => setNewTimeLabel(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6] text-xs font-mono"
          />
          <input
            type="text"
            placeholder="Milestone Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6] text-xs"
          />
          <input
            type="text"
            placeholder="Owner (e.g., Sound Tech)"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6] text-xs"
          />
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Notes or logistics description..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6] text-xs"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#C86D51] hover:bg-[#b55d42] text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Cue</span>
          </button>
        </div>
      </form>
    </div>
  );
};
