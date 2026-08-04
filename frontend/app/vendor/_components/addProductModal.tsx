"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { vendorService } from "@/services/api";

export type ProductFormValues = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
};

type AddProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Prefilled values (edit mode). */
  initial?: Partial<FormState>;
  heading?: string;
  submitText?: string;
  /**
   * If provided, handles persistence instead of the default create-via-API.
   * Used for local edit so mock rows don't hit the backend with fake ids.
   */
  onSave?: (values: ProductFormValues) => Promise<void> | void;
};

type FormState = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
};

const EMPTY: FormState = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
};

const CATEGORIES = ["Womenswear", "Menswear", "Accessories", "Footwear", "Outerwear"];

export const AddProductModal = ({
  isOpen,
  onClose,
  initial,
  heading = "Add product",
  submitText = "Add product",
  onSave,
}: AddProductModalProps) => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  // Reset / prefill whenever the modal is opened.
  useEffect(() => {
    if (isOpen) setForm({ ...EMPTY, ...initial });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.name.trim() || !form.description.trim()) {
      toast.error("Name and description are required");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Enter a valid price");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      toast.error("Enter a valid stock quantity");
      return;
    }

    const values: ProductFormValues = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      stock,
      category: form.category,
    };

    try {
      setSubmitting(true);
      if (onSave) {
        await onSave(values);
      } else {
        await vendorService.createProduct({
          name: values.name,
          description: values.description,
          price: values.price,
          stock: values.stock,
        });
        toast.success("Product submitted for review");
      }
      setForm(EMPTY);
      onClose();
    } catch {
      // api interceptor already surfaces the error toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/50"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{heading}</h2>
            <p className="text-sm text-muted">
              New listings are reviewed before going live.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Product name" htmlFor="p-name">
            <input
              id="p-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Silk Wrap Midi Dress"
              className="modal-input"
            />
          </Field>

          <Field label="Description" htmlFor="p-desc">
            <textarea
              id="p-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Fabric, fit, sizing…"
              rows={3}
              className="modal-input resize-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (₦)" htmlFor="p-price">
              <input
                id="p-price"
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="0"
                className="modal-input"
              />
            </Field>
            <Field label="Stock" htmlFor="p-stock">
              <input
                id="p-stock"
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
                placeholder="0"
                className="modal-input"
              />
            </Field>
          </div>

          <Field label="Category" htmlFor="p-cat">
            <select
              id="p-cat"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="modal-input"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-accent-solid px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
            >
              {submitting ? "Saving…" : submitText}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .modal-input {
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
        .modal-input::placeholder {
          color: var(--muted);
          opacity: 0.7;
        }
        .modal-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--ring);
        }
      `}</style>
    </div>
  );
};

const Field = ({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={htmlFor} className="text-sm font-medium">
      {label}
    </label>
    {children}
  </div>
);
