import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { DevUserSwitcher } from "@/components/DevUserSwitcher";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "POL: Know your leaders", template: "%s · POL" },
  description: "A fact-based public scorecard for every elected office in Nigeria, from ward councillor to President.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="top">
          <div className="wrap">
            <Link href="/" className="brand">
              POL
            </Link>
            <nav className="main">
              <Link href="/">My Leaders</Link>
              <Link href="/feed">Feed</Link>
              <Link href="/rankings">Rankings</Link>
              <Link href="/compare">Compare</Link>
              <Link href="/methodology">Method</Link>
              <Link href="/editor">Editor</Link>
            </nav>
            <DevUserSwitcher />
          </div>
        </header>
        <main className="wrap">
          <div className="banner">
            <strong>Test build.</strong> Every person, party, LGA, project and story here is fictional sample data.
          </div>
          {children}
        </main>
        <footer className="bottom">
          <div className="wrap">
            POL is non-partisan. Performance Scores come from checkable facts; Citizen Approval is the opinion of POL users and
            is not a poll. <Link href="/methodology">How scores work</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
