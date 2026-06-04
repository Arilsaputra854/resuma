# Resuma — Resume Builder + ATS Checker

Bikin CV ATS-friendly, cek skor, langsung apply. Live: `resuma.kodingyuk.id`.

Full skeleton scaffold of [plan.md](plan.md) — all 4 fases stubbed. Features wired
end-to-end but external services (Firebase, Xendit, Claude) degrade gracefully when
env keys are absent.

## Stack

Next.js 14 (App Router) · Tailwind + shadcn/ui · Firebase (Auth/Firestore/Storage) ·
Claude API (ATS feedback + AI rewrite) · Xendit (payment) · @react-pdf/renderer (export) ·
pdf-parse (ATS parse).

## Setup

```bash
npm install
cp .env.example .env.local   # fill keys (optional — app runs without)
npm run dev                  # http://localhost:3000
```

Without keys: UI renders, builder works (no save), ATS rule-layer works on upload,
LLM/payment/auth return graceful 503 or signed-out state.

## Structure

```
app/
  (marketing)/        landing, pricing
  (app)/              dashboard, builder/[id], check, account  (auth-gated UI)
  api/
    ats/check         PDF parse → rule score → optional LLM feedback
    ai/rewrite        Claude bullet rewrite (premium)
    xendit/invoice    create Xendit invoice
    xendit/webhook    verified, idempotent plan upgrade
    export/[id]       render ATS-clean PDF
components/
  ui/                 shadcn primitives
  builder/            form + live preview
  ats/                score result
lib/
  firebase/           client config, admin, auth, firestore
  ats/                rule engine + PDF parse
  claude/             LLM client, ATS feedback, rewrite
  xendit/             invoice + webhook helpers
  resume/             defaults + @react-pdf doc
types/                shared domain types (mirrors Firestore model)
```

## Implemented vs TODO

**Working:** routing, marketing pages, builder UI + live preview + auto-save (when
signed in), ATS rule-based scoring, LLM ATS feedback, AI rewrite, PDF export, Xendit
invoice + idempotent webhook, auto-premium for `@kodingyuk.id`.

**TODO (marked inline):** server-side Firebase ID-token verification on API routes,
quota enforcement + `atsChecks` persistence, payment record on invoice create,
AdSense, drag-drop section reorder, DOCX parse, admin dashboard.

## Notes (from plan.md §9)

- Failed PDF parse → user prompted to re-upload or use builder.
- Webhook is idempotent (dedup by Xendit invoice id) to avoid double-credit.
- LLM is rate/cost sensitive — premium-gated, system prompt cached.
- ATS scoring rubric is custom + transparent (checklist shown to user).
