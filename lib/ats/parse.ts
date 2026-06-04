// PDF text extraction — server only.
import "server-only";

export interface ParseResult {
  text: string;
  ok: boolean;
  error?: string;
}

// Lazy-load pdfjs (legacy ESM build) and wire up its worker for Node.
async function loadPdfjs() {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // v6 requires a real workerSrc. Resolve the worker path via Node at runtime,
  // hidden behind eval() so webpack's static analyzer leaves it alone.
  const nodeRequire = eval("require") as NodeRequire;
  const workerPath: string = nodeRequire.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "file:///" + workerPath.replace(/\\/g, "/");
  return pdfjsLib;
}

// OCR fallback: render each page to PNG (pdfjs + canvas), then run tesseract.
// Handles scanned / print-to-pdf files that have no recoverable text layer.
async function ocrPdf(buffer: Buffer): Promise<string> {
  const pdfjsLib = await loadPdfjs();
  const { createCanvas } = await import("@napi-rs/canvas");
  const { createWorker } = await import("tesseract.js");

  const uint8 = new Uint8Array(buffer);
  const pdf = await pdfjsLib.getDocument({ data: uint8, useSystemFonts: true }).promise;

  // eng only — handles Indonesian CV text fine and is ~2x faster than eng+ind.
  const worker = await createWorker("eng");
  try {
    const parts: string[] = [];
    const maxPages = Math.min(pdf.numPages, 5); // cap work; CVs are short
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = createCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext("2d");
      // @ts-expect-error napi-rs canvas ctx is compatible with pdfjs at runtime
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      const png = canvas.toBuffer("image/png");
      const { data } = await worker.recognize(png);
      parts.push(data.text);
    }
    return parts.join("\n").trim();
  } finally {
    await worker.terminate();
  }
}

export async function extractPdfText(buffer: Buffer): Promise<ParseResult> {
  // 1. pdf-parse — fast, handles most text PDFs (incl. @react-pdf output).
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    const text = (data.text || "").trim();
    console.log("[ats/parse] pdf-parse ok, textLen:", text.length, "pages:", data.numpages);
    if (text.length > 20) return { text, ok: true };
  } catch (err) {
    console.error("[ats/parse] pdf-parse threw:", err);
  }

  // 2. pdfjs text layer — catches PDFs pdf-parse mishandles.
  try {
    const pdfjsLib = await loadPdfjs();
    const uint8 = new Uint8Array(buffer);
    const pdf = await pdfjsLib.getDocument({ data: uint8, useSystemFonts: true }).promise;
    const parts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = (content.items as { str?: string }[]).map((it) => it.str ?? "").join(" ");
      parts.push(pageText);
    }
    const text = parts.join("\n").trim();
    console.log("[ats/parse] pdfjs ok, textLen:", text.length);
    if (text.length > 20) return { text, ok: true };
  } catch (err) {
    console.error("[ats/parse] pdfjs threw:", err);
  }

  // 3. OCR — last resort for scanned / print-to-pdf with no text layer.
  try {
    const text = await ocrPdf(buffer);
    console.log("[ats/parse] ocr ok, textLen:", text.length);
    return { text, ok: text.length > 20 };
  } catch (err) {
    console.error("[ats/parse] ocr threw:", err);
    return {
      text: "",
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
