import { useStore } from "zustand";
import { useBuilderContext } from "../context/BuilderContext";

/**
 * Hook to retrieve the active drop indicator index for a specific container.
 * 
 * @param parentId The ID of the container, or null for root
 * @param parentSlot The named slot inside the container, or null
 * @returns The index to render the drop indicator at, or null if no drop is targeting this container
 */
export function useDropIndicator(
  parentId: string | null,
  parentSlot: string | null = null
): number | null {
  const { store } = useBuilderContext();

  return useStore(store, (state) => {
    const indicator = state.dropIndicator;

    if (
      indicator &&
      indicator.parentId === parentId &&
      indicator.parentSlot === parentSlot
    ) {
      return indicator.index;
    }

    return null;
  });
}
