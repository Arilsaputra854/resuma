# Resuma — Resume Builder + ATS Checker

**Live:** `resuma.kodingyuk.id`
**Tagline:** Bikin CV ATS-friendly, cek skor, langsung apply.

---

## 1. Ringkasan Produk

Web app bantu user (anak magang, publik, internal kodingyuk) untuk:

1. **Build** — bikin CV/resume dari template ATS-friendly.
2. **Check** — upload CV lama → dapat skor ATS + feedback perbaikan.
3. **Export** — download PDF (clean, parse-able oleh ATS).

Model bisnis: **freemium**. Free + iklan. Premium hilangin iklan + fitur pro.

---

## 2. Brand & Domain

- Nama: **Resuma** (resume + -a, brandable, pendek).
- Domain live: `resuma.kodingyuk.id`.
- Subdomain staging: `staging-resuma.kodingyuk.id`.
- Logo: wordmark sederhana, warna primer biru/teal (trust + profesional).

---

## 3. Tech Stack

| Layer | Pilihan | Alasan |
|-------|---------|--------|
| Frontend/App | **Next.js 14 (App Router)** | SSR/SEO, cocok Firebase + Vercel, build cepat |
| Styling | Tailwind CSS + shadcn/ui | Konsisten, cepat |
| Auth | **Firebase Auth** (Google SSO + email) | Sudah punya Firebase, SSO Google native |
| DB | Firestore | Realtime, simpel, sudah di ekosistem Firebase |
| Storage | Firebase Storage | Simpan CV upload + PDF export |
| ATS Engine | **Hybrid: rule-based + Claude API** | Akurat, biaya terkontrol |
| PDF Parse | `pdf-parse` / `pdfjs` | Ekstrak teks dari CV upload |
| PDF Export | `@react-pdf/renderer` atau Puppeteer | Render CV ke PDF clean |
| Payment | **Xendit** | Sudah dipakai, konek ERP, QRIS/VA/ewallet/recurring |
| Iklan | Google AdSense (+ opsi in-house) | Monetisasi user free |
| Hosting | Vercel (app) + Firebase (auth/db/storage) | Deploy mulus |
| Analytics | Firebase Analytics + PostHog (opsional) | Funnel + retensi |

---

## 4. Komponen Utama

### 4.1 Auth & User
- Login Google SSO (Firebase).
- Login email/password (fallback).
- Profil user: nama, email, status plan (free/premium), kuota.
- Role internal kodingyuk (auto-premium via domain email `@kodingyuk.id`).

### 4.2 Resume Builder
- Form section: Personal, Summary, Experience, Education, Skills, Projects, Certifications.
- Pilih template (3 free, sisanya premium).
- Live preview real-time.
- Auto-save ke Firestore.
- Reorder section (drag-drop).
- AI assist (premium): rewrite bullet point biar lebih impactful.

### 4.3 ATS Checker
- Input: upload PDF/DOCX **atau** ambil dari builder.
- **Rule-based layer:**
  - Parse-ability (teks bisa diekstrak? tabel/gambar ganggu?).
  - Section wajib ada (kontak, pengalaman, skill).
  - Keyword match vs job description (kalau user paste JD).
  - Format flag (font aneh, kolom ganda, header/footer text).
  - Panjang, kontak valid (email/phone).
- **LLM layer (Claude API):**
  - Feedback kualitatif: kekuatan/kelemahan.
  - Saran perbaikan per section.
  - Skor relevansi vs JD.
- Output: **skor 0–100** + checklist + saran actionable.
- Free: 1–2 cek/hari. Premium: unlimited.

### 4.4 Export
- PDF ATS-friendly (teks selectable, no image-text).
- Watermark "Resuma" di free, hilang di premium.

### 4.5 Monetisasi
- **Free:** iklan AdSense, watermark, kuota cek terbatas, 3 template.
- **Premium:** no iklan, no watermark, unlimited cek, semua template, AI assist.
- Plan: bulanan + tahunan (diskon).

### 4.6 Admin
- Dashboard: jumlah user, konversi free→premium, revenue.
- Kelola template.
- Lihat status payment (sinkron Xendit).

---

## 5. Payment Flow (Xendit)

```
User klik Upgrade
  → buat invoice via Xendit API (server / Cloud Function)
  → user bayar (QRIS / VA / ewallet)
  → Xendit kirim webhook ke endpoint kita
  → verifikasi signature webhook
  → update Firestore: plan=premium, expiry=+30d/+1y
  → sinkron ke ERP (sudah ada jalur Xendit→ERP)
```

- **Subscription:** pakai Xendit Recurring/Subscription API, atau manual renew invoice.
- **Webhook security:** verifikasi `x-callback-token` Xendit.
- Endpoint webhook: Next.js API route atau Firebase Cloud Function.

---

## 6. Data Model (Firestore)

```
users/{uid}
  - email, name, photoURL
  - plan: "free" | "premium"
  - planExpiry: timestamp
  - quotaChecksToday: number
  - quotaResetAt: timestamp
  - createdAt

resumes/{resumeId}
  - uid (owner)
  - title
  - template
  - sections: {...}
  - updatedAt

atsChecks/{checkId}
  - uid
  - resumeId | uploadedFileUrl
  - jobDescription (opsional)
  - score: number
  - ruleResults: {...}
  - llmFeedback: {...}
  - createdAt

payments/{paymentId}
  - uid
  - xenditInvoiceId
  - amount, status
  - plan, period
  - createdAt, paidAt
```

---

## 7. Struktur Folder (Next.js)

```
/app
  /(marketing)        landing, pricing
  /(app)
    /dashboard
    /builder/[id]
    /check
    /account
  /api
    /xendit/webhook
    /ats/check
    /ai/rewrite
/components
  /ui                 shadcn
  /builder
  /ats
/lib
  /firebase
  /xendit
  /ats                rule engine
  /claude             LLM client
/types
```

---

## 8. Roadmap (Fase)

### Fase 1 — MVP (inti)
- [ ] Auth Google SSO + email (Firebase).
- [ ] Resume builder (form + 3 template + live preview + auto-save).
- [ ] Export PDF (watermark free).
- [ ] ATS checker rule-based (skor + checklist).
- [ ] Landing + pricing page.

### Fase 2 — Monetisasi
- [ ] Integrasi Xendit (invoice + webhook + update plan).
- [ ] Gating premium (kuota, watermark, template).
- [ ] AdSense untuk free user.
- [ ] Auto-premium domain `@kodingyuk.id`.

### Fase 3 — AI & Polish
- [ ] LLM layer ATS (Claude API feedback).
- [ ] AI rewrite bullet (premium).
- [ ] Keyword match vs JD.
- [ ] Admin dashboard.

### Fase 4 — Skala
- [ ] Subscription recurring Xendit.
- [ ] Template marketplace.
- [ ] Multi-bahasa (ID/EN).
- [ ] Analytics funnel + A/B test pricing.

---

## 9. Risiko & Catatan

- **Parsing CV** susah konsisten (PDF rusak/scan). Mitigasi: deteksi gagal parse → minta upload ulang / pakai builder.
- **Biaya LLM**: rate-limit + cache hasil per CV. Premium aja yang dapat full LLM.
- **ATS scoring** tidak ada standar resmi. Buat rubrik sendiri, transparan ke user.
- **Webhook Xendit** harus idempotent (hindari double-credit).
- **Iklan vs UX**: jangan ganggu builder. Iklan di landing/dashboard aja.

---

## 10. Keputusan Terkunci

| Aspek | Pilihan |
|-------|---------|
| Brand | Resuma → `resuma.kodingyuk.id` |
| Stack | Next.js 14 + Tailwind + shadcn |
| Auth | Firebase Auth (Google SSO) |
| DB/Storage | Firestore + Firebase Storage |
| Payment | Xendit (→ ERP) |
| ATS Engine | Hybrid (rule + Claude API) |
| Model bisnis | Freemium (iklan + premium) |
