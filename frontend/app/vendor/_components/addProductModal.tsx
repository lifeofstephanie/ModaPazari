"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  vendorService,
  DEPARTMENTS,
  SEASONS,
  type Department,
  type Season,
} from "@/services/api";
import { isUploadConfigured, uploadToCloudinary } from "@/services/upload";

export type SizeVariant = { size: string; stock: number };

export type ProductFormValues = {
  name: string;
  description: string;
  price: number;
  stock: number;
  department: Department;
  season: Season;
  images: string[];
  colors: string[];
  variants: SizeVariant[];
};

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Common apparel sizes offered in the dropdown; "Custom…" allows anything else
// (numeric shoe/waist sizes, one-size, etc.).
const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

type AddProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Prefilled values (edit mode). */
  initial?: Partial<FormState> & {
    images?: string[];
    colors?: string[];
    variants?: SizeVariant[];
  };
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
  department: Department;
  season: Season;
};

const EMPTY: FormState = {
  name: "",
  description: "",
  price: "",
  stock: "",
  department: "other",
  season: "none",
};

export const AddProductModal = ({
  isOpen,
  onClose,
  initial,
  heading = "Add product",
  submitText = "Add product",
  onSave,
}: AddProductModalProps) => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [images, setImages] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState("");
  const [variants, setVariants] = useState<SizeVariant[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [sizeStock, setSizeStock] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset / prefill whenever the modal is opened.
  useEffect(() => {
    if (isOpen) {
      const {
        images: initialImages,
        colors: initialColors,
        variants: initialVariants,
        ...rest
      } = initial ?? {};
      setForm({ ...EMPTY, ...rest });
      setImages(initialImages ?? []);
      setColors(initialColors ?? []);
      setVariants(initialVariants ?? []);
      setColorInput("");
      setSizeInput("");
      setCustomSize("");
      setSizeStock("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const hasSizes = variants.length > 0;
  const sizeTotal = variants.reduce((s, v) => s + v.stock, 0);

  const addVariant = () => {
    // "__custom" reveals a free-text field; otherwise use the picked size.
    const size = (sizeInput === "__custom" ? customSize : sizeInput).trim();
    const stock = Math.max(0, Math.floor(Number(sizeStock) || 0));
    if (!size) return;
    setVariants((prev) =>
      prev.some((v) => v.size.toLowerCase() === size.toLowerCase())
        ? prev
        : [...prev, { size, stock }]
    );
    setSizeInput("");
    setCustomSize("");
    setSizeStock("");
  };

  const removeVariant = (size: string) =>
    setVariants((prev) => prev.filter((v) => v.size !== size));

  if (!isOpen) return null;

  const set = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!isUploadConfigured) {
      toast.error("Image upload isn't configured yet");
      return;
    }
    try {
      setUploading(true);
      const urls = await Promise.all(
        Array.from(files).map((f) => uploadToCloudinary(f))
      );
      setImages((prev) => [...prev, ...urls]);
    } catch {
      toast.error("Some images failed to upload");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) =>
    setImages((prev) => prev.filter((u) => u !== url));

  const addColor = () => {
    const c = colorInput.trim();
    if (!c) return;
    setColors((prev) => (prev.includes(c) ? prev : [...prev, c]));
    setColorInput("");
  };

  const removeColor = (c: string) =>
    setColors((prev) => prev.filter((x) => x !== c));

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
      stock: hasSizes ? sizeTotal : stock,
      department: form.department,
      season: form.department === "clothes" ? form.season : "none",
      images,
      colors,
      variants,
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
          images: values.images,
          colors: values.colors,
          variants: values.variants,
          department: values.department,
          season: values.season,
        });
        toast.success("Product submitted for review");
      }
      setForm(EMPTY);
      setImages([]);
      setColors([]);
      setVariants([]);
      onClose();
    } catch {
      // api interceptor already surfaces the error toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-center overflow-y-auto p-4">
      <div
        className="fixed inset-0 bg-foreground/50"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative my-auto w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
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
                value={hasSizes ? sizeTotal : form.stock}
                onChange={(e) => set("stock", e.target.value)}
                placeholder="0"
                disabled={hasSizes}
                className="modal-input disabled:opacity-60"
              />
              {hasSizes && (
                <span className="text-xs text-muted">Managed by sizes below</span>
              )}
            </Field>
          </div>

          <Field label="Sizes & stock (optional)" htmlFor="p-size">
            <p className="mb-2 text-xs text-muted">
              Add sizes if this product is sold per size — stock is then tracked
              per size. Leave empty to use the single stock above.
            </p>
            <div className="flex flex-wrap gap-2">
              <select
                id="p-size"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                className="modal-input flex-1"
              >
                <option value="">Select size…</option>
                {COMMON_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value="__custom">Custom…</option>
              </select>

              {sizeInput === "__custom" && (
                <input
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addVariant();
                    }
                  }}
                  placeholder="e.g. 42, One size"
                  className="modal-input flex-1"
                />
              )}

              <input
                value={sizeStock}
                onChange={(e) => setSizeStock(e.target.value)}
                type="number"
                min={0}
                placeholder="Qty"
                className="modal-input w-24"
              />
              <button
                type="button"
                onClick={addVariant}
                className="rounded-md border border-border px-3 text-sm transition-colors hover:bg-surface"
              >
                Add
              </button>
            </div>
            {hasSizes && (
              <div className="mt-2 flex flex-wrap gap-2">
                {variants.map((v) => (
                  <span
                    key={v.size}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border py-1 pl-3 pr-2 text-xs"
                  >
                    <span className="font-medium">{v.size}</span>
                    <span className="text-muted">· {v.stock}</span>
                    <button
                      type="button"
                      onClick={() => removeVariant(v.size)}
                      aria-label={`Remove ${v.size}`}
                      className="text-muted hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Department" htmlFor="p-dept">
              <select
                id="p-dept"
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
                className="modal-input"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {titleCase(d)}
                  </option>
                ))}
              </select>
            </Field>

            {/* Season only matters for clothes. */}
            {form.department === "clothes" && (
              <Field label="Season" htmlFor="p-season">
                <select
                  id="p-season"
                  value={form.season}
                  onChange={(e) => set("season", e.target.value)}
                  className="modal-input"
                >
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>
                      {s === "none" ? "None / all-season" : titleCase(s)}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </div>

          <Field label="Available colours (optional)" htmlFor="p-color">
            <div className="flex gap-2">
              <input
                id="p-color"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addColor();
                  }
                }}
                placeholder="e.g. Black, Beige, #7a2048"
                className="modal-input flex-1"
              />
              <button
                type="button"
                onClick={addColor}
                className="rounded-md border border-border px-3 text-sm transition-colors hover:bg-surface"
              >
                Add
              </button>
            </div>
            {colors.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {colors.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border py-1 pl-1.5 pr-2 text-xs"
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-border"
                      style={{ backgroundColor: c }}
                    />
                    {c}
                    <button
                      type="button"
                      onClick={() => removeColor(c)}
                      aria-label={`Remove ${c}`}
                      className="text-muted hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          <Field label="Images" htmlFor="p-images">
            <div className="flex flex-wrap gap-3">
              {images.map((url) => (
                <div
                  key={url}
                  className="relative h-20 w-20 overflow-hidden rounded-md border border-border"
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    aria-label="Remove image"
                    className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-foreground/70 text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {isUploadConfigured ? (
                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-muted transition-colors hover:border-accent hover:text-accent">
                  {uploading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <ImagePlus size={18} />
                      <span className="text-[10px]">Upload</span>
                    </>
                  )}
                  <input
                    id="p-images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      handleFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              ) : (
                <p className="text-xs text-muted">
                  Image upload isn&apos;t configured yet.
                </p>
              )}
            </div>
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
              disabled={submitting || uploading}
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
