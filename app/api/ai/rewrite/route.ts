import { NextRequest, NextResponse } from "next/server";
import { rewriteBullets } from "@/lib/llm/rewrite";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { bullets } = await req.json();
    if (!Array.isArray(bullets)) {
      return NextResponse.json({ error: "bullets[] wajib." }, { status: 400 });
    }

    // TODO: verify Firebase ID token + premium plan before calling LLM.
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "AI rewrite belum dikonfigurasi (GROQ_API_KEY)." },
        { status: 503 }
      );
    }

    const rewritten = await rewriteBullets(bullets as string[]);
    return NextResponse.json({ bullets: rewritten });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal rewrite." },
      { status: 500 }
    );
  }
}
