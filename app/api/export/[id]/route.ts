import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ResumePdf } from "@/lib/resume/pdf-doc";
import { newResume } from "@/lib/resume/defaults";
import type { Resume } from "@/types";

export const runtime = "nodejs";

// GET /api/export/:id — fetch resume server-side (admin) and stream PDF.
// Falls back to an empty template if Firestore admin not configured.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  let resume: Resume = newResume("anon", params.id);
  let watermark = true;

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb.collection("resumes").doc(params.id).get();
    if (snap.exists) {
      resume = snap.data() as Resume;
      // Watermark off for premium owners.
      const owner = await adminDb.collection("users").doc(resume.uid).get();
      watermark = owner.data()?.plan !== "premium";
    }
  } catch {
    // admin unavailable — render fallback with watermark.
  }

  return streamPdf(resume, watermark);
}

// POST /api/export/:id — render directly from posted resume JSON (client has
// the live draft; avoids a round-trip to Firestore for unsaved edits).
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { resume: Resume; premium?: boolean };
    if (!body?.resume) {
      return NextResponse.json({ error: "resume wajib." }, { status: 400 });
    }
    return streamPdf(body.resume, !body.premium);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal export." },
      { status: 500 }
    );
  }
}

async function streamPdf(resume: Resume, watermark: boolean) {
  const buffer = await renderToBuffer(
    ResumePdf({ resume, watermark })
  );
  const filename = `${(resume.title || "resume").replace(/[^a-z0-9-_]+/gi, "-")}.pdf`;
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
