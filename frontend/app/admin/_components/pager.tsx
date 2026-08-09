"use client";

export const Pager = ({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (p: number) => void;
}) => {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-end gap-3 text-sm">
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-surface disabled:opacity-40"
      >
        Prev
      </button>
      <span className="text-muted">
        Page {page} of {pages}
      </span>
      <button
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        className="rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-surface disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
};
