"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { PRICING, FREE_WEEKLY_QUOTA, type BillingPeriod } from "@/types";

const idr = (n: number) => "Rp" + n.toLocaleString("id-ID");

export default function AccountPage() {
  const { user, profile, loading } = useAuth();
  function upgrade(period: BillingPeriod) {
    if (!user) return;
    const label = period === "monthly" ? "Bulanan" : "Tahunan";
    const msg = encodeURIComponent(
      `Halo, saya ingin upgrade ke Premium ${label} (${idr(PRICING[period])}).\nEmail: ${user.email}`
    );
    window.open(`https://wa.me/6287720567539?text=${msg}`, "_blank");
  }

  if (loading) return <p className="text-muted-foreground">Memuat…</p>;
  if (!user) return <p className="text-muted-foreground">Masuk dulu.</p>;

  const isPremium = profile?.plan === "premium";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Akun</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {profile?.name ?? user.displayName}
            {isPremium && <Badge>Premium</Badge>}
          </CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium">{profile?.plan ?? "free"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cek minggu ini</span>
            <span className="font-medium">
              {profile?.quotaChecksToday ?? 0}
              {isPremium ? " (unlimited)" : ` / ${FREE_WEEKLY_QUOTA}`}
            </span>
          </div>
          {profile?.planExpiry && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Aktif sampai</span>
              <span className="font-medium">
                {new Date(profile.planExpiry).toLocaleDateString("id-ID")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {!isPremium && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Upgrade ke Premium</CardTitle>
            <CardDescription>
              No iklan, no watermark, unlimited cek, semua template, AI assist.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="h-auto flex-col items-start py-3"
              onClick={() => upgrade("monthly")}
            >
              <span className="font-semibold">Bulanan</span>
              <span className="text-xs opacity-90">{idr(PRICING.monthly)} / bulan</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-start py-3"
              onClick={() => upgrade("yearly")}
            >
              <span className="font-semibold">Tahunan (hemat 10%)</span>
              <span className="text-xs opacity-90">
                {idr(PRICING.yearly)} / tahun
              </span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
