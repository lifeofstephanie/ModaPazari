"use client";

import { Camera, Loader2, MapPin } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authService, type UserAddress } from "@/services/api";
import { isUploadConfigured, uploadToCloudinary } from "@/services/upload";
import { useAuthStore } from "@/store/useAuthStore";

const EMPTY_ADDR: UserAddress = {
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "Nigeria",
  postalCode: "",
};

export default function GeneralPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [address, setAddress] = useState<UserAddress>(EMPTY_ADDR);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await authService.getMe();
      setFirstName(data.firstName ?? "");
      setLastName(data.lastName ?? "");
      setEmail(data.email ?? "");
      setAvatar(data.avatar ?? "");
      setAddress({ ...EMPTY_ADDR, ...(data.address ?? {}) });
    } catch {
      /* interceptor toasts */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onAvatar = async (file?: File) => {
    if (!file) return;
    if (!isUploadConfigured) {
      toast.error("Image upload isn't configured yet");
      return;
    }
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setAvatar(url);
    } catch {
      toast.error("Couldn't upload photo");
    } finally {
      setUploading(false);
    }
  };

  const setAddr = (k: keyof UserAddress, v: string) =>
    setAddress((a) => ({ ...a, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      return toast.error("First and last name are required");
    }
    try {
      setSaving(true);
      const { data } = await authService.updateMe({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        avatar,
        address,
      });
      if (user)
        setUser({
          ...user,
          firstName: data.firstName,
          lastName: data.lastName,
          avatar: data.avatar,
        });
      toast.success("Profile updated");
    } catch {
      /* interceptor toasts */
    } finally {
      setSaving(false);
    }
  };

  const initials =
    `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "U";

  if (loading) {
    return <div className="h-96 animate-pulse rounded-2xl border border-border bg-card" />;
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {/* Identity */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-5 text-base font-semibold">General</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-accent-soft text-xl font-semibold text-accent">
              {avatar ? (
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-border bg-card text-muted shadow transition-colors hover:text-accent">
              {uploading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Camera size={15} />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => onAvatar(e.target.files?.[0])}
              />
            </label>
          </div>
          <div>
            <p className="font-medium">
              {firstName} {lastName}
            </p>
            <p className="text-sm text-muted">{email}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="First name">
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="p-input"
            />
          </Field>
          <Field label="Last name">
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="p-input"
            />
          </Field>
          <Field label="Email">
            <input value={email} disabled className="p-input opacity-60" />
          </Field>
        </div>
      </section>

      {/* Address */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-accent" />
          <h2 className="text-base font-semibold">Default delivery address</h2>
        </div>
        <p className="mb-4 text-sm text-muted">
          We&apos;ll pre-fill this at checkout so you don&apos;t have to retype it.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone">
            <input
              value={address.phone ?? ""}
              onChange={(e) => setAddr("phone", e.target.value)}
              className="p-input"
            />
          </Field>
          <Field label="Address line 1">
            <input
              value={address.addressLine1 ?? ""}
              onChange={(e) => setAddr("addressLine1", e.target.value)}
              className="p-input"
            />
          </Field>
          <Field label="Address line 2 (optional)">
            <input
              value={address.addressLine2 ?? ""}
              onChange={(e) => setAddr("addressLine2", e.target.value)}
              className="p-input"
            />
          </Field>
          <Field label="City">
            <input
              value={address.city ?? ""}
              onChange={(e) => setAddr("city", e.target.value)}
              className="p-input"
            />
          </Field>
          <Field label="State">
            <input
              value={address.state ?? ""}
              onChange={(e) => setAddr("state", e.target.value)}
              className="p-input"
            />
          </Field>
          <Field label="Country">
            <input
              value={address.country ?? ""}
              onChange={(e) => setAddr("country", e.target.value)}
              className="p-input"
            />
          </Field>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-full bg-accent-solid px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <style jsx global>{`
        .p-input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--border);
          background: var(--background);
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
          color: var(--foreground);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .p-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--ring);
        }
      `}</style>
    </form>
  );
}

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-sm font-medium">{label}</span>
    {children}
  </label>
);
