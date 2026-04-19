import { create, type UseBoundStore, type StoreApi } from "zustand";
import {
  createBuilderStore as createCoreStore,
} from "@buildnbuzz/form-builder-core";
import type { Store as CoreStore } from "@buildnbuzz/form-builder-core";
import type { BuilderStoreInterface, BuilderStoreOptions } from "../types";
import type { Field, FieldType } from "@buildnbuzz/form-core";

/**
 * Creates a React-ready Zustand store by wrapping the framework-agnostic core store.
 */
export const createBuilderStore = (options: BuilderStoreOptions): UseBoundStore<StoreApi<BuilderStoreInterface>> => {
  const { registry, name } = options;

  // Create the underlying vanilla store from core
  const coreStore = createCoreStore({ name });

  // Define the React-wrapped actions
  const getActions = (): Partial<BuilderStoreInterface> => ({
    createNode: (type: FieldType, parentId: string | null, index = 0, parentSlot = null) => {
      const entry = registry[type];
      if (!entry) return;
      
      coreStore.getState().createNode(
        type, 
        entry.defaultProps as Partial<Field>, 
        parentId, 
        index, 
        parentSlot
      );
    },

    updateNode: (id, updates) => coreStore.getState().updateNode(id, updates),
    moveNode: (id, parentId, index, slot) => coreStore.getState().moveNode(id, parentId, index, slot),
    removeNode: (id) => coreStore.getState().removeNode(id),
    duplicateNode: (id) => coreStore.getState().duplicateNode(id),
    selectNode: (id) => coreStore.getState().selectNode(id),
    setActiveTab: (nodeId, slot) => coreStore.getState().setActiveTab(nodeId, slot),
    toggleCollapsed: (nodeId) => coreStore.getState().toggleCollapsed(nodeId),
    setCollapsed: (nodeId, collapsed) => coreStore.getState().setCollapsed(nodeId, collapsed),
    setDropIndicator: (val) => coreStore.getState().setDropIndicator(val),
    setMode: (mode) => coreStore.getState().setMode(mode),
    setViewport: (vp) => coreStore.getState().setViewport(vp),
    setZoom: (z) => coreStore.getState().setZoom(z),
    updateFormSettings: (updates) => coreStore.getState().updateFormSettings(updates),
    clearState: () => coreStore.getState().clearState(),
    loadDocumentState: (s) => coreStore.getState().loadDocumentState(s),
    setSaveStatus: (s, t) => coreStore.getState().setSaveStatus(s, t),
    setFormName: (n) => coreStore.getState().setFormName(n),
    setFormId: (id) => coreStore.getState().setFormId(id),
  });

  // Wrap the core store in a bound zustand store for React reactivity
  const store = create<BuilderStoreInterface>()(() => {
    const coreState = coreStore.getState();
    const actions = getActions();

    return {
      ...(coreState as unknown as CoreStore),
      ...actions,
      temporal: (coreStore as unknown as { temporal: unknown }).temporal,
    } as BuilderStoreInterface;
  });

  // Attach coreStore temporal API to the bound store object so useUndoRedo hook works
  const coreStoreAny = coreStore as unknown as { temporal?: unknown };
  if (coreStoreAny.temporal) {
    (store as unknown as { temporal?: unknown }).temporal = coreStoreAny.temporal;
  }

  // Sync the React-bound store whenever the core store changes.
  coreStore.subscribe((state) => {
    // We only update the data from the core store, preserving our React-wrapped actions
    const data: Record<string, unknown> = {};
    const stateRecord = state as unknown as Record<string, unknown>;
    for (const key in stateRecord) {
        if (typeof stateRecord[key] !== "function") {
            data[key] = stateRecord[key];
        }
    }
    store.setState(data as unknown as Partial<BuilderStoreInterface>);
  });

  return store;
};
