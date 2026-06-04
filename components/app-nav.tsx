"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";
import { signInWithGoogle, signOut } from "@/lib/firebase/auth";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/check", label: "Cek ATS" },
  { href: "/account", label: "Akun" },
];

export function AppNav() {
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();

  return (
    <nav className="flex items-center gap-1">
      {links.map((l) => (
        <Button
          key={l.href}
          variant="ghost"
          size="sm"
          asChild
          className={cn(
            pathname.startsWith(l.href) && "bg-accent text-accent-foreground"
          )}
        >
          <Link href={l.href}>{l.label}</Link>
        </Button>
      ))}

      <div className="ml-2 flex items-center gap-2">
        {loading ? null : user ? (
          <>
            {profile?.plan === "premium" && <Badge>Premium</Badge>}
            <Button size="sm" variant="outline" onClick={() => signOut()}>
              Keluar
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            onClick={() =>
              signInWithGoogle().catch((err) => {
                console.error("Google sign-in failed:", err);
                alert(
                  "Login gagal: " +
                    (err?.code || err?.message || "unknown error")
                );
              })
            }
          >
            Masuk dengan Google
          </Button>
        )}
      </div>
    </nav>
  );
}
