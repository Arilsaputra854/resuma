"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Lightbulb } from "lucide-react";
import type { AtsRuleResult, AtsLlmFeedback } from "@/types";

interface Props {
  score: number;
  ruleResults: AtsRuleResult[];
  llmFeedback?: AtsLlmFeedback | null;
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-amber-500";
  return "text-destructive";
}

export function ScoreResult({ score, ruleResults, llmFeedback }: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-8">
          <span className="text-sm text-muted-foreground">Skor ATS</span>
          <span className={`text-6xl font-bold ${scoreColor(score)}`}>
            {score}
          </span>
          <div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${score}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ruleResults.map((r) => (
            <div key={r.id} className="flex items-start gap-2">
              {r.passed ? (
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              ) : (
                <X className="mt-0.5 size-4 shrink-0 text-destructive" />
              )}
              <div>
                <p className={r.passed ? "" : "font-medium"}>{r.label}</p>
                {r.detail && (
                  <p className="text-xs text-muted-foreground">{r.detail}</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {llmFeedback && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="size-4 text-primary" /> Feedback AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {llmFeedback.jdRelevance != null && (
              <Badge>Relevansi JD: {llmFeedback.jdRelevance}%</Badge>
            )}
            {llmFeedback.strengths.length > 0 && (
              <div>
                <p className="font-semibold text-emerald-600">Kekuatan</p>
                <ul className="ml-4 list-disc">
                  {llmFeedback.strengths.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            )}
            {llmFeedback.weaknesses.length > 0 && (
              <div>
                <p className="font-semibold text-amber-600">Kelemahan</p>
                <ul className="ml-4 list-disc">
                  {llmFeedback.weaknesses.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            )}
            {llmFeedback.suggestions.length > 0 && (
              <div>
                <p className="font-semibold">Saran perbaikan</p>
                <ul className="ml-4 list-disc">
                  {llmFeedback.suggestions.map((sg, i) => (
                    <li key={i}>
                      <span className="font-medium">{sg.section}:</span>{" "}
                      {sg.advice}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
