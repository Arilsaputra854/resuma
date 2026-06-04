import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { formatIDR } from "@/lib/utils";
import { PRICING } from "@/lib/xendit";

const freeFeatures = [
  { label: "3 template ATS-friendly", on: true },
  { label: "Resume builder + live preview", on: true },
  { label: "Export PDF (dengan watermark)", on: true },
  { label: "ATS check 1–2x / hari", on: true },
  { label: "Tanpa iklan", on: false },
  { label: "Semua template premium", on: false },
  { label: "ATS check unlimited", on: false },
  { label: "AI rewrite & feedback", on: false },
];

const premiumFeatures = [
  { label: "Semua template", on: true },
  { label: "Resume builder + live preview", on: true },
  { label: "Export PDF tanpa watermark", on: true },
  { label: "ATS check unlimited", on: true },
  { label: "Tanpa iklan", on: true },
  { label: "AI rewrite bullet point", on: true },
  { label: "Feedback AI per section", on: true },
  { label: "Keyword match vs job description", on: true },
];

function FeatureRow({ label, on }: { label: string; on: boolean }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {on ? (
        <Check className="size-4 text-primary" />
      ) : (
        <X className="size-4 text-muted-foreground" />
      )}
      <span className={on ? "" : "text-muted-foreground line-through"}>
        {label}
      </span>
    </li>
  );
}

export default function PricingPage() {
  return (
    <div className="container py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold">Harga sederhana</h1>
        <p className="mt-3 text-muted-foreground">
          Mulai gratis. Upgrade ke premium buat fitur pro. Karyawan kodingyuk
          auto-premium.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        {/* Free */}
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Buat mulai bikin CV.</CardDescription>
            <p className="pt-2 text-3xl font-bold">Rp0</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {freeFeatures.map((f) => (
                <FeatureRow key={f.label} {...f} />
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard">Mulai Gratis</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Premium */}
        <Card className="border-primary shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Premium</CardTitle>
              <Badge>Populer</Badge>
            </div>
            <CardDescription>Buat yang serius cari kerja.</CardDescription>
            <p className="pt-2 text-3xl font-bold">
              {formatIDR(PRICING.monthly)}
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                / bulan
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              atau {formatIDR(PRICING.yearly)} / tahun (hemat 2 bulan)
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {premiumFeatures.map((f) => (
                <FeatureRow key={f.label} {...f} />
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/account?upgrade=1">Upgrade ke Premium</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
