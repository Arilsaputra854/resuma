"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload } from "lucide-react";
import { ScoreResult } from "@/components/ats/score-result";
import { useAuth } from "@/components/auth-provider";
import type { AtsRuleResult, AtsLlmFeedback } from "@/types";

interface CheckResponse {
  score: number;
  ruleResults: AtsRuleResult[];
  llmFeedback?: AtsLlmFeedback | null;
  error?: string;
}

export default function CheckPage() {
  const { user, profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!file) {
      setErr("Pilih file PDF dulu.");
      return;
    }
    setBusy(true);
    setErr(null);
    setResult(null);
    try {
      if (!user) {
        setErr("Login dulu untuk cek ATS.");
        return;
      }
      const token = await user.getIdToken();
      const fd = new FormData();
      fd.append("file", file);
      if (jd.trim()) fd.append("jobDescription", jd);
      const res = await fetch("/api/ats/check", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data: CheckResponse = await res.json();
      if (!res.ok || data.error) {
        setErr(data.error ?? "Gagal cek CV.");
      } else {
        setResult(data);
      }
    } catch {
      setErr("Gagal menghubungi server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ATS Checker</h1>
        <p className="text-muted-foreground">
          Upload CV (PDF) → dapat skor ATS + checklist + saran.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload CV</CardTitle>
          <CardDescription>
            Format PDF. {profile?.plan === "premium" ? "Unlimited cek." : "Free: 2 cek/minggu."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed p-8 text-center hover:bg-accent/50">
            <Upload className="size-6 text-muted-foreground" />
            <span className="text-sm">
              {file ? file.name : "Klik untuk pilih PDF"}
            </span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="space-y-1">
            <Label>Job description (opsional)</Label>
            <Textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste JD untuk cek keyword match…"
            />
          </div>

          {err && <p className="text-sm text-destructive">{err}</p>}

          <Button onClick={submit} disabled={busy}>
            {busy ? "Menganalisis…" : "Cek Skor ATS"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <ScoreResult
          score={result.score}
          ruleResults={result.ruleResults}
          llmFeedback={result.llmFeedback}
        />
      )}
    </div>
  );
}
