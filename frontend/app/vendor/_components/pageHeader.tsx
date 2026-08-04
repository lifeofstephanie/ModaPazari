import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export const PageHeader = ({
  eyebrow,
  title,
  subtitle,
  action,
}: PageHeaderProps) => (
  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        {eyebrow}
      </p>
      <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
