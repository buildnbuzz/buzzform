"use client";

import React, { createContext, useContext, useMemo, type ReactNode } from "react";
import type { UseBoundStore, StoreApi } from "zustand";
import { useStore } from "zustand";
import type { TemporalState } from "zundo";
import type { BuilderStoreInterface, BuilderFieldRegistry } from "../types";
import { createBuilderStore } from "../state/store";

// ---------------------------------------------------------------------------
// Context Types
// ---------------------------------------------------------------------------

export interface BuilderContextValue {
  /** The store instance (Zustand). */
  store: UseBoundStore<StoreApi<BuilderStoreInterface>>;
  /** The field registry for looking up visual metadata. */
  registry: BuilderFieldRegistry;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

export interface BuilderProviderProps {
  /** The store instance to use. Useful for external store management. */
  store: UseBoundStore<StoreApi<BuilderStoreInterface>>;
  /** The field registry. */
  registry: BuilderFieldRegistry;
  children: ReactNode;
}

/**
 * Low-level provider for the form builder.
 * 
 * Use this if you want to manage the store instance externally.
 */
export const BuilderProvider = ({ store, registry, children }: BuilderProviderProps) => {
  const value = useMemo(() => ({ store, registry }), [store, registry]);
  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
};

export interface DefaultBuilderProviderProps {
  /** The field registry. */
  registry: BuilderFieldRegistry;
  /** Optional custom name for persistence. */
  persistenceName?: string;
  children: ReactNode;
}

/**
 * Zero-config provider for the form builder.
 * 
 * Automatically initializes the built-in Zustand store with the given registry.
 */
export const DefaultBuilderProvider = ({ 
  registry, 
  persistenceName, 
  children 
}: DefaultBuilderProviderProps) => {
  const store = useMemo(() => createBuilderStore({ 
    registry, 
    name: persistenceName 
  }), [registry, persistenceName]);

  return (
    <BuilderProvider store={store} registry={registry}>
      {children}
    </BuilderProvider>
  );
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Accesses the builder context value. */
export const useBuilderContext = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error("useBuilderContext must be used within a BuilderProvider");
  }
  return context;
};

/**
 * Hook to access the builder store state with reactivity.
 * 
 * @example
 * const nodes = useBuilderStore((state) => state.nodes);
 */
export function useBuilderStore<T>(selector: (state: BuilderStoreInterface) => T): T {
  const { store } = useBuilderContext();
  return useStore(store, selector);
}

/**
 * Hook to access the currently selected node.
 */
export const useSelectedNode = () => {
  return useBuilderStore((state) => {
    const { selectedId, nodes } = state;
    return selectedId ? nodes[selectedId] : null;
  });
};

/**
 * Hook to access undo/redo functionality from the built-in store.
 * 
 * Note: Only works when using `DefaultBuilderProvider` or a store that supports temporal state.
 */
export function useUndoRedo() {
  const { store } = useBuilderContext();
  
  // Cast to check for temporal support without 'any'
  const temporalStore = (store as unknown as { 
    temporal: StoreApi<TemporalState<Pick<BuilderStoreInterface, "nodes" | "rootIds">>> 
  }).temporal;

  if (!temporalStore) {
    throw new Error("Undo/Redo is not supported by the current store implementation.");
  }

  const { undo, redo, clear, pastStates, futureStates } = useStore(temporalStore);

  return {
    undo,
    redo,
    clear,
    canUndo: pastStates.length > 0,
    canRedo: futureStates.length > 0,
  };
}
