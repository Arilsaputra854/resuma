import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <Logo className="text-lg" />
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/pricing">Harga</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Masuk</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Mulai Gratis</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} Resuma · kodingyuk.id</p>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:text-foreground">
              Harga
            </Link>
            <Link href="/dashboard" className="hover:text-foreground">
              App
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
