"use client";

import { useEffect, useState } from "react";
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
import { Plus, FileText, Gauge } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { listResumes } from "@/lib/firebase/firestore";
import type { Resume } from "@/types";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    listResumes(user.uid)
      .then(setResumes)
      .catch(() => setResumes([]))
      .finally(() => setFetching(false));
  }, [user]);

  if (loading) return <p className="text-muted-foreground">Memuat…</p>;

  if (!user) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Masuk dulu</CardTitle>
          <CardDescription>
            Login untuk bikin & simpan CV kamu.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Pakai tombol “Masuk dengan Google” di pojok kanan atas.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">CV kamu, semua di sini.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/check">
              <Gauge /> Cek ATS
            </Link>
          </Button>
          <Button asChild>
            <Link href="/builder/new">
              <Plus /> CV Baru
            </Link>
          </Button>
        </div>
      </div>

      {fetching ? (
        <p className="text-muted-foreground">Memuat CV…</p>
      ) : resumes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <FileText className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">Belum ada CV. Bikin yang pertama.</p>
            <Button asChild>
              <Link href="/builder/new">
                <Plus /> Bikin CV
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle className="text-lg">{r.title}</CardTitle>
                <CardDescription>Template: {r.template}</CardDescription>
              </CardHeader>
              <CardFooter className="gap-2">
                <Button size="sm" asChild>
                  <Link href={`/builder/${r.id}`}>Edit</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/check?resume=${r.id}`}>Cek ATS</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
