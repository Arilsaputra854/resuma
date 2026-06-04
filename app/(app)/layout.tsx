import Link from "next/link";
import { Logo } from "@/components/logo";
import { AuthProvider } from "@/components/auth-provider";
import { AppNav } from "@/components/app-nav";

// App group depends on Firebase client init at runtime — skip static prerender.
export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/dashboard">
              <Logo className="text-lg" />
            </Link>
            <AppNav />
          </div>
        </header>
        <main className="container flex-1 py-8">{children}</main>
      </div>
    </AuthProvider>
  );
}
