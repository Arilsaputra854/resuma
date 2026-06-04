// AI rewrite of resume bullet points (plan.md §4.2, premium). Makes bullets
// more impactful: action verb + quantified result where possible.
import "server-only";
import { getGroq, MODEL_FAST } from "./client";

const SYSTEM_PROMPT = `Kamu copywriter resume. Tulis ulang bullet point pengalaman kerja
agar lebih impactful: mulai dengan action verb kuat, tunjukkan hasil terukur kalau bisa,
ringkas (1 baris). Pertahankan fakta asli, jangan mengarang angka.
Output WAJIB JSON: { "bullets": string[] } dengan urutan sama seperti input. Tanpa teks lain.`;

export async function rewriteBullets(bullets: string[]): Promise<string[]> {
  if (!bullets.length) return [];
  const client = getGroq();

  const res = await client.chat.completions.create({
    model: MODEL_FAST,
    max_tokens: 800,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Bullet points:\n${bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}`,
      },
    ],
  });

  const raw = res.choices[0]?.message?.content ?? "";
  try {
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const obj = JSON.parse(cleaned);
    return Array.isArray(obj.bullets) ? obj.bullets : bullets;
  } catch {
    return bullets;
  }
}
