// LLM ATS feedback. Combines extracted resume text + optional JD into
// structured qualitative feedback. Premium-only path.
import "server-only";
import { getGroq, MODEL_SMART } from "./client";
import type { AtsLlmFeedback } from "@/types";

const SYSTEM_PROMPT = `Kamu reviewer ATS (Applicant Tracking System) profesional untuk pasar kerja Indonesia.
Analisis resume yang diberikan. Beri feedback jujur, spesifik, actionable.
WAJIB: semua isi teks (strengths, weaknesses, advice, section) ditulis dalam Bahasa Indonesia, bukan Inggris.
Output WAJIB JSON valid sesuai schema, tanpa teks lain, tanpa markdown fence.
Schema:
{
  "strengths": string[],        // 2-4 kekuatan
  "weaknesses": string[],       // 2-4 kelemahan
  "suggestions": [ { "section": string, "advice": string } ],  // saran per section
  "jdRelevance": number|null    // 0-100 relevansi vs job description, null jika JD tidak ada
}`;

export async function getLlmFeedback(
  resumeText: string,
  jobDescription?: string
): Promise<AtsLlmFeedback> {
  const client = getGroq();

  const userParts: string[] = [`RESUME:\n${resumeText}`];
  if (jobDescription?.trim()) {
    userParts.push(`\n\nJOB DESCRIPTION:\n${jobDescription}`);
  }

  const res = await client.chat.completions.create({
    model: MODEL_SMART,
    max_tokens: 1024,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userParts.join("") },
    ],
  });

  const raw = res.choices[0]?.message?.content ?? "{}";
  return parseFeedback(raw, !!jobDescription?.trim());
}

function parseFeedback(raw: string, hadJd: boolean): AtsLlmFeedback {
  try {
    // Strip stray fences if model added them.
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const obj = JSON.parse(cleaned);
    return {
      strengths: Array.isArray(obj.strengths) ? obj.strengths : [],
      weaknesses: Array.isArray(obj.weaknesses) ? obj.weaknesses : [],
      suggestions: Array.isArray(obj.suggestions) ? obj.suggestions : [],
      jdRelevance: hadJd && typeof obj.jdRelevance === "number" ? obj.jdRelevance : null,
    };
  } catch {
    return { strengths: [], weaknesses: [], suggestions: [], jdRelevance: null };
  }
}
