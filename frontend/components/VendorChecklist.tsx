import React, { useState } from 'react';
import {
  Mail,
  Plus,
  CheckCircle2,
  Circle,
  Loader2,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  X,
} from 'lucide-react';
import {
  EventPlan,
  VendorChecklistItem,
  VendorStatus,
  PriorityLevel,
} from '../types';
import { draftVendorOutreachMessage } from '../services/geminiService';

interface VendorChecklistProps {
  event: EventPlan;
  onUpdateEvent: (updated: Partial<EventPlan>) => void;
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

const STATUS_OPTIONS: VendorStatus[] = [
  'Researching',
  'Contacted',
  'Booked',
  'Paid',
];

export const VendorChecklist: React.FC<VendorChecklistProps> = ({
  event,
  onUpdateEvent,
  onOpenCopilotWithPrompt,
}) => {
  const [draftingVendorId, setDraftingVendorId] = useState<string | null>(null);
  const [draftModalData, setDraftModalData] = useState<{
    vendor: VendorChecklistItem;
    subject: string;
    body: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // New vendor state
  const [category, setCategory] = useState('');
  const [vendorRole, setVendorRole] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('High');

  const handleStatusChange = (id: string, status: VendorStatus) => {
    const updated = event.vendorChecklist.map((v) =>
      v.id === id
        ? { ...v, status, completed: status === 'Booked' || status === 'Paid' }
        : v
    );
    onUpdateEvent({ vendorChecklist: updated });
  };

  const handleToggleCompleted = (id: string) => {
    const updated = event.vendorChecklist.map((v) =>
      v.id === id ? { ...v, completed: !v.completed } : v
    );
    onUpdateEvent({ vendorChecklist: updated });
  };

  const handleDraftEmail = async (vendor: VendorChecklistItem) => {
    setDraftingVendorId(vendor.id);
    try {
      const result = await draftVendorOutreachMessage(event, vendor);
      setDraftModalData({
        vendor,
        subject: result.subject,
        body: result.body,
      });
    } catch {
      setDraftModalData({
        vendor,
        subject: `Inquiry for ${event.title} on ${event.date}`,
        body: `Hello ${vendor.vendorName},\n\nWe are organizing ${event.title} on ${event.date} at ${event.location} for ${event.guestCount} guests and would love to inquire about your availability.\n\nWarm regards,`,
      });
    } finally {
      setDraftingVendorId(null);
    }
  };

  const handleCopyDraft = () => {
    if (!draftModalData) return;
    navigator.clipboard.writeText(
      `Subject: ${draftModalData.subject}\n\n${draftModalData.body}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorRole.trim()) return;

    const newVendor: VendorChecklistItem = {
      id: `v-${Date.now()}`,
      category: category.trim() || 'Specialty',
      vendorRole: vendorRole.trim(),
      vendorName: vendorName.trim() || 'TBD Studio',
      status: 'Researching',
      priority,
      estimatedCost: Number(estimatedCost) || 1500,
      keyQuestions: [
        'Are you available on our event date and what is the retainer deposit?',
        'What is included in your standard package and overtime rate?',
      ],
      completed: false,
    };

    onUpdateEvent({
      vendorChecklist: [...event.vendorChecklist, newVendor],
    });
    setCategory('');
    setVendorRole('');
    setVendorName('');
    setEstimatedCost('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-[#E6E0D6] rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.12em] text-[#C86D51] font-semibold">
            Production Partners
          </span>
          <h2 className="font-serif text-3xl font-semibold text-[#1C1917]">
            Vendor Roster &amp; Contract Checklist
          </h2>
        </div>

        <button
          onClick={() =>
            onOpenCopilotWithPrompt(
              `Suggest 3 additional specialty vendors or local artisans we should book for ${event.title} (${event.type}) with key vetting questions.`
            )
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#C86D51] text-white text-xs font-semibold transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Recommend Specialty Vendors with AI</span>
        </button>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {event.vendorChecklist.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-white border border-[#E6E0D6] rounded-2xl p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              {/* Top Row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleCompleted(vendor.id)}
                    className="mt-1 text-[#4A6B5D]"
                  >
                    {vendor.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-[#3B6E52]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#68625D]" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-[#C86D51]">
                        {vendor.category}
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          vendor.priority === 'High'
                            ? 'bg-[#C86D51]/15 text-[#C86D51]'
                            : 'bg-[#F3EFEA] text-[#68625D]'
                        }`}
                      >
                        {vendor.priority} Priority
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl font-semibold text-[#1C1917]">
                      {vendor.vendorRole}
                    </h3>
                    <p className="text-xs text-[#68625D] font-medium">
                      Shortlisted: <span className="text-[#1C1917]">{vendor.vendorName}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-sm font-semibold text-[#1C1917]">
                    ${vendor.estimatedCost.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#68625D]">Est. Allocation</div>
                </div>
              </div>

              {/* Interview Questions */}
              {vendor.keyQuestions.length > 0 && (
                <div className="mt-4 p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917] mb-2">
                    <HelpCircle className="w-3.5 h-3.5 text-[#4A6B5D]" />
                    <span>Vetting &amp; Contract Questions</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#68625D] list-disc list-inside">
                    {vendor.keyQuestions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bottom Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-5 border-t border-[#E6E0D6]">
              <div className="flex items-center gap-1.5">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(vendor.id, status)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      vendor.status === status
                        ? 'bg-[#4A6B5D] text-white'
                        : 'bg-[#F3EFEA] text-[#68625D] hover:text-[#1C1917]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleDraftEmail(vendor)}
                disabled={draftingVendorId === vendor.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3EFEA] hover:bg-[#C86D51] hover:text-white text-[#1C1917] text-xs font-semibold transition-colors"
              >
                {draftingVendorId === vendor.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Drafting...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>AI Outreach Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Vendor Form */}
      <form
        onSubmit={handleAddVendor}
        className="bg-white border border-[#E6E0D6] rounded-2xl p-6 shadow-sm space-y-4"
      >
        <h3 className="font-serif text-xl font-semibold text-[#1C1917]">
          Add Vendor Category to Checklist
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Category (e.g., Florals)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6] text-xs"
          />
          <input
            type="text"
            placeholder="Vendor Role (e.g., Tent & Lighting)"
            value={vendorRole}
            onChange={(e) => setVendorRole(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6] text-xs"
          />
          <input
            type="text"
            placeholder="Preferred Vendor Name"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6] text-xs"
          />
          <input
            type="number"
            placeholder="Budget Estimate ($)"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E6E0D6] text-xs font-mono"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C86D51] hover:bg-[#b55d42] text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vendor</span>
          </button>
        </div>
      </form>

      {/* AI Outreach Email Modal */}
      {draftModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/60 backdrop-blur-sm p-4">
          <div className="bg-[#FBF9F5] border border-[#E6E0D6] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setDraftModalData(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-[#68625D] hover:text-[#1C1917]"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-xs uppercase tracking-wider text-[#C86D51] font-semibold mb-1">
              AI Vendor Inquiry Draft
            </div>
            <h3 className="font-serif text-2xl font-semibold text-[#1C1917] mb-4">
              Outreach to {draftModalData.vendor.vendorName}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#68625D] mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={draftModalData.subject}
                  onChange={(e) =>
                    setDraftModalData({ ...draftModalData, subject: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E0D6] text-xs font-medium text-[#1C1917]"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#68625D] mb-1">
                  Message Body
                </label>
                <textarea
                  rows={9}
                  value={draftModalData.body}
                  onChange={(e) =>
                    setDraftModalData({ ...draftModalData, body: e.target.value })
                  }
                  className="w-full p-3 rounded-lg bg-white border border-[#E6E0D6] text-xs leading-relaxed text-[#1C1917]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={handleCopyDraft}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C1917] text-white text-xs font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#4A6B5D]" />
                    <span>Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Inquiry Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
