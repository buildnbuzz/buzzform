"use client";

import { useBuilderStore } from "../lib/store";

export function useDropIndicatorIndex(
  parentId: string | null,
  parentSlot: string | null = null,
) {
  return useBuilderStore((state) =>
    state.dropIndicator?.parentId === parentId &&
    (state.dropIndicator?.parentSlot ?? null) === (parentSlot ?? null)
      ? state.dropIndicator.index
      : null,
  );
}
