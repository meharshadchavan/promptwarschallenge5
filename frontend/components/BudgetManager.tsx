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
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { BudgetLineItem, EventPlan, SupportedLanguage } from '../types';
import { formatINR, UI_TRANSLATIONS } from '../services/i18nService';
import { normalizeBudgetWithContingency } from '../services/guardrailEngine';

interface BudgetManagerProps {
  event: EventPlan;
  language: SupportedLanguage;
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
  language,
  onUpdateEvent,
  onOpenCopilotWithPrompt,
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newEstimated, setNewEstimated] = useState('');
  const [newActual, setNewActual] = useState('');

  const t = UI_TRANSLATIONS[language];

  const totalEstimated = event.budgetItems.reduce((acc, item) => acc + item.estimated, 0);
  const totalActual = event.budgetItems.reduce((acc, item) => acc + item.actual, 0);
  const remaining = event.totalBudget - totalActual;

  const contingencySum = event.budgetItems
    .filter(
      (i) =>
        i.isContingency ||
        /contingency|emergency|आपातकालीन|राखीव/i.test(`${i.category} ${i.itemName}`)
    )
    .reduce((s, i) => s + i.estimated, 0);

  const contingencyPct =
    event.totalBudget > 0
      ? Number(((contingencySum / event.totalBudget) * 100).toFixed(1))
      : 0;

  const isExact100Sum = Math.abs(totalEstimated - event.totalBudget) <= 1;
  const isContingencyValid = contingencyPct >= 5 && contingencyPct <= 10;

  const chartData = event.budgetItems.map((item) => ({
    name: item.category,
    value: item.actual > 0 ? item.actual : item.estimated,
  }));

  const handleEnforceGuardrail3 = () => {
    const { normalizedItems } = normalizeBudgetWithContingency(
      event.budgetItems,
      event.totalBudget,
      0.08
    );
    onUpdateEvent({ budgetItems: normalizedItems });
  };

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
      {/* Top Summary & Guardrail #3 Enforcement Bar */}
      <div className="bg-white border border-[#E6E0D6] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E6E0D6]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.12em] text-[#C86D51] font-semibold">
                {t.financialLedger}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  isExact100Sum && isContingencyValid
                    ? 'bg-[#3B6E52]/10 text-[#3B6E52]'
                    : 'bg-[#D4A359]/20 text-[#966922]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {isExact100Sum && isContingencyValid
                    ? `${t.contingencyEnforcedBadge} (${contingencyPct}%)`
                    : `Contingency: ${contingencyPct}% • Click Re-Lock 100%`}
                </span>
              </span>
            </div>
            <h2 className="font-serif text-3xl font-semibold text-[#1C1917] mt-1">
              Event Budget &amp; Contingency Ledger
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleEnforceGuardrail3}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A6B5D] hover:bg-[#3d594d] text-white text-xs font-semibold transition-colors shadow-sm"
              title="Deterministically scale line items to 100% of cap with an 8% Emergency Contingency Reserve"
            >
              <Scale className="w-4 h-4" />
              <span>Enforce 100% Cap + 8% Contingency</span>
            </button>

            <button
              onClick={() =>
                onOpenCopilotWithPrompt(
                  `Rebalance our budget items so total spend is 100% within ${formatINR(event.totalBudget, language)}, maintaining an 8% emergency contingency buffer while optimizing venue and catering costs.`
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F3EFEA] hover:bg-[#E6E0D6] text-[#1C1917] text-xs font-semibold transition-colors"
            >
              <TrendingDown className="w-4 h-4 text-[#4A6B5D]" />
              <span>AI Rebalance</span>
            </button>

            <button
              onClick={() =>
                onOpenCopilotWithPrompt(
                  `Audit our ${event.type} budget for ${event.guestCount} guests in ${event.location} for any hidden Indian event costs (generator diesel, PPL/IPRS music license, Safawala, or monsoon backup).`
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#C86D51] text-white text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Spot Hidden Costs</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Blocks + Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-center">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6]">
              <div className="text-xs uppercase tracking-wider text-[#68625D] mb-1">
                {t.targetCap} (INR)
              </div>
              <div className="flex items-center gap-1 font-mono text-xl font-semibold text-[#1C1917]">
                <span>₹</span>
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
                {formatINR(event.totalBudget, language)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6]">
              <div className="text-xs uppercase tracking-wider text-[#68625D] mb-1">
                Allocated / Committed
              </div>
              <div className="font-mono text-xl font-semibold text-[#1C1917]">
                {formatINR(totalActual, language)}
              </div>
              <div className="text-[11px] text-[#68625D] mt-1">
                Est: {formatINR(totalEstimated, language)} (
                {Math.round((totalEstimated / Math.max(1, event.totalBudget)) * 100)}%)
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
                <span>
                  {remaining >= 0 ? 'Contingency + Buffer' : t.overBudget}
                </span>
              </div>
              <div
                className={`font-mono text-xl font-semibold ${
                  remaining >= 0 ? 'text-[#3B6E52]' : 'text-[#B84A39]'
                }`}
              >
                {remaining >= 0
                  ? formatINR(contingencySum + remaining, language)
                  : `-${formatINR(Math.abs(remaining), language)}`}
              </div>
              <div className="text-[11px] text-[#68625D] mt-1">
                {formatINR(Math.round(totalActual / Math.max(1, event.guestCount)), language)}
                {t.perGuest}
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
                  formatter={(value: number) => formatINR(Number(value), language)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 text-xs max-w-[180px]">
              {chartData.slice(0, 6).map((entry, idx) => (
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
                <th className="py-3.5 px-4 text-right">Share %</th>
                <th className="py-3.5 px-4 text-right">Estimated (₹)</th>
                <th className="py-3.5 px-4 text-right">Actual / Quoted (₹)</th>
                <th className="py-3.5 px-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E0D6] text-sm">
              {event.budgetItems.map((item) => {
                const pct =
                  event.totalBudget > 0
                    ? ((item.estimated / event.totalBudget) * 100).toFixed(1)
                    : '0.0';
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors group ${
                      item.isContingency
                        ? 'bg-[#4A6B5D]/5 hover:bg-[#4A6B5D]/10'
                        : 'hover:bg-[#FBF9F5]'
                    }`}
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
                    <td className="py-3 px-4 text-right font-mono text-xs text-[#68625D]">
                      {pct}%
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
                        className="bg-[#F3EFEA]/60 rounded px-2 py-1 text-right w-32 font-mono focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
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
                        className="bg-[#F3EFEA]/60 rounded px-2 py-1 text-right w-32 font-mono focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
                      />
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
            placeholder="Category (e.g., Mehendi & Haldi)"
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
            placeholder="Estimated ₹"
            value={newEstimated}
            onChange={(e) => setNewEstimated(e.target.value)}
            className="sm:col-span-2 px-3 py-2 rounded-lg bg-white border border-[#E6E0D6] text-xs font-mono focus:outline-none focus:border-[#C86D51]"
          />
          <input
            type="number"
            placeholder="Actual ₹"
            value={newActual}
            onChange={(e) => setNewActual(e.target.value)}
            className="sm:col-span-2 px-3 py-2 rounded-lg bg-white border border-[#E6E0D6] text-xs font-mono focus:outline-none focus:border-[#C86D51]"
          />
          <button
            type="submit"
            className="sm:col-span-1 inline-flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-[#1C1917] hover:bg-[#C86D51] text-white text-xs font-semibold transition-colors"
            aria-label="Add budget line item"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
