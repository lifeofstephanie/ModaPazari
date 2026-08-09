"use client";

import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminService, type AdminUser } from "@/services/api";
import { Pager } from "../_components/pager";

const ROLE_STYLES: Record<AdminUser["role"], string> = {
  admin: "bg-accent-soft text-accent",
  vendor: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  buyer: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await adminService.getUsers(page);
      setUsers(data.items);
      setPages(data.pages);
    } catch {
      /* interceptor toasts */
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (u: AdminUser) => {
    if (!window.confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    try {
      await adminService.deleteUser(u._id);
      setUsers((list) => list.filter((x) => x._id !== u._id));
      toast.success("User deleted");
    } catch {
      /* interceptor toasts */
    }
  };

  const rows = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      [u.firstName, u.lastName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          People
        </p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Users</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {loading ? "Loading…" : `${rows.length} users`}
          </p>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent"
          />
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-muted">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-3 pr-4 font-medium">Name</th>
                  <th className="py-3 pr-4 font-medium">Email</th>
                  <th className="py-3 pr-4 font-medium">Role</th>
                  <th className="py-3 pr-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-border/60 last:border-b-0"
                  >
                    <td className="py-3 pr-4 font-medium">
                      {[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="py-3 pr-4 text-muted">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ROLE_STYLES[u.role]}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {u.role !== "admin" ? (
                        <button
                          onClick={() => remove(u)}
                          aria-label="Delete user"
                          className="rounded-md p-1.5 text-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-sm text-muted">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={page} pages={pages} onPage={setPage} />
      </div>
    </div>
  );
}
