"use client";

import React, { createContext, useContext, useMemo, type ReactNode } from "react";
import type { UseBoundStore, StoreApi } from "zustand";
import { useStore } from "zustand";
import type { TemporalState } from "zundo";
import type { BuilderStoreInterface, BuilderFieldRegistry, IconMetadata } from "../types";
import { createBuilderStore } from "../state/store";

// ---------------------------------------------------------------------------
// Context Types
// ---------------------------------------------------------------------------

export interface BuilderContextValue {
  /** The store instance (Zustand). */
  store: UseBoundStore<StoreApi<BuilderStoreInterface>>;
  /** The field registry for looking up visual metadata. */
  registry: BuilderFieldRegistry;
  /** Optional function to render icons from metadata. */
  renderIcon?: (metadata: IconMetadata) => React.ReactNode;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

import type { BuilderStorageProvider } from "@buildnbuzz/form-builder-core";
import { useAutoSave } from "../hooks/use-auto-save";
import { useBuilderKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts";
import { ExpressionProvider } from "./ExpressionContext";

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

export interface BuilderProviderProps {
  /** The store instance to use. Useful for external store management. */
  store: UseBoundStore<StoreApi<BuilderStoreInterface>>;
  /** The field registry. */
  registry: BuilderFieldRegistry;
  /** Optional function to render icons from metadata. */
  renderIcon?: (metadata: IconMetadata) => React.ReactNode;
  /** Optional persistence provider for autosaving. */
  storageProvider?: BuilderStorageProvider | null;
  children: ReactNode;
}

/**
 * Low-level provider for the form builder.
 * 
 * Use this if you want to manage the store instance externally.
 */
export const BuilderProvider = ({ 
  store, 
  registry, 
  renderIcon,
  storageProvider = null,
  children 
}: BuilderProviderProps) => {
  const value = useMemo(() => ({ store, registry, renderIcon }), [store, registry, renderIcon]);
  
  return (
    <BuilderContext.Provider value={value}>
      <AutoSaveWiring provider={storageProvider} />
      <KeyboardShortcutWiring />
      <ExpressionProvider>
        {children}
      </ExpressionProvider>
    </BuilderContext.Provider>
  );
};

// Component to run hook inside context
function AutoSaveWiring({ provider }: { provider: BuilderStorageProvider | null }) {
  useAutoSave(provider);
  return null;
}

function KeyboardShortcutWiring() {
  useBuilderKeyboardShortcuts();
  return null;
}

export interface DefaultBuilderProviderProps {
  /** The field registry. */
  registry: BuilderFieldRegistry;
  /** Optional function to render icons from metadata. */
  renderIcon?: (metadata: IconMetadata) => React.ReactNode;
  /** Optional custom name for persistence. */
  persistenceName?: string;
  /** Optional persistence provider for autosaving. */
  storageProvider?: BuilderStorageProvider | null;
  children: ReactNode;
}

/**
 * Zero-config provider for the form builder.
 * 
 * Automatically initializes the built-in Zustand store with the given registry.
 */
export const DefaultBuilderProvider = ({ 
  registry, 
  renderIcon,
  persistenceName, 
  storageProvider = null,
  children 
}: DefaultBuilderProviderProps) => {
  const store = useMemo(() => createBuilderStore({ 
    registry, 
    name: persistenceName 
  }), [registry, persistenceName]);

  return (
    <BuilderProvider 
      store={store} 
      registry={registry} 
      renderIcon={renderIcon}
      storageProvider={storageProvider}
    >
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
