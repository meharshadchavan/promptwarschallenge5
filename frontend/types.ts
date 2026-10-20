export enum EventType {
  WEDDING = 'Wedding',
  BIRTHDAY = 'Birthday',
  COMMUNITY = 'Community Event',
}

export enum WorkspaceTab {
  OVERVIEW = 'Overview & Blueprint',
  BUDGET = 'Budget Ledger',
  TIMELINE = 'Run of Show & Timeline',
  VENDORS = 'Vendor & Task Checklist',
  STUDIO = 'Creative AI Studio',
}

export type TimelinePhase =
  | '6+ Months Out'
  | '3 Months Out'
  | '1 Month Out'
  | 'Week Of'
  | 'Day Of';

export type VendorStatus = 'Researching' | 'Contacted' | 'Booked' | 'Paid';

export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface BudgetLineItem {
  id: string;
  category: string;
  itemName: string;
  estimated: number;
  actual: number;
  notes?: string;
}

export interface TimelineItem {
  id: string;
  phase: TimelinePhase;
  timeLabel: string;
  title: string;
  description: string;
  completed: boolean;
  owner: string;
}

export interface VendorChecklistItem {
  id: string;
  category: string;
  vendorRole: string;
  vendorName: string;
  status: VendorStatus;
  priority: PriorityLevel;
  estimatedCost: number;
  contactEmail?: string;
  keyQuestions: string[];
  completed: boolean;
}

export interface CreativeIdea {
  id: string;
  category: 'Theme & Decor' | 'Culinary & Libations' | 'Guest Experience' | 'Script & Copy';
  title: string;
  description: string;
  details: string[];
  colorSwatches?: string[];
  imageUrl?: string;
}

export interface EventPlan {
  id: string;
  title: string;
  type: EventType;
  date: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  vibeKeywords: string[];
  editorialSummary: string;
  colorPalette: { name: string; hex: string }[];
  signatureCocktailsOrMenu: string[];
  budgetItems: BudgetLineItem[];
  timelineItems: TimelineItem[];
  vendorChecklist: VendorChecklistItem[];
  creativeIdeas: CreativeIdea[];
}

export interface CopilotActionResult {
  replyText: string;
  updatedPlan?: Partial<EventPlan>;
  appliedBadge?: string;
}