import { GoogleGenAI, Type, Modality } from '@google/genai';
import {
  EventPlan,
  EventType,
  CopilotActionResult,
  VendorChecklistItem,
  CreativeIdea,
} from '../types';

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });
};

export interface BlueprintPromptParams {
  title: string;
  type: EventType;
  date: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  vibeDescription: string;
}

export async function generateFullEventBlueprint(
  params: BlueprintPromptParams
): Promise<EventPlan> {
  const ai = getAIClient();

  const prompt = `Create a deeply thoughtful, luxury editorial event planning blueprint for the following event:
- Title: ${params.title}
- Event Type: ${params.type}
- Date: ${params.date}
- Location: ${params.location}
- Guest Count: ${params.guestCount}
- Total Target Budget: $${params.totalBudget}
- Aesthetic & Vibe Notes: ${params.vibeDescription}

Make sure the sum of budgetItems estimated costs is realistic and close to $${params.totalBudget}. Include 6 budget items across key categories, 6 chronological timeline items across phases ('6+ Months Out', '3 Months Out', '1 Month Out', 'Week Of', 'Day Of'), 5 essential vendor checklist items with practical keyQuestions, 4 color palette swatches with valid 6-digit hex codes, 4 signature menu/cocktail items, and 3 bespoke creative ideas.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      role: 'user',
      parts: [{ text: prompt }],
    },
    config: {
      systemInstruction:
        'You are a world-class executive event producer and creative director at Fête & Folio Atelier. You craft specific, realistic, tastefully curated event plans with accurate budgets, timelines, vendor checklists, and inspiring concepts.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          editorialSummary: { type: Type.STRING },
          vibeKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          colorPalette: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                hex: { type: Type.STRING },
              },
              required: ['name', 'hex'],
            },
          },
          signatureCocktailsOrMenu: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          budgetItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                itemName: { type: Type.STRING },
                estimated: { type: Type.NUMBER },
                actual: { type: Type.NUMBER },
                notes: { type: Type.STRING },
              },
              required: ['category', 'itemName', 'estimated', 'actual'],
            },
          },
          timelineItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase: {
                  type: Type.STRING,
                  description:
                    "Must be one of: '6+ Months Out', '3 Months Out', '1 Month Out', 'Week Of', 'Day Of'",
                },
                timeLabel: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                owner: { type: Type.STRING },
              },
              required: ['phase', 'timeLabel', 'title', 'description', 'owner'],
            },
          },
          vendorChecklist: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                vendorRole: { type: Type.STRING },
                vendorName: { type: Type.STRING },
                status: {
                  type: Type.STRING,
                  description: "One of: 'Researching', 'Contacted', 'Booked', 'Paid'",
                },
                priority: {
                  type: Type.STRING,
                  description: "One of: 'High', 'Medium', 'Low'",
                },
                estimatedCost: { type: Type.NUMBER },
                keyQuestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'category',
                'vendorRole',
                'vendorName',
                'status',
                'priority',
                'estimatedCost',
                'keyQuestions',
              ],
            },
          },
          creativeIdeas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  description:
                    "One of: 'Theme & Decor', 'Culinary & Libations', 'Guest Experience', 'Script & Copy'",
                },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                details: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['category', 'title', 'description', 'details'],
            },
          },
        },
        required: [
          'editorialSummary',
          'vibeKeywords',
          'colorPalette',
          'signatureCocktailsOrMenu',
          'budgetItems',
          'timelineItems',
          'vendorChecklist',
          'creativeIdeas',
        ],
      },
    },
  });

  const parsed = JSON.parse(response.text.trim());
  const nowId = Date.now().toString();

  return {
    id: `evt-${nowId}`,
    title: params.title,
    type: params.type,
    date: params.date,
    location: params.location,
    guestCount: params.guestCount,
    totalBudget: params.totalBudget,
    vibeKeywords: parsed.vibeKeywords || [],
    editorialSummary: parsed.editorialSummary || '',
    colorPalette: parsed.colorPalette || [],
    signatureCocktailsOrMenu: parsed.signatureCocktailsOrMenu || [],
    budgetItems: (parsed.budgetItems || []).map((b: any, idx: number) => ({
      id: `b-${nowId}-${idx}`,
      category: b.category,
      itemName: b.itemName,
      estimated: Number(b.estimated) || 0,
      actual: Number(b.actual) || Number(b.estimated) || 0,
      notes: b.notes || '',
    })),
    timelineItems: (parsed.timelineItems || []).map((t: any, idx: number) => ({
      id: `t-${nowId}-${idx}`,
      phase: ['6+ Months Out', '3 Months Out', '1 Month Out', 'Week Of', 'Day Of'].includes(
        t.phase
      )
        ? t.phase
        : '1 Month Out',
      timeLabel: t.timeLabel || 'TBD',
      title: t.title,
      description: t.description,
      completed: false,
      owner: t.owner || 'Planner',
    })),
    vendorChecklist: (parsed.vendorChecklist || []).map((v: any, idx: number) => ({
      id: `v-${nowId}-${idx}`,
      category: v.category,
      vendorRole: v.vendorRole,
      vendorName: v.vendorName,
      status: ['Researching', 'Contacted', 'Booked', 'Paid'].includes(v.status)
        ? v.status
        : 'Researching',
      priority: ['High', 'Medium', 'Low'].includes(v.priority) ? v.priority : 'Medium',
      estimatedCost: Number(v.estimatedCost) || 0,
      keyQuestions: v.keyQuestions || [],
      completed: false,
    })),
    creativeIdeas: (parsed.creativeIdeas || []).map((c: any, idx: number) => ({
      id: `c-${nowId}-${idx}`,
      category: [
        'Theme & Decor',
        'Culinary & Libations',
        'Guest Experience',
        'Script & Copy',
      ].includes(c.category)
        ? c.category
        : 'Theme & Decor',
      title: c.title,
      description: c.description,
      details: c.details || [],
    })),
  };
}

export async function runEventCopilotAction(
  event: EventPlan,
  userInstruction: string
): Promise<CopilotActionResult> {
  const ai = getAIClient();

  const prompt = `Current Event State:
Title: ${event.title} (${event.type})
Guest Count: ${event.guestCount}
Total Target Budget: $${event.totalBudget}
Current Budget Line Items: ${JSON.stringify(event.budgetItems)}
Current Timeline Items Count: ${event.timelineItems.length}
Current Vendors Count: ${event.vendorChecklist.length}

User Request to AI Event Producer: "${userInstruction}"

If the user asks to optimize/rebalance the budget, add tasks/timeline items, add vendors, or generate new ideas, return both a warm, concise editorial explanation in 'replyText' AND the modified arrays in 'updatedBudgetItems', 'newTimelineItems', 'newVendorItems', or 'newCreativeIdeas' so the app can immediately update the live workspace.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      role: 'user',
      parts: [{ text: prompt }],
    },
    config: {
      systemInstruction:
        'You are the Lead Event Architect for Fête & Folio. You give concrete, actionable advice and directly output structured updates when requested.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          replyText: { type: Type.STRING },
          appliedBadge: {
            type: Type.STRING,
            description: 'Short label summarizing any live change made, e.g., "Rebalanced 6 budget items" or "Added 3 timeline milestones"',
          },
          replaceBudgetItems: {
            type: Type.BOOLEAN,
            description: 'True if updatedBudgetItems should replace the current budget items',
          },
          updatedBudgetItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                category: { type: Type.STRING },
                itemName: { type: Type.STRING },
                estimated: { type: Type.NUMBER },
                actual: { type: Type.NUMBER },
                notes: { type: Type.STRING },
              },
              required: ['category', 'itemName', 'estimated', 'actual'],
            },
          },
          newTimelineItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase: { type: Type.STRING },
                timeLabel: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                owner: { type: Type.STRING },
              },
              required: ['phase', 'timeLabel', 'title', 'description', 'owner'],
            },
          },
          newVendorItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                vendorRole: { type: Type.STRING },
                vendorName: { type: Type.STRING },
                priority: { type: Type.STRING },
                estimatedCost: { type: Type.NUMBER },
                keyQuestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['category', 'vendorRole', 'vendorName', 'priority', 'estimatedCost', 'keyQuestions'],
            },
          },
          newCreativeIdeas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                details: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['category', 'title', 'description', 'details'],
            },
          },
        },
        required: ['replyText'],
      },
    },
  });

  const data = JSON.parse(response.text.trim());
  const updatedPlan: Partial<EventPlan> = {};
  const stamp = Date.now();

  if (data.replaceBudgetItems && Array.isArray(data.updatedBudgetItems) && data.updatedBudgetItems.length > 0) {
    updatedPlan.budgetItems = data.updatedBudgetItems.map((item: any, idx: number) => ({
      id: item.id || `b-ai-${stamp}-${idx}`,
      category: item.category,
      itemName: item.itemName,
      estimated: Number(item.estimated) || 0,
      actual: Number(item.actual) || 0,
      notes: item.notes || 'Adjusted by AI Copilot',
    }));
  }

  if (Array.isArray(data.newTimelineItems) && data.newTimelineItems.length > 0) {
    const mapped = data.newTimelineItems.map((t: any, idx: number) => ({
      id: `t-ai-${stamp}-${idx}`,
      phase: (['6+ Months Out', '3 Months Out', '1 Month Out', 'Week Of', 'Day Of'].includes(t.phase)
        ? t.phase
        : '1 Month Out') as any,
      timeLabel: t.timeLabel || 'TBD',
      title: t.title,
      description: t.description,
      completed: false,
      owner: t.owner || 'Planner',
    }));
    updatedPlan.timelineItems = [...event.timelineItems, ...mapped];
  }

  if (Array.isArray(data.newVendorItems) && data.newVendorItems.length > 0) {
    const mappedVendors = data.newVendorItems.map((v: any, idx: number) => ({
      id: `v-ai-${stamp}-${idx}`,
      category: v.category,
      vendorRole: v.vendorRole,
      vendorName: v.vendorName,
      status: 'Researching' as const,
      priority: (['High', 'Medium', 'Low'].includes(v.priority) ? v.priority : 'Medium') as any,
      estimatedCost: Number(v.estimatedCost) || 0,
      keyQuestions: v.keyQuestions || [],
      completed: false,
    }));
    updatedPlan.vendorChecklist = [...event.vendorChecklist, ...mappedVendors];
  }

  if (Array.isArray(data.newCreativeIdeas) && data.newCreativeIdeas.length > 0) {
    const mappedIdeas: CreativeIdea[] = data.newCreativeIdeas.map((c: any, idx: number) => ({
      id: `ci-ai-${stamp}-${idx}`,
      category: (['Theme & Decor', 'Culinary & Libations', 'Guest Experience', 'Script & Copy'].includes(
        c.category
      )
        ? c.category
        : 'Theme & Decor') as any,
      title: c.title,
      description: c.description,
      details: c.details || [],
    }));
    updatedPlan.creativeIdeas = [...mappedIdeas, ...event.creativeIdeas];
  }

  return {
    replyText: data.replyText,
    updatedPlan: Object.keys(updatedPlan).length > 0 ? updatedPlan : undefined,
    appliedBadge: data.appliedBadge,
  };
}

export async function draftVendorOutreachMessage(
  event: EventPlan,
  vendor: VendorChecklistItem
): Promise<{ subject: string; body: string }> {
  const ai = getAIClient();

  const prompt = `Draft a warm, professional, editorial inquiry email to a vendor for our upcoming event:
Event: ${event.title} (${event.type})
Date: ${event.date}
Location: ${event.location}
Guest Count: ${event.guestCount}
Vendor Role: ${vendor.vendorRole} (${vendor.vendorName})
Target Budget for this category: $${vendor.estimatedCost}
Specific Questions to Include: ${vendor.keyQuestions.join('; ')}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      role: 'user',
      parts: [{ text: prompt }],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          body: { type: Type.STRING },
        },
        required: ['subject', 'body'],
      },
    },
  });

  return JSON.parse(response.text.trim());
}

export async function generateBespokeCreativeConcept(
  event: EventPlan,
  category: CreativeIdea['category'],
  customDirection: string
): Promise<CreativeIdea> {
  const ai = getAIClient();

  const prompt = `Generate a standout, deeply memorable creative concept or script for:
Event: ${event.title} (${event.type})
Location: ${event.location}
Guest Count: ${event.guestCount}
Vibe Keywords: ${event.vibeKeywords.join(', ')}
Category Requested: ${category}
Specific User Direction: "${customDirection || 'Surprise us with something iconic, tactile, and unforgettable'}"

If category is 'Script & Copy', provide a full toast, invitation wording, or ceremony script in 'description' and delivery tips in 'details'.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      role: 'user',
      parts: [{ text: prompt }],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          details: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          colorSwatches: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['title', 'description', 'details'],
      },
    },
  });

  const parsed = JSON.parse(response.text.trim());
  return {
    id: `ci-${Date.now()}`,
    category,
    title: parsed.title,
    description: parsed.description,
    details: parsed.details || [],
    colorSwatches: parsed.colorSwatches || event.colorPalette.map((c) => c.hex).slice(0, 3),
  };
}

export async function generateMoodboardVisual(
  event: EventPlan,
  visualPrompt: string
): Promise<string> {
  const ai = getAIClient();

  const fullPrompt = `Editorial Kinfolk and Vogue Living style event photography for "${event.title}" (${event.type}) at ${event.location}. ${visualPrompt}. Natural warm sunlight or candlelit ambiance, tactile linen, organic botanical textures, high-end architectural setting, 35mm film grain aesthetic.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image',
    contents: fullPrompt,
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error('No image returned from Gemini Image model');
}
