import { useMemo, useState, useEffect } from "react";
import type { ExpressionGroup } from "@buildnbuzz/form-builder-core";
import {
  createExpressionStore,
  type ExpressionStoreState,
} from "../state/expression-store";
import type { StoreApi } from "zustand";

export interface UseExpressionStoreReturn {
  /** The scoped Zustand store instance. */
  store: StoreApi<ExpressionStoreState>;
  /** Reactive snapshot of the root group, kept in sync via subscription. */
  rootGroup: ExpressionGroup;
}

/**
 * Creates and manages a scoped expression builder store.
 *
 * - Recreates the store whenever `open` or `initialValue` changes.
 * - Subscribes to store updates and keeps `rootGroup` in sync with React state.
 *
 * @param initialValue - Optional initial expression group state.
 * @param open - Whether the expression builder dialog is open. Used to trigger store recreation.
 */
export function useExpressionStore(
  initialValue?: ExpressionGroup,
  open?: boolean,
): UseExpressionStoreReturn {
  const store = useMemo(() => {
    void open; // trigger re-creation when dialog opens
    return createExpressionStore(initialValue);
  }, [open, initialValue]);

  const [rootGroup, setRootGroup] = useState<ExpressionGroup>(
    () => store.getState().rootGroup,
  );

  useEffect(() => {
    // Sync immediately in case `store` reference changed
    setRootGroup(store.getState().rootGroup);
    return store.subscribe((state) => {
      setRootGroup(state.rootGroup);
    });
  }, [store]);

  return { store, rootGroup };
}
