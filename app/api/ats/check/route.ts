import { NextRequest, NextResponse } from "next/server";
import { extractPdfText } from "@/lib/ats/parse";
import { runAtsRules } from "@/lib/ats/rules";
import { getLlmFeedback } from "@/lib/llm/ats";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FREE_WEEKLY_QUOTA, QUOTA_WINDOW_MS, type AtsLlmFeedback, type UserProfile } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    // Verify caller — quota is enforced server-side per user.
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!idToken) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }
    let uid: string;
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: "Sesi tidak valid, login ulang." }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    const jobDescription = (form.get("jobDescription") as string) || undefined;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File PDF wajib." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File terlalu besar (max 5MB)." }, { status: 400 });
    }

    // Quota check (free plan only): 2 checks per rolling 7-day window.
    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();
    const profile = userSnap.data() as UserProfile | undefined;
    const isPremium = profile?.plan === "premium";
    const now = Date.now();
    let windowStart = profile?.quotaResetAt ?? now;
    let used = profile?.quotaChecksToday ?? 0;
    if (now - windowStart >= QUOTA_WINDOW_MS) {
      // window expired — reset
      windowStart = now;
      used = 0;
    }
    if (!isPremium && used >= FREE_WEEKLY_QUOTA) {
      const resetIn = Math.ceil((windowStart + QUOTA_WINDOW_MS - now) / (24 * 60 * 60 * 1000));
      return NextResponse.json(
        {
          error: `Kuota gratis habis (${FREE_WEEKLY_QUOTA}x/minggu). Reset dalam ${resetIn} hari, atau upgrade Premium untuk unlimited.`,
        },
        { status: 429 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await extractPdfText(buffer);

    if (!parsed.ok) {
      console.error("[ats/check] parse failed:", parsed.error, "textLen:", parsed.text.length);
      return NextResponse.json(
        {
          error:
            "CV tidak bisa diparse (mungkin hasil scan/gambar). Coba upload PDF teks atau pakai builder.",
          _debug: process.env.NODE_ENV !== "production" ? parsed.error : undefined,
        },
        { status: 422 }
      );
    }

    const { ruleResults, score } = runAtsRules({
      text: parsed.text,
      jobDescription,
    });

    // LLM layer — best-effort. Skip silently if no API key (placeholder env).
    let llmFeedback: AtsLlmFeedback | null = null;
    if (process.env.GROQ_API_KEY) {
      try {
        llmFeedback = await getLlmFeedback(parsed.text, jobDescription);
      } catch {
        llmFeedback = null;
      }
    }

    // Count this check against the free quota (premium = unlimited, no write needed).
    if (!isPremium) {
      await userRef.set(
        { quotaChecksToday: used + 1, quotaResetAt: windowStart },
        { merge: true }
      );
    }

    return NextResponse.json({ score, ruleResults, llmFeedback });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal cek CV." },
      { status: 500 }
    );
  }
}
