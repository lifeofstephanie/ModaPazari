"use client";

import { Camera, Info, KeyRound, Mail, User2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { PayoutAccount } from "../_components/payoutAccount";

type Toggles = {
  notifications: boolean;
  push: boolean;
  messages: boolean;
  twoFactor: boolean;
};

export default function SettingsPage() {
  // Each switch owns its own state — previously one shared flag moved them all.
  const [toggles, setToggles] = useState<Toggles>({
    notifications: true,
    push: false,
    messages: true,
    twoFactor: false,
  });

  const flip = (key: keyof Toggles) =>
    setToggles((t) => ({ ...t, [key]: !t[key] }));

  const confirmDelete = () => {
    if (window.confirm("Delete your account? This cannot be undone.")) {
      toast.success("Account deletion requested");
    }
  };

  return (
    <div className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Account
        </p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Settings</h1>
      </div>

      <div className="mb-6">
        <PayoutAccount />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile */}
        <section className="rounded-xl border border-border bg-card">
          <h2 className="border-b border-border px-6 py-4 text-sm font-semibold">
            Profile
          </h2>
          <div className="space-y-5 p-6">
            <div className="flex flex-col items-center gap-2">
              <div className="relative grid h-20 w-20 place-items-center rounded-full bg-surface-2 text-muted">
                <User2 size={30} />
                <button
                  aria-label="Change photo"
                  onClick={() => toast("Photo upload coming soon")}
                  className="absolute -right-1 top-0 grid h-6 w-6 place-items-center rounded-full border border-border bg-card text-accent"
                >
                  <Camera size={14} />
                </button>
              </div>
              <button
                onClick={() => toast.success("Photo removed")}
                className="text-sm font-medium text-red-500"
              >
                Remove photo
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FieldInput label="First name" placeholder="Stephanie" />
              <FieldInput label="Last name" placeholder="Anyanwu" />
            </div>
            <FieldInput label="Business name" placeholder="Moda Studio" />
            <FieldInput
              label="Phone number"
              placeholder="+234 800 000 0000"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Email</label>
              <div className="flex items-center gap-2">
                <input
                  disabled
                  value="stephanie@example.com"
                  className="settings-input flex-1 cursor-not-allowed opacity-70"
                />
                <button
                  onClick={() => toast("Email change link sent")}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-surface"
                >
                  <Mail size={15} />
                  Change
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications + Account */}
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card">
            <h2 className="border-b border-border px-6 py-4 text-sm font-semibold">
              Notifications
            </h2>
            <div className="divide-y divide-border">
              <ToggleRow
                title="Notification channels"
                subtitle="Email & SMS"
                withInfo
                on={toggles.notifications}
                onToggle={() => flip("notifications")}
              />
              <ToggleRow
                title="Push notifications"
                on={toggles.push}
                onToggle={() => flip("push")}
              />
              <ToggleRow
                title="Messages"
                on={toggles.messages}
                onToggle={() => flip("messages")}
              />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card">
            <h2 className="border-b border-border px-6 py-4 text-sm font-semibold">
              Account
            </h2>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between px-6 py-4">
                <p className="text-sm font-medium">Password</p>
                <button
                  onClick={() => toast("Password reset link sent")}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface"
                >
                  <KeyRound size={15} />
                  Change password
                </button>
              </div>
              <ToggleRow
                title="Two-factor authentication"
                withInfo
                on={toggles.twoFactor}
                onToggle={() => flip("twoFactor")}
              />
              <div className="flex items-center justify-between px-6 py-4">
                <p className="text-sm font-medium">Danger zone</p>
                <button
                  onClick={confirmDelete}
                  className="text-sm font-medium text-red-500"
                >
                  Delete account
                </button>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-6">
            <div>
              <p className="text-sm font-semibold">Apply new settings</p>
              <p className="mt-1 text-xs text-muted">
                Review your information before submitting.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toast("Changes discarded")}
                className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-surface"
              >
                Cancel
              </button>
              <button
                onClick={() => toast.success("Settings saved")}
                className="rounded-md bg-accent-solid px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .settings-input {
          height: 2.5rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border);
          background: var(--background);
          padding: 0 0.75rem;
          font-size: 0.875rem;
          color: var(--foreground);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .settings-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--ring);
        }
      `}</style>
    </div>
  );
}

const FieldInput = ({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">{label}</label>
    <input placeholder={placeholder} className="settings-input" />
  </div>
);

const ToggleRow = ({
  title,
  subtitle,
  withInfo,
  on,
  onToggle,
}: {
  title: string;
  subtitle?: string;
  withInfo?: boolean;
  on: boolean;
  onToggle: () => void;
}) => (
  <div className="flex items-center justify-between px-6 py-4">
    <div>
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-medium">{title}</p>
        {withInfo && <Info size={14} className="text-muted" />}
      </div>
      {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
    </div>
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
        on ? "bg-accent-solid" : "bg-border"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);
