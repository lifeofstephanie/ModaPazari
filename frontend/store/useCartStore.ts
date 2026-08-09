import { create } from "zustand";
import { cartService, type ServerCart, type ServerCartItem } from "@/services/api";

export type CartItem = {
  cartId: string;
  // Mongo product _id — the canonical reference used at checkout.
  productId: string;
  title: string;
  price: number; // naira, numeric
  imageUrl: string;
  quantity: number;
  color: string;
  size: string;
};

const FALLBACK_IMG = "/images/image.png";

const isAuthed = () =>
  typeof window !== "undefined" && !!localStorage.getItem("token");

const persistGuest = (items: CartItem[]) => {
  if (typeof window !== "undefined")
    localStorage.setItem("myCart", JSON.stringify(items));
};

const mapItem = (it: ServerCartItem): CartItem => {
  const prod = typeof it.product === "string" ? null : it.product;
  return {
    cartId: it._id,
    productId: prod?._id ?? (typeof it.product === "string" ? it.product : ""),
    title: prod?.name ?? "Item",
    price: prod?.price ?? 0,
    imageUrl: prod?.images?.[0] ?? FALLBACK_IMG,
    quantity: it.quantity,
    color: it.color ?? "",
    size: it.size ?? "",
  };
};

type CartState = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  increaseQty: (cartId: string) => void;
  decreaseQty: (cartId: string) => void;
  removeItem: (cartId: string) => void;
  clearCart: () => void;
  loadCart: () => void;
  /** On login, fold the guest cart into the server cart, then hydrate. */
  mergeGuestCartOnLogin: () => Promise<void>;
};

export const useCartStore = create<CartState>((set, get) => {
  const applyServer = (cart: ServerCart) =>
    set({ items: cart.items.map(mapItem) });

  return {
    items: [],

    loadCart: () => {
      if (typeof window === "undefined") return;
      if (isAuthed()) {
        cartService
          .get()
          .then(({ data }) => applyServer(data))
          .catch(() => {});
      } else {
        const stored = localStorage.getItem("myCart");
        set({ items: stored ? JSON.parse(stored) : [] });
      }
    },

    mergeGuestCartOnLogin: async () => {
      if (typeof window === "undefined") return;
      const stored = localStorage.getItem("myCart");
      const guest: CartItem[] = stored ? JSON.parse(stored) : [];
      try {
        if (guest.length > 0) {
          const { data } = await cartService.merge(
            guest.map((i) => ({
              product: i.productId,
              quantity: i.quantity,
              price: i.price,
              color: i.color,
              size: i.size,
            }))
          );
          applyServer(data);
        } else {
          const { data } = await cartService.get();
          applyServer(data);
        }
        // The cart now lives on the server; drop the guest copy.
        localStorage.removeItem("myCart");
      } catch {
        /* keep whatever we have */
      }
    },

    addToCart: (item) => {
      set((state) => {
        const existing = state.items.find(
          (i) =>
            i.productId === item.productId &&
            i.color === item.color &&
            i.size === item.size
        );
        const items = existing
          ? state.items.map((i) =>
              i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
            )
          : [...state.items, item];
        if (!isAuthed()) persistGuest(items);
        return { items };
      });
      if (isAuthed()) {
        cartService
          .add({
            productId: item.productId,
            quantity: item.quantity,
            color: item.color,
            size: item.size,
          })
          .then(({ data }) => applyServer(data))
          .catch(() => get().loadCart());
      }
    },

    increaseQty: (cartId) => {
      const current = get().items.find((i) => i.cartId === cartId);
      const newQty = (current?.quantity ?? 1) + 1;
      set((state) => {
        const items = state.items.map((i) =>
          i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
        );
        if (!isAuthed()) persistGuest(items);
        return { items };
      });
      if (isAuthed())
        cartService
          .updateQty(cartId, newQty)
          .then(({ data }) => applyServer(data))
          .catch(() => get().loadCart());
    },

    decreaseQty: (cartId) => {
      const current = get().items.find((i) => i.cartId === cartId);
      if (!current) return;
      const newQty = current.quantity - 1;
      set((state) => {
        const items =
          newQty <= 0
            ? state.items.filter((i) => i.cartId !== cartId)
            : state.items.map((i) =>
                i.cartId === cartId ? { ...i, quantity: newQty } : i
              );
        if (!isAuthed()) persistGuest(items);
        return { items };
      });
      if (isAuthed()) {
        const req =
          newQty <= 0
            ? cartService.remove(cartId)
            : cartService.updateQty(cartId, newQty);
        req.then(({ data }) => applyServer(data)).catch(() => get().loadCart());
      }
    },

    removeItem: (cartId) => {
      set((state) => {
        const items = state.items.filter((i) => i.cartId !== cartId);
        if (!isAuthed()) persistGuest(items);
        return { items };
      });
      if (isAuthed())
        cartService
          .remove(cartId)
          .then(({ data }) => applyServer(data))
          .catch(() => get().loadCart());
    },

    clearCart: () => {
      set({ items: [] });
      if (typeof window !== "undefined") localStorage.removeItem("myCart");
      if (isAuthed()) cartService.clear().catch(() => {});
    },
  };
});
