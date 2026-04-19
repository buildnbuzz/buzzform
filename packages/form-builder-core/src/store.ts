import { createStore } from "zustand/vanilla";
import type { StoreApi } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { temporal } from "zundo";

import { nanoid } from "nanoid";
import type { Node, Viewport, BuilderMode, SaveStatus } from "./types";

import { nodesToFields } from "./schema-builder";
import type { BuilderStorageProvider } from "./persistence/provider";
import { ensureChildList } from "./node-children";
import {
  insertNode,
  moveNode,
  removeNodeTree as treeRemoveNode,
  duplicateNode,
  updateNode as treeUpdateNode,
} from "./tree";
import type {
  TabsField,
  OutputConfig,
  Field,
  FieldType,
  FormSchema,
} from "@buildnbuzz/form-core";

type BuilderState = {
  nodes: Record<string, Node>;
  rootIds: string[];
  activeTabs: Record<string, string>;
  collapsedNodes: Record<string, boolean>;
  selectedId: string | null;
  dropIndicator: {
    parentId: string | null;
    parentSlot: string | null;
    index: number;
  } | null;
  mode: BuilderMode;
  zoom: number;
  viewport: Viewport;
  formId: string;
  formName: string;
  outputConfig?: OutputConfig;
  saveStatus: SaveStatus;
  lastSavedAt: number | null;
};

type BuilderActions = {
  createNode: (
    type: FieldType,
    fieldDefinitionDefaultProps: Partial<Field>,
    parentId: string | null,
    index?: number,
    parentSlot?: string | null,
  ) => void;
  moveNode: (
    id: string,
    newParentId: string | null,
    index: number,
    newParentSlot?: string | null,
  ) => void;
  selectNode: (id: string | null) => void;
  updateNode: (id: string, updates: Partial<Node["field"]>) => void;
  updateFormSettings: (
    updates: Partial<Pick<BuilderState, "outputConfig">>,
  ) => void;
  removeNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  setActiveTab: (nodeId: string, slot: string) => void;
  setDropIndicator: (value: BuilderState["dropIndicator"]) => void;
  toggleCollapsed: (nodeId: string) => void;
  setCollapsed: (nodeId: string, collapsed: boolean) => void;
  setMode: (mode: BuilderMode) => void;
  setZoom: (zoom: number) => void;
  setViewport: (viewport: Viewport) => void;
  clearState: () => void;
  loadDocumentState: (
    state: Pick<
      BuilderState,
      "nodes" | "rootIds" | "formId" | "formName" | "outputConfig"
    >,
  ) => void;
  setSaveStatus: (status: SaveStatus, timestamp?: number) => void;
  setFormName: (name: string) => void;
  setFormId: (id: string) => void;
};

export type Store = BuilderState & BuilderActions;

type TrackedState = Pick<BuilderState, "nodes" | "rootIds" | "outputConfig">;
type PersistableDocumentState = Pick<
  BuilderState,
  "nodes" | "rootIds" | "formId" | "formName" | "outputConfig"
>;

const INITIAL_STATE: BuilderState = {
  nodes: {},
  rootIds: [],
  activeTabs: {},
  collapsedNodes: {},
  selectedId: null,
  dropIndicator: null,
  mode: "edit",
  zoom: 0.9,
  viewport: "desktop",
  formId: nanoid(),
  formName: "Untitled form",
  outputConfig: undefined,
  saveStatus: "idle",
  lastSavedAt: null,
};

let throttleTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingState: TrackedState | null = null;

export interface BuilderStoreOptions {
  /** Optional persist name for localStorage */
  name?: string;
}

export const createBuilderStore = (
  options?: BuilderStoreOptions,
): StoreApi<Store> =>
  createStore<Store>()(
    persist(
    temporal(
      immer((set) => ({
        ...INITIAL_STATE,

        createNode: (
          type,
          defaultProps,
          parentId,
          index = 0,
          parentSlot = null,
        ) => {
          const id = nanoid();
          const safeTypeName = type.replace(/-/g, "_");
          const name = `${safeTypeName}_${id.slice(0, 4)}`;

          const isData =
            "name" in defaultProps ||
            (defaultProps.type !== "group" &&
              defaultProps.type !== "array" &&
              defaultProps.type !== "row" &&
              defaultProps.type !== "tabs" &&
              defaultProps.type !== "collapsible"); // fast approximation of isDataField without registry
          const fieldProps = isData
            ? { ...defaultProps, name }
            : { ...defaultProps };

          const newNode: Node = {
            id,
            field: fieldProps as Node["field"],
            parentId,
            parentSlot: null,
            children: {},
          };

          // If tabs, initialize default array for slots
          if (newNode.field.type === "tabs") {
            const tabs = (newNode.field as TabsField).tabs || [];
            tabs.forEach((_, i) => (newNode.children[`__tab_${i}`] = []));
          }

          set((state) => {
            const nextTree = insertNode(
              { nodes: state.nodes, rootIds: state.rootIds },
              newNode,
              index,
            );

            // Adjust the parent slot after insertion if needed
            const currentItem = nextTree.nodes[id];
            if (currentItem && currentItem.parentId) {
              const { resolvedSlot } = ensureChildList(
                nextTree.nodes,
                nextTree.rootIds,
                currentItem.parentId,
                parentSlot,
              );
              nextTree.nodes[id]!.parentSlot = resolvedSlot;
            }

            state.nodes = nextTree.nodes as unknown as typeof state.nodes;
            state.rootIds = nextTree.rootIds;
            state.selectedId = id;
          });
        },

        moveNode: (id, newParentId, index, newParentSlot = null) => {
          set((state) => {
            const nextTree = moveNode(
              { nodes: state.nodes, rootIds: state.rootIds },
              id,
              newParentId,
              index,
              newParentSlot,
            );
            state.nodes = nextTree.nodes as unknown as typeof state.nodes;
            state.rootIds = nextTree.rootIds;
          });
        },

        selectNode: (id) => set({ selectedId: id }),

        updateNode: (id, updates) => {
          set((state) => {
            const nextTree = treeUpdateNode(
              { nodes: state.nodes, rootIds: state.rootIds },
              id,
              updates,
            );
            state.nodes = nextTree.nodes as unknown as typeof state.nodes;
            state.rootIds = nextTree.rootIds;
          });
        },

        updateFormSettings: (updates) => {
          set((state) => {
            if ("outputConfig" in updates) {
              state.outputConfig = updates.outputConfig;
            }
            if ("title" in updates) {
              state.formName = updates.title as string;
            }
            if ("description" in updates) {
               // We don't have description in BuilderState yet, but we can store it in meta or add it.
               // For now, let's keep it simple.
            }
          });
        },

        removeNode: (id) => {
          set((state) => {
            const nextTree = treeRemoveNode(
              { nodes: state.nodes, rootIds: state.rootIds },
              id,
            );
            state.nodes = nextTree.nodes as unknown as typeof state.nodes;
            state.rootIds = nextTree.rootIds;

            // Also clean up active tabs for this node and descendants
            // In a strict setup we'd recursively delete activeTabs, but deleting the node is sufficient for headless
            delete state.activeTabs[id];
            delete state.collapsedNodes[id];

            if (state.selectedId === id) {
              state.selectedId = null;
            }
          });
        },

        duplicateNode: (id) => {
          set((state) => {
            const { state: nextTree, newId } = duplicateNode(
              { nodes: state.nodes, rootIds: state.rootIds },
              id,
            );
            state.nodes = nextTree.nodes as unknown as typeof state.nodes;
            state.rootIds = nextTree.rootIds;
            if (newId) {
              state.selectedId = newId;
            }
          });
        },

        setActiveTab: (nodeId, slot) =>
          set((state) => {
            state.activeTabs[nodeId] = slot;
          }),

        setDropIndicator: (value) => set({ dropIndicator: value }),

        toggleCollapsed: (nodeId) =>
          set((state) => {
            state.collapsedNodes[nodeId] = !state.collapsedNodes[nodeId];
          }),

        setCollapsed: (nodeId, collapsed) =>
          set((state) => {
            if (collapsed) {
              state.collapsedNodes[nodeId] = true;
            } else {
              delete state.collapsedNodes[nodeId];
            }
          }),

        setMode: (mode) => set({ mode }),

        setZoom: (zoom) => set({ zoom }),

        setViewport: (viewport) => set({ viewport }),

        clearState: () => {
          // temporal API can be accessed via `builderStore.temporal.getState()`
          set((state) => {
            Object.assign(state, INITIAL_STATE);
            state.formId = nanoid();
          });
        },

        loadDocumentState: (documentState) => {
          set((state) => {
            Object.assign(state, INITIAL_STATE);
            state.nodes = documentState.nodes as unknown as typeof state.nodes;
            state.rootIds = [...documentState.rootIds];
            state.formId = documentState.formId;
            state.formName = documentState.formName;
            state.outputConfig = documentState.outputConfig;
            state.saveStatus = "saved";
            state.lastSavedAt = Date.now();
          });
        },

        setSaveStatus: (saveStatus, timestamp) =>
          set({
            saveStatus,
            lastSavedAt:
              timestamp ?? (saveStatus === "saved" ? Date.now() : undefined),
          }),

        setFormName: (name) => set({ formName: name }),
        setFormId: (id) => set({ formId: id }),
      })),
      {
        partialize: (state): TrackedState => ({
          nodes: state.nodes,
          rootIds: state.rootIds,
          outputConfig: state.outputConfig,
        }),
        equality: (pastState, currentState) =>
          pastState.nodes === currentState.nodes &&
          pastState.rootIds === currentState.rootIds &&
          pastState.outputConfig === currentState.outputConfig,
        limit: 50,
        handleSet: (handleSet) => (pastState) => {
          if (!pendingState) {
            pendingState = pastState as TrackedState;
          }
          if (throttleTimeout) {
            clearTimeout(throttleTimeout);
          }
          throttleTimeout = setTimeout(() => {
            if (pendingState) {
              handleSet(pendingState);
              pendingState = null;
            }
            throttleTimeout = null;
          }, 400);
        },
      },
    ),
    {
      name: options?.name ?? "buzzform-builder",
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => localStorage)
          : undefined,
      partialize: (state) => ({
        nodes: state.nodes,
        rootIds: state.rootIds,
        zoom: state.zoom,
        viewport: state.viewport,
        formId: state.formId,
        formName: state.formName,
        outputConfig: state.outputConfig,
      }),
      version: 2,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setSaveStatus("saved");
        }
      },
    },
  ),
) as unknown as StoreApi<Store>;

// ---------------------------------------------------------------------------
// External Autosave setup
// ---------------------------------------------------------------------------

const SAVE_DEBOUNCE_MS = 600;
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let saveRevision = 0;

function isDocumentEmpty(
  nodes: Record<string, Node>,
  rootIds: string[],
): boolean {
  return rootIds.length === 0 && Object.keys(nodes).length === 0;
}

function shouldSkipAutosave(
  snapshot: PersistableDocumentState,
  prevState: Store,
): boolean {
  const currentEmpty = isDocumentEmpty(snapshot.nodes, snapshot.rootIds);
  if (!currentEmpty) {
    return false;
  }
  const previousEmpty = isDocumentEmpty(prevState.nodes, prevState.rootIds);
  const isNewFormSession = snapshot.formId !== prevState.formId;
  return previousEmpty || isNewFormSession;
}

/**
 * Configure auto-save hook manually in core.
 */
export function setupBuilderAutoSave(
  store: StoreApi<Store>,
  provider: BuilderStorageProvider | null,
) {
  return store.subscribe((state, prevState) => {
    if (!provider) return;

    if (
      state.nodes === prevState.nodes &&
      state.rootIds === prevState.rootIds &&
      state.formName === prevState.formName &&
      state.formId === prevState.formId &&
      state.outputConfig === prevState.outputConfig
    ) {
      return;
    }

    const snapshot: PersistableDocumentState = {
      nodes: state.nodes,
      rootIds: state.rootIds,
      formId: state.formId,
      formName: state.formName,
      outputConfig: state.outputConfig,
    };

    if (shouldSkipAutosave(snapshot, prevState)) {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
        saveTimeout = null;
      }
      saveRevision += 1;
      store.getState().setSaveStatus("idle");
      return;
    }

    store.getState().setSaveStatus("saving");
    saveRevision += 1;
    const currentRevision = saveRevision;

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(async () => {
      saveTimeout = null;
      try {
        const fields = nodesToFields(snapshot.nodes, snapshot.rootIds);
        const document: FormSchema = {
          id: snapshot.formId,
          title: snapshot.formName,
          fields,
          ...(snapshot.outputConfig ? { output: snapshot.outputConfig } : {}),
        };
        await provider.save(snapshot.formId, document);

        if (currentRevision === saveRevision) {
          store.getState().setSaveStatus("saved", Date.now());
        }
      } catch {
        if (currentRevision === saveRevision) {
          store.getState().setSaveStatus("idle");
        }
      }
    }, SAVE_DEBOUNCE_MS);
  });
}
