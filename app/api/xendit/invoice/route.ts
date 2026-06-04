import { NextRequest, NextResponse } from "next/server";
import { createInvoice } from "@/lib/xendit";
import type { BillingPeriod } from "@/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { uid, email, period } = (await req.json()) as {
      uid?: string;
      email?: string;
      period?: BillingPeriod;
    };

    if (!uid || !email || (period !== "monthly" && period !== "yearly")) {
      return NextResponse.json({ error: "Param tidak valid." }, { status: 400 });
    }

    if (!process.env.XENDIT_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payment belum dikonfigurasi (XENDIT_SECRET_KEY)." },
        { status: 503 }
      );
    }

    // TODO: verify Firebase ID token matches uid before creating invoice.
    const invoice = await createInvoice({ uid, email, period });

    // TODO: persist payments/ doc with status=pending + xenditInvoiceId.

    return NextResponse.json({
      invoice_url: invoice.invoice_url,
      id: invoice.id,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal buat invoice." },
      { status: 500 }
    );
  }
}
