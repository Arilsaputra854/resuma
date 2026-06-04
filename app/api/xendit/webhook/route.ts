import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookToken, computeExpiry } from "@/lib/xendit";
import type { BillingPeriod } from "@/types";

export const runtime = "nodejs";

// Xendit invoice webhook (plan.md §5). Verifies x-callback-token, updates
// user plan idempotently, syncs payment record. ERP sync handled downstream.
export async function POST(req: NextRequest) {
  const token = req.headers.get("x-callback-token");
  if (!verifyWebhookToken(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  // Only act on paid invoices.
  if (body.status !== "PAID" && body.status !== "SETTLED") {
    return NextResponse.json({ received: true, ignored: body.status });
  }

  const uid: string | undefined = body.metadata?.uid;
  const period: BillingPeriod = body.metadata?.period === "yearly" ? "yearly" : "monthly";
  const invoiceId: string | undefined = body.id;

  if (!uid || !invoiceId) {
    return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
  }

  try {
    // Lazy import: admin SDK throws if env missing; keep route loadable.
    const { adminDb } = await import("@/lib/firebase/admin");

    // Idempotency: skip if this invoice already processed.
    const paymentRef = adminDb.collection("payments").doc(invoiceId);
    const existing = await paymentRef.get();
    if (existing.exists && existing.data()?.status === "paid") {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const now = Date.now();
    const expiry = computeExpiry(period, now);

    await adminDb.runTransaction(async (tx) => {
      tx.set(
        paymentRef,
        {
          id: invoiceId,
          uid,
          xenditInvoiceId: invoiceId,
          amount: body.amount ?? body.paid_amount ?? 0,
          status: "paid",
          plan: "premium",
          period,
          createdAt: now,
          paidAt: now,
        },
        { merge: true }
      );
      tx.set(
        adminDb.collection("users").doc(uid),
        { plan: "premium", planExpiry: expiry },
        { merge: true }
      );
    });

    return NextResponse.json({ received: true, upgraded: uid });
  } catch (err) {
    // Admin not configured (placeholder env) or transient failure.
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook handler failed" },
      { status: 500 }
    );
  }
}
