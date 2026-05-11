import { useEffect } from "react";
import { setupBuilderAutoSave } from "@buildnbuzz/form-builder-core";
import type {
  BuilderStorageProvider,
  Store,
} from "@buildnbuzz/form-builder-core";
import { useBuilderContext } from "../context/builder-context";
import type { StoreApi } from "zustand";

/**
 * Hook to automatically save the builder document to a persistence provider.
 * Integrates the core auto-save logic into the React component lifecycle.
 */
export function useAutoSave(provider: BuilderStorageProvider | null) {
  const { store } = useBuilderContext();

  useEffect(() => {
    if (!provider) return;

    // The cast is required because `useBoundStore` adds React hook methods
    // that `setupBuilderAutoSave` doesn't know or care about.
    const unsubscribe = setupBuilderAutoSave(
      store as unknown as StoreApi<Store>,
      provider,
    );

    return () => {
      unsubscribe();
    };
  }, [store, provider]);
}
