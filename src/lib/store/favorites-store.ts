"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  ids: string[];
  toggle: (beatId: string) => void;
  isFavorite: (beatId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (beatId) =>
        set((state) => ({
          ids: state.ids.includes(beatId)
            ? state.ids.filter((id) => id !== beatId)
            : [...state.ids, beatId],
        })),
      isFavorite: (beatId) => get().ids.includes(beatId),
    }),
    { name: "lilbeats-favorites" }
  )
);
