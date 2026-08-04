import Link from "next/link";
import type { ReactNode } from "react";

export type LegalSection = {
  heading: string;
  body: ReactNode[];
};

type LegalShellProps = {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
};

const LEGAL_PAGES = [
  { name: "Terms & Conditions", href: "/terms" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Refund Policy", href: "/refund" },
];

export const LegalShell = ({
  eyebrow,
  title,
  intro,
  updated,
  sections,
}: LegalShellProps) => {
  return (
    <div className="min-h-screen bg-surface px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="border-b border-border pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">{intro}</p>
          <p className="mt-4 text-xs text-muted">Last updated: {updated}</p>
        </header>

        {/* Cross-links */}
        <nav className="mt-6 flex flex-wrap gap-2">
          {LEGAL_PAGES.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {p.name}
            </Link>
          ))}
        </nav>

        {/* Body */}
        <article className="mt-10 space-y-10">
          {sections.map((section, i) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold">
                <span className="mr-2 text-accent">{i + 1}.</span>
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
                {section.body.map((node, j) => (
                  <div key={j}>{node}</div>
                ))}
              </div>
            </section>
          ))}
        </article>

        <footer className="mt-14 border-t border-border pt-6 text-xs text-muted">
          <p>
            Questions about this policy? Contact us at{" "}
            <a
              href="mailto:support@modapazari.com"
              className="font-medium text-accent hover:underline"
            >
              support@modapazari.com
            </a>
            .
          </p>
        </footer>
      </div>
    </div>
  );
};
