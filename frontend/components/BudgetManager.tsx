import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Plus,
  Trash2,
  Sparkles,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { BudgetLineItem, EventPlan } from '../types';

interface BudgetManagerProps {
  event: EventPlan;
  onUpdateEvent: (updated: Partial<EventPlan>) => void;
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

const CHART_COLORS = [
  '#C86D51',
  '#4A6B5D',
  '#D4A359',
  '#2D2520',
  '#8C7A6B',
  '#7A9A8B',
  '#E09F7D',
];

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  event,
  onUpdateEvent,
  onOpenCopilotWithPrompt,
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newEstimated, setNewEstimated] = useState('');
  const [newActual, setNewActual] = useState('');

  const totalEstimated = event.budgetItems.reduce((acc, item) => acc + item.estimated, 0);
  const totalActual = event.budgetItems.reduce((acc, item) => acc + item.actual, 0);
  const remaining = event.totalBudget - totalActual;

  const chartData = event.budgetItems.map((item) => ({
    name: item.category,
    value: item.actual > 0 ? item.actual : item.estimated,
  }));

  const handleFieldChange = (
    id: string,
    field: keyof BudgetLineItem,
    value: string | number
  ) => {
    const updated = event.budgetItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onUpdateEvent({ budgetItems: updated });
  };

  const handleDeleteItem = (id: string) => {
    onUpdateEvent({
      budgetItems: event.budgetItems.filter((item) => item.id !== id),
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim() || !newItemName.trim()) return;

    const created: BudgetLineItem = {
      id: `b-${Date.now()}`,
      category: newCategory.trim(),
      itemName: newItemName.trim(),
      estimated: Number(newEstimated) || 0,
      actual: Number(newActual) || Number(newEstimated) || 0,
    };

    onUpdateEvent({
      budgetItems: [...event.budgetItems, created],
    });
    setNewCategory('');
    setNewItemName('');
    setNewEstimated('');
    setNewActual('');
  };

  return (
    <div className="space-y-8">
      {/* Top Summary & AI Rebalance Bar */}
      <div className="bg-white border border-[#E6E0D6] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E6E0D6]">
          <div>
            <span className="text-xs uppercase tracking-[0.12em] text-[#C86D51] font-semibold">
              Financial Architecture
            </span>
            <h2 className="font-serif text-3xl font-semibold text-[#1C1917]">
              Event Budget &amp; Allocation Ledger
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() =>
                onOpenCopilotWithPrompt(
                  `Please rebalance our budget items so the total actual spend is 10% under our $${event.totalBudget.toLocaleString()} target cap while protecting guest food & beverage quality.`
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F3EFEA] hover:bg-[#E6E0D6] text-[#1C1917] text-xs font-semibold transition-colors"
            >
              <TrendingDown className="w-4 h-4 text-[#4A6B5D]" />
              <span>AI Trim Spend by 10%</span>
            </button>
            <button
              onClick={() =>
                onOpenCopilotWithPrompt(
                  `Analyze our ${event.type} budget for ${event.guestCount} guests and identify any hidden costs or missing line items (like gratuities, rain plan, or lighting).`
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#C86D51] text-white text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Spot Hidden Costs with AI</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Blocks + Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-center">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6]">
              <div className="text-xs uppercase tracking-wider text-[#68625D] mb-1">
                Target Budget Cap
              </div>
              <div className="flex items-center gap-1 font-mono text-2xl font-semibold text-[#1C1917]">
                <span>$</span>
                <input
                  type="number"
                  value={event.totalBudget}
                  onChange={(e) =>
                    onUpdateEvent({ totalBudget: Number(e.target.value) || 0 })
                  }
                  className="w-full bg-transparent border-b border-dashed border-[#C86D51] focus:outline-none"
                  aria-label="Target Budget Cap"
                />
              </div>
              <div className="text-[11px] text-[#68625D] mt-1">
                Click amount to adjust cap
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6]">
              <div className="text-xs uppercase tracking-wider text-[#68625D] mb-1">
                Actual / Committed
              </div>
              <div className="font-mono text-2xl font-semibold text-[#1C1917]">
                ${totalActual.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#68625D] mt-1">
                Estimated: ${totalEstimated.toLocaleString()}
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                remaining >= 0
                  ? 'bg-[#4A6B5D]/10 border-[#4A6B5D]/30'
                  : 'bg-[#B84A39]/10 border-[#B84A39]/30'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#68625D] mb-1">
                {remaining >= 0 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3B6E52]" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#B84A39]" />
                )}
                <span>{remaining >= 0 ? 'Remaining Buffer' : 'Over Budget'}</span>
              </div>
              <div
                className={`font-mono text-2xl font-semibold ${
                  remaining >= 0 ? 'text-[#3B6E52]' : 'text-[#B84A39]'
                }`}
              >
                {remaining >= 0
                  ? `$${remaining.toLocaleString()}`
                  : `-$${Math.abs(remaining).toLocaleString()}`}
              </div>
              <div className="text-[11px] text-[#68625D] mt-1">
                ${Math.round(totalActual / Math.max(1, event.guestCount))} per guest
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 h-52 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `$${Number(value).toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 text-xs max-w-[180px]">
              {chartData.slice(0, 5).map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                    }}
                  />
                  <span className="text-[#1C1917] truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Editable Ledger Table */}
      <div className="bg-white border border-[#E6E0D6] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E6E0D6] bg-[#F3EFEA]/60 text-[11px] uppercase tracking-wider text-[#68625D]">
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Line Item Description</th>
                <th className="py-3.5 px-4 text-right">Estimated ($)</th>
                <th className="py-3.5 px-4 text-right">Actual / Quoted ($)</th>
                <th className="py-3.5 px-4 text-right">Variance</th>
                <th className="py-3.5 px-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E0D6] text-sm">
              {event.budgetItems.map((item) => {
                const diff = item.estimated - item.actual;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FBF9F5] transition-colors group"
                  >
                    <td className="py-3 px-4 font-medium text-[#1C1917]">
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) =>
                          handleFieldChange(item.id, 'category', e.target.value)
                        }
                        className="bg-transparent border-b border-transparent focus:border-[#C86D51] focus:outline-none w-full"
                      />
                    </td>
                    <td className="py-3 px-4 text-[#68625D]">
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) =>
                          handleFieldChange(item.id, 'itemName', e.target.value)
                        }
                        className="bg-transparent border-b border-transparent focus:border-[#C86D51] focus:outline-none w-full text-[#1C1917]"
                      />
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <input
                        type="number"
                        value={item.estimated}
                        onChange={(e) =>
                          handleFieldChange(
                            item.id,
                            'estimated',
                            Number(e.target.value) || 0
                          )
                        }
                        className="bg-[#F3EFEA]/60 rounded px-2 py-1 text-right w-28 font-mono focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
                      />
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <input
                        type="number"
                        value={item.actual}
                        onChange={(e) =>
                          handleFieldChange(
                            item.id,
                            'actual',
                            Number(e.target.value) || 0
                          )
                        }
                        className="bg-[#F3EFEA]/60 rounded px-2 py-1 text-right w-28 font-mono focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
                      />
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          diff >= 0
                            ? 'bg-[#3B6E52]/10 text-[#3B6E52]'
                            : 'bg-[#B84A39]/10 text-[#B84A39]'
                        }`}
                      >
                        {diff >= 0
                          ? `+$${diff.toLocaleString()}`
                          : `-$${Math.abs(diff).toLocaleString()}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-[#68625D] hover:text-[#B84A39] opacity-60 group-hover:opacity-100 transition-opacity"
                        title="Remove line item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add Line Item Row */}
        <form
          onSubmit={handleAddItem}
          className="p-4 bg-[#F3EFEA]/50 border-t border-[#E6E0D6] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
        >
          <input
            type="text"
            placeholder="Category (e.g., Lighting)"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="sm:col-span-3 px-3 py-2 rounded-lg bg-white border border-[#E6E0D6] text-xs focus:outline-none focus:border-[#C86D51]"
          />
          <input
            type="text"
            placeholder="Line item description..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="sm:col-span-4 px-3 py-2 rounded-lg bg-white border border-[#E6E0D6] text-xs focus:outline-none focus:border-[#C86D51]"
          />
          <input
            type="number"
            placeholder="Estimated $"
            value={newEstimated}
            onChange={(e) => setNewEstimated(e.target.value)}
            className="sm:col-span-2 px-3 py-2 rounded-lg bg-white border border-[#E6E0D6] text-xs font-mono focus:outline-none focus:border-[#C86D51]"
          />
          <input
            type="number"
            placeholder="Actual $"
            value={newActual}
            onChange={(e) => setNewActual(e.target.value)}
            className="sm:col-span-2 px-3 py-2 rounded-lg bg-white border border-[#E6E0D6] text-xs font-mono focus:outline-none focus:border-[#C86D51]"
          />
          <button
            type="submit"
            className="sm:col-span-1 inline-flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-[#1C1917] hover:bg-[#C86D51] text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
