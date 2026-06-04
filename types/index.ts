// Resuma — shared domain types. Mirrors Firestore data model in plan.md §6.

export type Plan = "free" | "premium";

// Free-plan ATS quota: N checks per rolling 7-day window.
export const FREE_WEEKLY_QUOTA = 2;
export const QUOTA_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Premium pricing (IDR). Client-safe mirror of lib/xendit PRICING.
export const PRICING: Record<BillingPeriod, number> = {
  monthly: 15000,
  yearly: 162000,
};

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  plan: Plan;
  planExpiry?: number | null; // epoch ms
  quotaChecksToday: number; // checks used in current 7-day window (field name legacy)
  quotaResetAt: number; // epoch ms — start of current quota window
  createdAt: number;
}

// ---- Resume ----

export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location?: string;
  website?: string;
  linkedin?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string; // or "Present"
  location?: string;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  link?: string;
  bullets: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeSections {
  contact: ContactInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
}

export type TemplateId = "minimal" | "classic" | "modern" | string;

export interface Resume {
  id: string;
  uid: string;
  title: string;
  template: TemplateId;
  sections: ResumeSections;
  updatedAt: number;
  createdAt: number;
}

// ---- ATS Check ----

export interface AtsRuleResult {
  id: string;
  label: string;
  passed: boolean;
  weight: number; // contribution to score
  detail?: string;
}

export interface AtsLlmFeedback {
  strengths: string[];
  weaknesses: string[];
  suggestions: { section: string; advice: string }[];
  jdRelevance?: number | null; // 0-100 if JD provided
}

export interface AtsCheck {
  id: string;
  uid: string;
  resumeId?: string;
  uploadedFileUrl?: string;
  jobDescription?: string;
  score: number; // 0-100
  ruleResults: AtsRuleResult[];
  llmFeedback?: AtsLlmFeedback | null;
  createdAt: number;
}

// ---- Payment ----

export type PaymentStatus = "pending" | "paid" | "expired" | "failed";
export type BillingPeriod = "monthly" | "yearly";

export interface Payment {
  id: string;
  uid: string;
  xenditInvoiceId: string;
  amount: number;
  status: PaymentStatus;
  plan: Plan;
  period: BillingPeriod;
  createdAt: number;
  paidAt?: number | null;
}
