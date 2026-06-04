import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Gauge,
  Download,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Build",
    desc: "Bikin CV dari template ATS-friendly. Form rapi, live preview, auto-save.",
  },
  {
    icon: Gauge,
    title: "Check",
    desc: "Upload CV lama → dapat skor ATS 0–100 + checklist perbaikan actionable.",
  },
  {
    icon: Download,
    title: "Export",
    desc: "Download PDF clean yang parse-able oleh sistem ATS perusahaan.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="container flex flex-col items-center gap-6 py-20 text-center md:py-28">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="size-3" /> ATS-friendly resume builder
        </Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Bikin CV <span className="text-primary">ATS-friendly</span>, cek skor,
          langsung apply.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Resuma bantu kamu bikin resume yang lolos screening ATS, cek skornya,
          dan export PDF clean — gratis untuk mulai.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/builder/new">Bikin CV Sekarang</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/check">Cek Skor ATS</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container grid gap-6 pb-20 md:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title}>
            <CardContent className="flex flex-col gap-3 pt-6">
              <div className="flex size-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <f.icon />
              </div>
              <h3 className="text-xl font-semibold">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Why ATS */}
      <section className="border-t bg-muted/30">
        <div className="container grid gap-10 py-20 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">
              75% CV ditolak sistem sebelum dilihat manusia.
            </h2>
            <p className="text-muted-foreground">
              Banyak perusahaan pakai ATS untuk screening otomatis. Format aneh,
              tabel, atau kolom ganda bikin CV-mu gagal diparse. Resuma cek
              semua itu dan kasih tahu cara benerinnya.
            </p>
            <ul className="space-y-2">
              {[
                "Deteksi format yang ganggu parsing ATS",
                "Cek section wajib & kontak valid",
                "Keyword match vs job description",
                "Feedback AI per section (premium)",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <Card className="bg-background">
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                <span className="font-medium">Skor ATS kamu</span>
                <span className="text-3xl font-bold text-primary">86</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[86%] bg-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Contoh hasil. Cek CV-mu untuk skor asli.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 text-center">
        <h2 className="text-3xl font-bold">Siap lolos screening?</h2>
        <p className="mt-2 text-muted-foreground">
          Mulai gratis. Upgrade kapan saja.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/dashboard">Mulai Sekarang</Link>
        </Button>
      </section>
    </>
  );
}
