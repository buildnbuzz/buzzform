import { create, type UseBoundStore, type StoreApi } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { temporal } from "zundo";
import { nanoid } from "nanoid";
import type { WritableDraft } from "immer";
import type { Field } from "@buildnbuzz/form-core";
import {
  insertNode,
  moveNode,
  removeNode,
  duplicateNode,
  updateNode,
  type Node,
} from "@buildnbuzz/form-builder-core";
import type { BuilderStoreInterface, BuilderFieldRegistry } from "../types";

export interface BuilderStoreOptions {
  registry: BuilderFieldRegistry;
  name?: string;
  storage?: Storage;
}

const DEFAULT_INITIAL_STATE = {
  nodes: {},
  rootIds: [],
  selectedId: null,
  activeTabs: {},
  collapsedNodes: {},
  mode: "edit" as const,
  viewport: "desktop" as const,
  zoom: 1.0,
  dropIndicator: null,
  saveStatus: "idle" as const,
};

/**
 * Creates a fully-featured Zustand store for the form builder.
 * 
 * This store implements the `BuilderStoreInterface` and uses the pure 
 * tree reducers from `@buildnbuzz/form-builder-core`.
 */
export const createBuilderStore = (options: BuilderStoreOptions): UseBoundStore<StoreApi<BuilderStoreInterface>> => {
  const { registry, name = "buzzform-builder", storage = typeof window !== "undefined" ? window.localStorage : undefined } = options;

  return create<BuilderStoreInterface>()(
    persist(
      temporal(
        immer((set) => ({
          ...DEFAULT_INITIAL_STATE,

          // --- Selection ---
          selectNode: (id) => set({ selectedId: id }),

          // --- Node Operations (Logic moved to core reducers) ---
          updateNode: (id, updates) => set((state) => {
            const result = updateNode({ nodes: state.nodes as Record<string, Node>, rootIds: state.rootIds }, id, updates);
            state.nodes = result.nodes as WritableDraft<Record<string, Node>>;
            state.rootIds = result.rootIds;
          }),

          createNode: (type, parentId, index = 0) => {
            const entry = registry[type];
            if (!entry) return;

            const id = nanoid();
            const safeTypeName = type.replace(/-/g, "_");
            const nameField = `${safeTypeName}_${id.slice(0, 4)}`;

            const fieldProps = entry.kind === "data"
              ? { ...entry.defaultProps, name: nameField } as Field
              : { ...entry.defaultProps } as Field;

            const newNode: Node = {
              id,
              field: fieldProps,
              parentId,
              parentSlot: null, // InsertNode will resolve this
              children: {},
            };

            set((state) => {
              const result = insertNode({ nodes: state.nodes as Record<string, Node>, rootIds: state.rootIds }, newNode, index);
              state.nodes = result.nodes as WritableDraft<Record<string, Node>>;
              state.rootIds = result.rootIds;
              state.selectedId = id;
            });
          },

          moveNode: (id, newParentId, index, newParentSlot = null) => set((state) => {
            const result = moveNode({ nodes: state.nodes as Record<string, Node>, rootIds: state.rootIds }, id, newParentId, index, newParentSlot);
            state.nodes = result.nodes as WritableDraft<Record<string, Node>>;
            state.rootIds = result.rootIds;
          }),

          removeNode: (id) => set((state) => {
            const result = removeNode({ nodes: state.nodes as Record<string, Node>, rootIds: state.rootIds }, id);
            state.nodes = result.nodes as WritableDraft<Record<string, Node>>;
            state.rootIds = result.rootIds;
            if (state.selectedId === id) state.selectedId = null;
            delete state.collapsedNodes[id];
            delete state.activeTabs[id];
          }),

          duplicateNode: (id) => set((state) => {
            const { state: nextState, newId } = duplicateNode({ nodes: state.nodes as Record<string, Node>, rootIds: state.rootIds }, id);
            state.nodes = nextState.nodes as WritableDraft<Record<string, Node>>;
            state.rootIds = nextState.rootIds;
            if (newId) state.selectedId = newId;
          }),

          // --- UI Actions ---
          setActiveTab: (nodeId, slot) => set((state) => {
            state.activeTabs[nodeId] = slot;
          }),

          toggleCollapsed: (nodeId) => set((state) => {
            state.collapsedNodes[nodeId] = !state.collapsedNodes[nodeId];
          }),

          setCollapsed: (nodeId, collapsed) => set((state) => {
            if (collapsed) {
              state.collapsedNodes[nodeId] = true;
            } else {
              delete state.collapsedNodes[nodeId];
            }
          }),

          setDropIndicator: (value) => set({ dropIndicator: value }),
          setMode: (mode) => set({ mode }),
          setViewport: (viewport) => set({ viewport }),
          setZoom: (zoom) => set({ zoom }),
        })),
        {
          // Undo/Redo configuration
          limit: 50,
          partialize: (state) => ({
            nodes: state.nodes,
            rootIds: state.rootIds,
          }),
        }
      ),
      {
        name,
        storage: storage ? createJSONStorage(() => storage) : undefined,
        partialize: (state) => ({
          nodes: state.nodes,
          rootIds: state.rootIds,
          zoom: state.zoom,
          viewport: state.viewport,
        }),
      }
    )
  ) as UseBoundStore<StoreApi<BuilderStoreInterface>>;
};
