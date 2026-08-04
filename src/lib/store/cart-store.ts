"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import { CartLineItem } from "@/lib/types";

interface CartState {
  items: CartLineItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartLineItem, "id">) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
  hasLicense: (beatId: string, licenseId: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        if (get().hasLicense(item.beatId, item.licenseId)) {
          set({ isOpen: true });
          return;
        }
        set((state) => ({
          items: [...state.items, { ...item, id: nanoid() }],
          isOpen: true,
        }));
      },
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ isOpen: open }),
      hasLicense: (beatId, licenseId) =>
        get().items.some((i) => i.beatId === beatId && i.licenseId === licenseId),
    }),
    {
      name: "lilbeats-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export function useCartCount() {
  return useCartStore((state) => state.items.length);
}

export function useCartTotal() {
  return useCartStore((state) => state.items.reduce((sum, item) => sum + item.price, 0));
}
