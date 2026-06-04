import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Resuma — Bikin CV ATS-friendly, cek skor, langsung apply",
  description:
    "Resume builder + ATS checker. Bikin CV ATS-friendly dari template, cek skor ATS, export PDF clean. Gratis dengan opsi premium.",
  metadataBase: new URL("https://resuma.kodingyuk.id"),
  openGraph: {
    title: "Resuma — Resume Builder + ATS Checker",
    description: "Bikin CV ATS-friendly, cek skor, langsung apply.",
    url: "https://resuma.kodingyuk.id",
    siteName: "Resuma",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
