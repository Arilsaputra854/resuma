"use client";

import { cn } from "@/lib/utils";
import type { Resume } from "@/types";

interface Props {
  resume: Resume;
  watermark?: boolean;
}

// On-screen preview. Mirrors the ATS-clean PDF layout (single column, text-only).
export function ResumePreview({ resume, watermark = true }: Props) {
  const { sections, template } = resume;
  const { contact } = sections;

  const accent =
    template === "modern"
      ? "text-primary"
      : template === "classic"
        ? "text-foreground"
        : "text-foreground";

  return (
    <div className="relative aspect-[1/1.414] w-full overflow-y-auto rounded-md border bg-white p-8 text-sm text-zinc-900 shadow-sm">
      {watermark && (
        <div className="pointer-events-none absolute bottom-3 right-3 text-[10px] text-zinc-300">
          Dibuat dengan Resuma
        </div>
      )}

      {/* Header */}
      <header className={cn("border-b pb-3", template === "modern" && "border-primary")}>
        <h1 className={cn("text-2xl font-bold", accent)}>
          {contact.fullName || "Nama Kamu"}
        </h1>
        <p className="mt-1 text-xs text-zinc-600">
          {[contact.email, contact.phone, contact.location]
            .filter(Boolean)
            .join("  ·  ") || "email · telepon · lokasi"}
        </p>
        {(contact.website || contact.linkedin) && (
          <p className="text-xs text-zinc-600">
            {[contact.website, contact.linkedin].filter(Boolean).join("  ·  ")}
          </p>
        )}
      </header>

      {sections.summary && (
        <Section title="Ringkasan" accent={accent}>
          <p className="text-zinc-700">{sections.summary}</p>
        </Section>
      )}

      {sections.experience.length > 0 && (
        <Section title="Pengalaman" accent={accent}>
          {sections.experience.map((e) => (
            <div key={e.id} className="mb-3">
              <div className="flex justify-between font-medium">
                <span>
                  {e.role || "Posisi"}{e.company ? ` — ${e.company}` : ""}
                </span>
                <span className="text-xs text-zinc-500">
                  {e.startDate} – {e.endDate}
                </span>
              </div>
              <ul className="ml-4 list-disc text-zinc-700">
                {e.bullets.filter(Boolean).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {sections.education.length > 0 && (
        <Section title="Pendidikan" accent={accent}>
          {sections.education.map((ed) => (
            <div key={ed.id} className="mb-2 flex justify-between">
              <span>
                <span className="font-medium">{ed.degree}</span>
                {ed.field ? `, ${ed.field}` : ""} — {ed.school}
              </span>
              <span className="text-xs text-zinc-500">
                {ed.startDate} – {ed.endDate}
              </span>
            </div>
          ))}
        </Section>
      )}

      {sections.skills.length > 0 && (
        <Section title="Skill" accent={accent}>
          <div className="flex flex-wrap gap-2">
            {sections.skills.map((skill, i) => (
              <span
                key={i}
                className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {sections.projects.length > 0 && (
        <Section title="Proyek" accent={accent}>
          {sections.projects.map((p) => (
            <div key={p.id} className="mb-2">
              <span className="font-medium">{p.name}</span>
              {p.description && <span> — {p.description}</span>}
            </div>
          ))}
        </Section>
      )}

      {sections.certifications.length > 0 && (
        <Section title="Sertifikasi" accent={accent}>
          {sections.certifications.map((c) => (
            <div key={c.id} className="mb-1">
              {c.name} — {c.issuer} ({c.date})
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4">
      <h2 className={cn("mb-1 text-sm font-bold uppercase tracking-wide", accent)}>
        {title}
      </h2>
      {children}
    </section>
  );
}
