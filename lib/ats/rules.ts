// Rule-based ATS layer (plan.md §4.3). Pure functions, no external calls.
// Operates on extracted resume plain text + optional job description.
import type { AtsRuleResult } from "@/types";

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;

// Section headers we expect in an ATS-parseable resume.
const REQUIRED_SECTIONS: { id: string; label: string; keywords: string[] }[] = [
  { id: "contact", label: "Kontak", keywords: ["email", "@", "phone", "telp"] },
  {
    id: "experience",
    label: "Pengalaman",
    keywords: ["experience", "pengalaman", "work", "kerja"],
  },
  {
    id: "education",
    label: "Pendidikan",
    keywords: ["education", "pendidikan", "university", "universitas", "sekolah"],
  },
  {
    id: "skills",
    label: "Skill",
    keywords: ["skills", "keahlian", "keterampilan", "kemampuan"],
  },
];

// Heuristic flags that hurt ATS parsing.
const FORMAT_FLAGS: { id: string; label: string; re: RegExp }[] = [
  { id: "tab-columns", label: "Tidak ada kolom ganda (tab)", re: /\t.*\t/m },
  {
    id: "table-pipes",
    label: "Tidak ada tabel (pipe karakter)",
    re: /\|.*\|.*\|/m,
  },
];

export interface RuleInput {
  text: string;
  jobDescription?: string;
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

export function runAtsRules({ text, jobDescription }: RuleInput): {
  ruleResults: AtsRuleResult[];
  score: number;
} {
  const lower = text.toLowerCase();
  const results: AtsRuleResult[] = [];

  // Parse-ability: did we get meaningful text at all?
  const wordCount = tokenize(text).length;
  results.push({
    id: "parseable",
    label: "CV bisa diekstrak jadi teks",
    passed: wordCount >= 50,
    weight: 20,
    detail: `${wordCount} kata terdeteksi`,
  });

  // Required sections present.
  for (const sec of REQUIRED_SECTIONS) {
    const passed = sec.keywords.some((k) => lower.includes(k));
    results.push({
      id: `section-${sec.id}`,
      label: `Ada section ${sec.label}`,
      passed,
      weight: 10,
    });
  }

  // Valid contact.
  results.push({
    id: "email",
    label: "Email valid",
    passed: EMAIL_RE.test(text),
    weight: 8,
  });
  results.push({
    id: "phone",
    label: "Nomor telepon ada",
    passed: PHONE_RE.test(text),
    weight: 6,
  });

  // Length sanity (not too short, not bloated).
  results.push({
    id: "length",
    label: "Panjang wajar (200–1200 kata)",
    passed: wordCount >= 200 && wordCount <= 1200,
    weight: 6,
    detail: `${wordCount} kata`,
  });

  // Format flags (passed = clean, flag NOT present).
  for (const flag of FORMAT_FLAGS) {
    results.push({
      id: flag.id,
      label: flag.label,
      passed: !flag.re.test(text),
      weight: 5,
    });
  }

  // Keyword match vs JD (only if JD provided).
  if (jobDescription && jobDescription.trim().length > 0) {
    const jdTokens = new Set(tokenize(jobDescription));
    const resumeTokens = new Set(tokenize(text));
    let hit = 0;
    jdTokens.forEach((t) => {
      if (resumeTokens.has(t)) hit++;
    });
    const ratio = jdTokens.size ? hit / jdTokens.size : 0;
    results.push({
      id: "jd-match",
      label: "Keyword match dengan job description",
      passed: ratio >= 0.3,
      weight: 14,
      detail: `${Math.round(ratio * 100)}% keyword cocok`,
    });
  }

  // Weighted score 0-100.
  const totalWeight = results.reduce((s, r) => s + r.weight, 0);
  const earned = results.reduce((s, r) => s + (r.passed ? r.weight : 0), 0);
  const score = totalWeight ? Math.round((earned / totalWeight) * 100) : 0;

  return { ruleResults: results, score };
}
