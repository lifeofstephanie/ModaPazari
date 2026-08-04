import { create } from "zustand";

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

type CartState = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  increaseQty: (cartId: string) => void;
  decreaseQty: (cartId: string) => void;
  removeItem: (cartId: string) => void;
  clearCart: () => void;
  loadCart: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],

  loadCart: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("myCart");
    set({ items: stored ? JSON.parse(stored) : [] });
  },

  addToCart: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.cartId === item.cartId);
      let newItems;
      if (existing) {
        newItems = state.items.map((i) =>
          i.cartId === item.cartId ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newItems = [...state.items, item];
      }
      localStorage.setItem("myCart", JSON.stringify(newItems));
      return { items: newItems };
    }),

  increaseQty: (cartId) =>
    set((state) => {
      const newItems = state.items.map((i) =>
        i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
      );
      localStorage.setItem("myCart", JSON.stringify(newItems));
      return { items: newItems };
    }),

  decreaseQty: (cartId) =>
    set((state) => {
      const item = state.items.find((i) => i.cartId === cartId);
      if (!item) return {};
      let newItems;
      if (item.quantity === 1) {
        newItems = state.items.filter((i) => i.cartId !== cartId);
      } else {
        newItems = state.items.map((i) =>
          i.cartId === cartId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      localStorage.setItem("myCart", JSON.stringify(newItems));
      return { items: newItems };
    }),

  removeItem: (cartId) =>
    set((state) => {
      const newItems = state.items.filter((i) => i.cartId !== cartId);
      localStorage.setItem("myCart", JSON.stringify(newItems));
      return { items: newItems };
    }),

  clearCart: () => {
    localStorage.removeItem("myCart");
    set({ items: [] });
  },
}));
