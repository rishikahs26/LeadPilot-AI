// ============================================================
// Core application types for LeadPilot
// All interfaces here are the single source of truth for both
// the API layer and the frontend components.
// ============================================================

export type Priority = "hot" | "warm" | "cold";

export type VerificationStatus =
  | "Verified against available data"
  | "Unverified"
  | "Conflict — Human Review Required"
  | "Unsupported by Available Data";

export type QuestionStatus =
  | "Answered"
  | "Partially answered"
  | "Unanswered"
  | "Needs verification";

// ----------------------------------------------------------
// AI Analysis — returned for every lead
// ----------------------------------------------------------
export interface LeadAnalysis {
  summary: string;
  customerIntent: string;
  keyRequirements: string[];
  objectionsConcerns: string[];
  recommendedNextAction: string;
  suggestedResponse: string;
  priorityScore: number; // 1–100
  priority: Priority;
  priorityReason: string;
}

// ----------------------------------------------------------
// Lead — the main entity saved in the database
// ----------------------------------------------------------
export interface Lead {
  id: string;
  name: string;
  location: string;
  propertyRequirement: string;
  budget: string;
  buyingTimeline: string;
  customerMessage: string;
  createdAt: string; // ISO string
  updatedAt: string;
  analysis: LeadAnalysis | null;
  analysisError?: string; // if last analysis attempt failed
}

// ----------------------------------------------------------
// Chat — per-lead conversational history
// ----------------------------------------------------------
export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  leadId: string;
  role: ChatRole;
  content: string;
  timestamp: string;
}

// ----------------------------------------------------------
// CallSense — transcript analysis
// ----------------------------------------------------------
export interface CustomerQuestion {
  question: string;
  status: QuestionStatus;
  statusReason: string;
}

export interface SalespersonCommitment {
  statement: string;
  requiresVerification: boolean;
}

export interface FactCheckResult {
  claim: string;
  source: "transcript" | "ai-extracted";
  status: VerificationStatus;
  evidence: string;
  recommendation: string;
}

export interface ProposedLeadUpdate {
  field: keyof Pick<Lead, "budget" | "location" | "propertyRequirement" | "buyingTimeline">;
  existingValue: string;
  proposedValue: string;
  reason: string;
  approved?: boolean; // undefined = pending, true = approved, false = rejected
  editedValue?: string; // salesperson may edit before approving
}

export interface CallSenseAnalysisResult {
  customerFacts: string[];
  updatedRequirements: {
    propertyType?: string;
    location?: string;
    budget?: string;
    possessionTimeline?: string;
    amenities?: string[];
    otherPreferences?: string[];
  };
  customerQuestions: CustomerQuestion[];
  unansweredQuestions: string[];
  objectionsConcerns: string[];
  salespersonCommitments: SalespersonCommitment[];
  claimsRequiringVerification: string[];
  missingInformation: string[];
  recommendedNextActions: string[];
  suggestedFollowUp: string;
}

export interface CallSenseHistory {
  id: string;
  leadId: string;
  transcript: string;
  analysisResult: CallSenseAnalysisResult | null;
  factCheckResults: FactCheckResult[];
  proposedUpdates: ProposedLeadUpdate[];
  approvedUpdates: ProposedLeadUpdate[];
  generatedFollowUp: string;
  createdAt: string;
  error?: string;
}

// ----------------------------------------------------------
// Property dataset — illustrative demo data only
// ----------------------------------------------------------
export interface PropertyRecord {
  id: string;
  name: string;
  location: string;
  configuration: string; // e.g. "3BHK", "2BHK"
  startingPriceL: number; // in lakhs, e.g. 85 = ₹85 lakh
  possessionDate: string | null; // ISO date or null if unknown
  coveredParking: boolean | null; // null = unknown
  discountAvailable: boolean | null; // null = unknown/unverified
  notes: string;
  isIllustrativeData: true; // always true — never real live inventory
}

// ----------------------------------------------------------
// API request / response shapes
// ----------------------------------------------------------
export interface CreateLeadRequest {
  name: string;
  location: string;
  propertyRequirement: string;
  budget: string;
  buyingTimeline: string;
  customerMessage: string;
}

export interface UpdateLeadRequest {
  budget?: string;
  location?: string;
  propertyRequirement?: string;
  buyingTimeline?: string;
}

export interface ChatRequest {
  message: string;
}

export interface CallSenseRequest {
  transcript: string;
}

export interface ApproveUpdateRequest {
  callSenseId: string;
  updateIndex: number;
  approved: boolean;
  editedValue?: string;
}
