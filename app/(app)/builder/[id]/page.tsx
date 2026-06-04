"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { BuilderForm } from "@/components/builder/builder-form";
import { getResume } from "@/lib/firebase/firestore";
import { newResume, uid as genId } from "@/lib/resume/defaults";
import type { Resume } from "@/types";

export default function BuilderPage() {
  const params = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (params.id === "new" && !user) return; // wait for auth before creating
    const ownerId = user?.uid ?? "anon";

    if (params.id === "new") {
      setResume(newResume(ownerId, genId()));
      setReady(true);
      return;
    }

    // Existing resume — load from Firestore, fall back to a fresh draft.
    getResume(params.id)
      .then((r) => setResume(r ?? newResume(ownerId, params.id)))
      .catch(() => setResume(newResume(ownerId, params.id)))
      .finally(() => setReady(true));
  }, [params.id, user, loading]);

  if (!ready || !resume) {
    return <p className="text-muted-foreground">Memuat builder…</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Resume Builder</h1>
      <BuilderForm initial={resume} />
    </div>
  );
}
