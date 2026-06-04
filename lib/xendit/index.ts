// Xendit payment integration (plan.md §5). Server only.
// Uses Invoice API via REST (no SDK dep) — QRIS/VA/ewallet supported by Xendit.
import "server-only";
import { PRICING, type BillingPeriod } from "@/types";

const XENDIT_BASE = "https://api.xendit.co";

// Re-export shared pricing for server callers.
export { PRICING };

function authHeader(): string {
  const key = process.env.XENDIT_SECRET_KEY;
  if (!key) throw new Error("XENDIT_SECRET_KEY missing");
  // Xendit uses HTTP Basic with secret key as username, empty password.
  return "Basic " + Buffer.from(`${key}:`).toString("base64");
}

export interface CreateInvoiceParams {
  uid: string;
  email: string;
  period: BillingPeriod;
}

export interface XenditInvoice {
  id: string;
  invoice_url: string;
  status: string;
  amount: number;
}

export async function createInvoice(
  params: CreateInvoiceParams
): Promise<XenditInvoice> {
  const amount = PRICING[params.period];
  const externalId = `resuma-${params.uid}-${Date.now()}`;

  const res = await fetch(`${XENDIT_BASE}/v2/invoices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      external_id: externalId,
      amount,
      payer_email: params.email,
      description: `Resuma Premium (${params.period})`,
      success_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?upgrade=success`,
      failure_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?upgrade=failed`,
      metadata: { uid: params.uid, period: params.period },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Xendit invoice failed: ${res.status} ${body}`);
  }
  return (await res.json()) as XenditInvoice;
}

// Webhook verification — Xendit sends x-callback-token header (plan.md §5).
export function verifyWebhookToken(token: string | null): boolean {
  const expected = process.env.XENDIT_WEBHOOK_TOKEN;
  if (!expected || !token) return false;
  return token === expected;
}

// Compute plan expiry from period.
export function computeExpiry(period: BillingPeriod, from = Date.now()): number {
  const day = 24 * 60 * 60 * 1000;
  return from + (period === "yearly" ? 365 * day : 30 * day);
}
