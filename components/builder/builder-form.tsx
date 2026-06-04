"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Save, Sparkles } from "lucide-react";
import { ResumePreview } from "./resume-preview";
import { useAuth } from "@/components/auth-provider";
import { saveResume } from "@/lib/firebase/firestore";
import { uid } from "@/lib/resume/defaults";
import type {
  Resume,
  ExperienceItem,
  EducationItem,
} from "@/types";

const TEMPLATES = [
  { id: "minimal", label: "Minimal", premium: false },
  { id: "classic", label: "Classic", premium: false },
  { id: "modern", label: "Modern", premium: false },
  { id: "executive", label: "Executive", premium: true },
  { id: "compact", label: "Compact", premium: true },
];

export function BuilderForm({ initial }: { initial: Resume }) {
  const { user, profile } = useAuth();
  const [resume, setResume] = useState<Resume>(initial);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");
  const isPremium = profile?.plan === "premium";
  const firstRender = useRef(true);

  const patch = useCallback((fn: (r: Resume) => Resume) => {
    setResume((prev) => ({ ...fn(prev), updatedAt: Date.now() }));
  }, []);

  // Auto-save (debounced) to Firestore when signed in.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!user) return;
    setSaving("saving");
    const t = setTimeout(() => {
      saveResume({ ...resume, uid: user.uid })
        .then(() => setSaving("saved"))
        .catch(() => setSaving("idle"));
    }, 1200);
    return () => clearTimeout(t);
  }, [resume, user]);

  const s = resume.sections;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Form column */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Input
            className="max-w-xs text-lg font-semibold"
            value={resume.title}
            onChange={(e) => patch((r) => ({ ...r, title: e.target.value }))}
          />
          <span className="text-xs text-muted-foreground">
            {saving === "saving"
              ? "Menyimpan…"
              : saving === "saved"
                ? "Tersimpan"
                : user
                  ? ""
                  : "Login untuk simpan"}
          </span>
        </div>

        {/* Template picker */}
        <div className="space-y-2">
          <Label>Template</Label>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => {
              const locked = t.premium && !isPremium;
              return (
                <Button
                  key={t.id}
                  size="sm"
                  variant={resume.template === t.id ? "default" : "outline"}
                  disabled={locked}
                  onClick={() => patch((r) => ({ ...r, template: t.id }))}
                >
                  {t.label}
                  {t.premium && " ★"}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Personal */}
        <Section title="Personal">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nama lengkap" value={s.contact.fullName}
              onChange={(v) => patch((r) => ({ ...r, sections: { ...r.sections, contact: { ...r.sections.contact, fullName: v } } }))} />
            <Field label="Email" value={s.contact.email}
              onChange={(v) => patch((r) => ({ ...r, sections: { ...r.sections, contact: { ...r.sections.contact, email: v } } }))} />
            <Field label="Telepon" value={s.contact.phone}
              onChange={(v) => patch((r) => ({ ...r, sections: { ...r.sections, contact: { ...r.sections.contact, phone: v } } }))} />
            <Field label="Lokasi" value={s.contact.location ?? ""}
              onChange={(v) => patch((r) => ({ ...r, sections: { ...r.sections, contact: { ...r.sections.contact, location: v } } }))} />
            <Field label="Website" value={s.contact.website ?? ""}
              onChange={(v) => patch((r) => ({ ...r, sections: { ...r.sections, contact: { ...r.sections.contact, website: v } } }))} />
            <Field label="LinkedIn" value={s.contact.linkedin ?? ""}
              onChange={(v) => patch((r) => ({ ...r, sections: { ...r.sections, contact: { ...r.sections.contact, linkedin: v } } }))} />
          </div>
        </Section>

        {/* Summary */}
        <Section title="Ringkasan">
          <Textarea
            value={s.summary}
            placeholder="Ringkasan singkat tentang kamu…"
            onChange={(e) => patch((r) => ({ ...r, sections: { ...r.sections, summary: e.target.value } }))}
          />
        </Section>

        {/* Experience */}
        <Section
          title="Pengalaman"
          onAdd={() =>
            patch((r) => ({
              ...r,
              sections: {
                ...r.sections,
                experience: [
                  ...r.sections.experience,
                  { id: uid(), company: "", role: "", startDate: "", endDate: "", bullets: [""] },
                ],
              },
            }))
          }
        >
          {s.experience.map((exp, i) => (
            <RepeatCard
              key={exp.id}
              onRemove={() =>
                patch((r) => ({
                  ...r,
                  sections: { ...r.sections, experience: r.sections.experience.filter((x) => x.id !== exp.id) },
                }))
              }
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Posisi" value={exp.role} onChange={(v) => updateExp(patch, i, { role: v })} />
                <Field label="Perusahaan" value={exp.company} onChange={(v) => updateExp(patch, i, { company: v })} />
                <Field label="Mulai" value={exp.startDate} onChange={(v) => updateExp(patch, i, { startDate: v })} />
                <Field label="Selesai" value={exp.endDate} onChange={(v) => updateExp(patch, i, { endDate: v })} />
              </div>
              <Label className="mt-2 block">Bullet points</Label>
              {exp.bullets.map((b, bi) => (
                <Input
                  key={bi}
                  className="mt-1"
                  value={b}
                  placeholder="Capaian / tanggung jawab…"
                  onChange={(e) => {
                    const bullets = [...exp.bullets];
                    bullets[bi] = e.target.value;
                    updateExp(patch, i, { bullets });
                  }}
                />
              ))}
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => updateExp(patch, i, { bullets: [...exp.bullets, ""] })}>
                  <Plus className="size-3" /> Bullet
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!isPremium}
                  title={isPremium ? "Rewrite bullet pakai AI" : "Premium only"}
                  onClick={() => aiRewrite(exp, (bullets) => updateExp(patch, i, { bullets }))}
                >
                  <Sparkles className="size-3" /> AI Rewrite {isPremium ? "" : "★"}
                </Button>
              </div>
            </RepeatCard>
          ))}
        </Section>

        {/* Education */}
        <Section
          title="Pendidikan"
          onAdd={() =>
            patch((r) => ({
              ...r,
              sections: {
                ...r.sections,
                education: [
                  ...r.sections.education,
                  { id: uid(), school: "", degree: "", startDate: "", endDate: "" },
                ],
              },
            }))
          }
        >
          {s.education.map((ed, i) => (
            <RepeatCard
              key={ed.id}
              onRemove={() =>
                patch((r) => ({
                  ...r,
                  sections: { ...r.sections, education: r.sections.education.filter((x) => x.id !== ed.id) },
                }))
              }
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Gelar" value={ed.degree} onChange={(v) => updateEdu(patch, i, { degree: v })} />
                <Field label="Sekolah" value={ed.school} onChange={(v) => updateEdu(patch, i, { school: v })} />
                <Field label="Bidang" value={ed.field ?? ""} onChange={(v) => updateEdu(patch, i, { field: v })} />
                <Field label="Tahun" value={`${ed.startDate}`} onChange={(v) => updateEdu(patch, i, { startDate: v })} />
              </div>
            </RepeatCard>
          ))}
        </Section>

        {/* Skills */}
        <Section title="Skill">
          <Input
            value={s.skills.join(", ")}
            placeholder="React, TypeScript, SQL…"
            onChange={(e) => {
              const skills = e.target.value
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean);
              patch((r) => ({
                ...r,
                sections: { ...r.sections, skills },
              }));
            }}
          />
          <p className="mt-1 text-xs text-muted-foreground">Pisahkan dengan koma.</p>
        </Section>

        {user && (
          <Button
            onClick={() => saveResume({ ...resume, uid: user.uid }).then(() => setSaving("saved"))}
          >
            <Save /> Simpan
          </Button>
        )}
      </div>

      {/* Preview column */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <ResumePreview resume={resume} watermark={!isPremium} />
        <div className="mt-3 flex justify-end">
          <Button variant="outline" onClick={() => exportPdf(resume, isPremium)}>
            Export PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---- helpers ----

function updateExp(
  patch: (fn: (r: Resume) => Resume) => void,
  index: number,
  upd: Partial<ExperienceItem>
) {
  patch((r) => {
    const experience = [...r.sections.experience];
    experience[index] = { ...experience[index], ...upd };
    return { ...r, sections: { ...r.sections, experience } };
  });
}

function updateEdu(
  patch: (fn: (r: Resume) => Resume) => void,
  index: number,
  upd: Partial<EducationItem>
) {
  patch((r) => {
    const education = [...r.sections.education];
    education[index] = { ...education[index], ...upd };
    return { ...r, sections: { ...r.sections, education } };
  });
}

// POST the live draft (incl. unsaved edits) and open the rendered PDF.
// Avoids relying on a Firestore-saved copy for export.
async function exportPdf(resume: Resume, premium: boolean) {
  try {
    const res = await fetch(`/api/export/${resume.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume, premium }),
    });
    if (!res.ok) {
      alert("Export gagal.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    // Revoke after a tick so the new tab has time to load it.
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch (err) {
    console.error("Export failed:", err);
    alert("Export gagal.");
  }
}

async function aiRewrite(exp: ExperienceItem, apply: (bullets: string[]) => void) {
  try {
    const res = await fetch("/api/ai/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bullets: exp.bullets.filter(Boolean) }),
    });
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data.bullets)) apply(data.bullets);
  } catch {
    /* ignore */
  }
}

// ---- sub-components ----

function Section({
  title,
  children,
  onAdd,
}: {
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        {onAdd && (
          <Button size="sm" variant="outline" onClick={onAdd}>
            <Plus className="size-3" /> Tambah
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function RepeatCard({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <Card>
      <CardContent className="relative pt-6">
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-2 top-2 size-7"
          onClick={onRemove}
        >
          <Trash2 className="size-3" />
        </Button>
        {children}
      </CardContent>
    </Card>
  );
}
