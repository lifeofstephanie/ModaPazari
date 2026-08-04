"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";

const info = [
  { icon: Mail, label: "Email", value: "hi@modapazari.com" },
  { icon: Phone, label: "Phone", value: "+234 801 234 5678" },
  { icon: MapPin, label: "Office", value: "Lagos, Nigeria" },
  { icon: Clock, label: "Hours", value: "Mon–Sat, 9am – 6pm" },
];

export default function ContactPage() {
  return (
    <main className="bg-surface pt-28 pb-20">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        {/* Intro */}
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs font-medium tracking-wide text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Get in touch
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
            We&apos;d love to hear from you
          </h1>
          <p className="mt-4 text-muted">
            Questions, feedback or partnership ideas — our friendly team usually
            replies within one business day.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr]">
          {/* Left: info + image */}
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              {info.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-accent-soft text-accent">
                    <item.icon size={18} />
                  </div>
                  <p className="mt-4 text-sm font-medium">{item.label}</p>
                  <p className="mt-1 text-sm text-muted">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="relative hidden overflow-hidden rounded-2xl border border-border sm:block">
              <img
                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1000&q=80"
                alt="Our store"
                className="h-56 w-full object-cover"
              />
            </div>
          </div>

          {/* Right: form */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-xl font-semibold">Send us a message</h2>
            <p className="mt-1 text-sm text-muted">
              Fill in the form and we&apos;ll be in touch shortly.
            </p>

            <form className="mt-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="First name">
                  <input className="input" placeholder="First name" />
                </Field>
                <Field label="Last name">
                  <input className="input" placeholder="Last name" />
                </Field>
              </div>
              <Field label="Email">
                <input type="email" className="input" placeholder="you@company.com" />
              </Field>
              <Field label="Phone number">
                <input className="input" placeholder="+234 123 456 7890" />
              </Field>
              <Field label="Message">
                <textarea
                  className="input h-28 resize-none py-2"
                  placeholder="Leave us a message..."
                />
              </Field>

              <label className="flex items-center gap-2 text-xs text-muted md:text-sm">
                <input type="checkbox" className="accent-[var(--accent-solid)]" />
                I agree to the friendly privacy policy.
              </label>

              <button
                type="submit"
                className="mt-1 rounded-lg bg-accent-solid py-3 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
              >
                Send message
              </button>
            </form>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          height: 2.75rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border);
          background: var(--background);
          padding: 0 0.85rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        textarea.input {
          height: auto;
        }
        .input::placeholder {
          color: var(--muted);
          opacity: 0.7;
        }
        .input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--ring);
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
