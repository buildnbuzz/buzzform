import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { temporal } from "zundo";
import { useStore } from "zustand";
import type { TemporalState } from "zundo";
import { nanoid } from "nanoid";
import type { Node, FieldType, Viewport, BuilderMode } from "./types";
import { builderFieldRegistry } from "./registry";
import { sanitizeFieldDefaults } from "./properties";
import {
  ensureChildList,
  getChildList,
  getNodeChildren,
  getTabSlotKeys,
} from "./node-children";
import type { TabsField } from "@buildnbuzz/buzzform";

type SaveStatus = "idle" | "saving" | "saved";

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
  saveStatus: SaveStatus;
  lastSavedAt: number | null;
};

type BuilderActions = {
  createNode: (
    type: FieldType,
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
  setSaveStatus: (status: SaveStatus, timestamp?: number) => void;
  setFormName: (name: string) => void;
  setFormId: (id: string) => void;
};

type Store = BuilderState & BuilderActions;

type TrackedState = Pick<BuilderState, "nodes" | "rootIds">;

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
  saveStatus: "idle",
  lastSavedAt: null,
};

function mergeUpdates<T extends object>(target: T, source: Partial<T>) {
  const keys = Object.keys(source) as Array<keyof T>;
  for (const key of keys) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      mergeUpdates(targetValue as object, sourceValue as object);
    } else if (sourceValue !== undefined) {
      target[key] = sourceValue as T[keyof T];
    }
  }
}

function removeNodeTree(
  nodes: Record<string, Node>,
  activeTabs: Record<string, string>,
  nodeId: string,
) {
  const node = nodes[nodeId];
  if (!node) return;

  const childIds = getNodeChildren(node);
  for (const childId of childIds) {
    removeNodeTree(nodes, activeTabs, childId);
  }

  delete nodes[nodeId];
  delete activeTabs[nodeId];
}

function removeCollapsedNodes(
  collapsedNodes: Record<string, boolean>,
  nodes: Record<string, Node>,
  nodeId: string,
) {
  delete collapsedNodes[nodeId];
  const node = nodes[nodeId];
  if (!node) return;
  const childIds = getNodeChildren(node);
  for (const childId of childIds) {
    removeCollapsedNodes(collapsedNodes, nodes, childId);
  }
}

function initializeTabsChildren(node: Node) {
  if (node.field.type !== "tabs") return;

  const slots = getTabSlotKeys(node.field.tabs);
  const existing = node.tabChildren ?? {};
  const next: Record<string, string[]> = {};

  for (const slot of slots) {
    next[slot] = existing[slot] ? [...existing[slot]] : [];
  }

  node.tabChildren = next;
  node.children = [];
}

function syncTabsChildren(
  state: Pick<BuilderState, "nodes" | "activeTabs">,
  node: Node,
  previousTabs: TabsField["tabs"],
) {
  if (node.field.type !== "tabs") return;

  const tabsField = node.field as TabsField;
  tabsField.tabs = tabsField.tabs.map((tab) => ({
    ...tab,
    fields: [],
  }));

  const nextTabs = tabsField.tabs;
  const prevSlots = getTabSlotKeys(previousTabs);
  const nextSlots = getTabSlotKeys(nextTabs);
  const prevChildren = node.tabChildren ?? {};
  const nextChildren: Record<string, string[]> = {};

  const usedPreviousIndexes = new Set<number>();
  const previousNameToIndex = new Map<string, number>();

  previousTabs.forEach((tab, index) => {
    const name = typeof tab.name === "string" ? tab.name.trim() : "";
    if (name && !previousNameToIndex.has(name)) {
      previousNameToIndex.set(name, index);
    }
  });

  nextTabs.forEach((tab, index) => {
    const nextSlot = nextSlots[index];
    const nextName = typeof tab.name === "string" ? tab.name.trim() : "";

    let sourceIndex = -1;
    const nameMatchIndex = nextName ? previousNameToIndex.get(nextName) : undefined;

    if (
      typeof nameMatchIndex === "number" &&
      !usedPreviousIndexes.has(nameMatchIndex)
    ) {
      sourceIndex = nameMatchIndex;
    } else if (index < prevSlots.length && !usedPreviousIndexes.has(index)) {
      sourceIndex = index;
    }

    if (sourceIndex !== -1) {
      usedPreviousIndexes.add(sourceIndex);
      const sourceSlot = prevSlots[sourceIndex];
      nextChildren[nextSlot] = [...(prevChildren[sourceSlot] ?? [])];
    } else {
      nextChildren[nextSlot] = [];
    }
  });

  const assignedIds = new Set<string>();
  for (const slot of nextSlots) {
    for (const childId of nextChildren[slot] ?? []) {
      assignedIds.add(childId);
    }
  }

  const orphanedIds: string[] = [];
  for (const sourceIds of Object.values(prevChildren)) {
    for (const childId of sourceIds) {
      if (!assignedIds.has(childId)) {
        orphanedIds.push(childId);
      }
    }
  }

  if (nextSlots.length > 0 && orphanedIds.length > 0) {
    nextChildren[nextSlots[0]].push(...orphanedIds);
  }

  node.tabChildren = nextChildren;
  node.children = [];

  if (nextSlots.length === 0) {
    for (const childId of orphanedIds) {
      removeNodeTree(state.nodes, state.activeTabs, childId);
    }
    return;
  }

  for (const [slot, ids] of Object.entries(nextChildren)) {
    for (const childId of ids) {
      const childNode = state.nodes[childId];
      if (!childNode) continue;
      childNode.parentId = node.id;
      childNode.parentSlot = slot;
    }
  }
}

function resolveDefaultTabIndex(tabs: TabsField["tabs"], defaultTab?: string | number) {
  if (tabs.length === 0) return -1;

  if (typeof defaultTab === "number") {
    return Math.min(Math.max(0, defaultTab), tabs.length - 1);
  }

  if (typeof defaultTab === "string") {
    return tabs.findIndex((tab) => tab.name === defaultTab);
  }

  return 0;
}

function sanitizeTabsDefaultTab(field: TabsField) {
  const tabs = field.tabs ?? [];
  if (tabs.length === 0) {
    if (field.ui?.defaultTab !== undefined) {
      if (field.ui) delete field.ui.defaultTab;
    }
    return;
  }

  const currentDefaultIndex = resolveDefaultTabIndex(tabs, field.ui?.defaultTab);
  const isCurrentValid =
    currentDefaultIndex >= 0 &&
    currentDefaultIndex < tabs.length &&
    tabs[currentDefaultIndex]?.disabled !== true;

  if (isCurrentValid) return;

  const firstEnabledIndex = tabs.findIndex((tab) => tab.disabled !== true);
  const fallbackIndex = firstEnabledIndex >= 0 ? firstEnabledIndex : 0;
  const fallbackTab = tabs[fallbackIndex];

  if (!field.ui) field.ui = {};

  const fallbackName =
    typeof fallbackTab?.name === "string" && fallbackTab.name.trim().length > 0
      ? fallbackTab.name.trim()
      : undefined;

  field.ui.defaultTab = fallbackName ?? fallbackIndex;
}

let throttleTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingState: TrackedState | null = null;

export const useBuilderStore = create<Store>()(
  persist(
    temporal(
      immer((set) => ({
        ...INITIAL_STATE,

        createNode: (type, parentId, index = 0, parentSlot = null) => {
          const id = nanoid();
          const entry = builderFieldRegistry[type];
          if (!entry) return;

          const safeTypeName = type.replace(/-/g, "_");
          const name = `${safeTypeName}_${id.slice(0, 4)}`;

          set((state) => {
            const fieldProps =
              entry.kind === "data"
                ? { ...entry.defaultProps, name }
                : { ...entry.defaultProps };

            state.nodes[id] = {
              id,
              field: fieldProps as Node["field"],
              parentId,
              parentSlot: null,
              children: [],
            };

            initializeTabsChildren(state.nodes[id]);

            const { list, resolvedSlot } = ensureChildList(
              state.nodes,
              state.rootIds,
              parentId,
              parentSlot,
            );

            state.nodes[id].parentSlot = resolvedSlot;
            list.splice(index, 0, id);

            state.selectedId = id;
          });
        },

        moveNode: (id, newParentId, index, newParentSlot = null) => {
          set((state) => {
            const node = state.nodes[id];
            if (!node) return;

            const oldParentId = node.parentId;
            const oldParentSlot = node.parentSlot ?? null;
            const oldList = getChildList(
              state.nodes,
              state.rootIds,
              oldParentId,
              oldParentSlot,
            );

            const oldIndex = oldList.indexOf(id);
            if (oldIndex !== -1) {
              oldList.splice(oldIndex, 1);
            }

            if (
              oldParentId === newParentId &&
              oldParentSlot === newParentSlot &&
              oldIndex !== -1 &&
              oldIndex < index
            ) {
              index -= 1;
            }

            node.parentId = newParentId;
            const { list: newList, resolvedSlot } = ensureChildList(
              state.nodes,
              state.rootIds,
              newParentId,
              newParentSlot,
            );
            node.parentSlot = resolvedSlot;

            newList.splice(index, 0, id);
          });
        },

        selectNode: (id) => set({ selectedId: id }),

        updateNode: (id, updates) => {
          set((state) => {
            const node = state.nodes[id];
            if (node) {
              const previousTabs =
                node.field.type === "tabs"
                  ? [...(node.field as TabsField).tabs]
                  : null;

              mergeUpdates(node.field, updates);

              if (node.field.type === "tabs") {
                syncTabsChildren(state, node, previousTabs ?? []);
                sanitizeTabsDefaultTab(node.field as TabsField);
              }

              sanitizeFieldDefaults(
                node.field as unknown as Record<string, unknown>,
              );
            }
          });
        },

        removeNode: (id) => {
          set((state) => {
            const node = state.nodes[id];
            if (!node) return;

            const parentId = node.parentId;
            const parentSlot = node.parentSlot ?? null;
            const list = getChildList(
              state.nodes,
              state.rootIds,
              parentId,
              parentSlot,
            );
            const idx = list.indexOf(id);
            if (idx !== -1) list.splice(idx, 1);

            removeCollapsedNodes(state.collapsedNodes, state.nodes, id);
            removeNodeTree(state.nodes, state.activeTabs, id);

            if (state.selectedId === id) {
              state.selectedId = null;
            }
          });
        },

        duplicateNode: (id) => {
          set((state) => {
            const originalNode = state.nodes[id];
            if (!originalNode) return;

            const cloneRecursive = (
              nodeId: string,
              newParentId: string | null,
              newParentSlot: string | null,
            ): string => {
              const sourceNode = state.nodes[nodeId];
              if (!sourceNode) return "";
              const newId = nanoid();

              const newField = { ...sourceNode.field };

              if ("name" in newField && typeof newField.name === "string") {
                const baseName = newField.name;
                let newName = `${baseName}_copy`;
                let counter = 1;

                const isNameTaken = (n: string) =>
                  Object.values(state.nodes).some(
                    (node) => "name" in node.field && node.field.name === n,
                  );

                while (isNameTaken(newName)) {
                  newName = `${baseName}_copy_${counter}`;
                  counter++;
                }
                (newField as { name: string }).name = newName;
              }

              const newNode: Node = {
                id: newId,
                field: newField,
                parentId: newParentId,
                parentSlot: newParentSlot,
                children: [],
              };

              state.nodes[newId] = newNode;

              if (sourceNode.field.type === "tabs") {
                const sourceTabsNode = sourceNode as Node & {
                  field: TabsField;
                };
                const sourceSlots = getTabSlotKeys(sourceTabsNode.field.tabs);
                const nextTabChildren: Record<string, string[]> = {};

                for (const slot of sourceSlots) {
                  const childrenInSlot = sourceNode.tabChildren?.[slot] ?? [];
                  nextTabChildren[slot] = childrenInSlot
                    .map((childId) => cloneRecursive(childId, newId, slot))
                    .filter(Boolean);
                }

                newNode.tabChildren = nextTabChildren;
              } else {
                newNode.children = sourceNode.children
                  .map((childId) => cloneRecursive(childId, newId, null))
                  .filter(Boolean);
              }

              return newId;
            };

            const newRootId = cloneRecursive(
              id,
              originalNode.parentId,
              originalNode.parentSlot ?? null,
            );
            if (!newRootId) return;

            const parentId = originalNode.parentId;
            const parentSlot = originalNode.parentSlot ?? null;
            const list = getChildList(
              state.nodes,
              state.rootIds,
              parentId,
              parentSlot,
            );
            const originalIndex = list.indexOf(id);

            if (originalIndex !== -1) {
              list.splice(originalIndex + 1, 0, newRootId);
            }

            state.selectedId = newRootId;
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
          const temporal = useBuilderStore.temporal.getState();
          temporal.pause();
          temporal.clear();
          set((state) => {
            Object.assign(state, INITIAL_STATE);
            state.formId = nanoid();
          });
          temporal.resume();
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
        }),
        equality: (pastState, currentState) =>
          pastState.nodes === currentState.nodes &&
          pastState.rootIds === currentState.rootIds,
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
      name: "buzzform-builder",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        nodes: state.nodes,
        rootIds: state.rootIds,
        zoom: state.zoom,
        viewport: state.viewport,
        formId: state.formId,
        formName: state.formName,
      }),
      version: 2,
      migrate: (persistedState, version) => {
        if (!persistedState || typeof persistedState !== "object") {
          return persistedState;
        }

        const state = persistedState as {
          nodes?: Record<string, Node>;
          rootIds?: string[];
        };

        if (!state.nodes || version >= 2) {
          return persistedState;
        }

        for (const node of Object.values(state.nodes)) {
          if (!Array.isArray(node.children)) {
            node.children = [];
          }

          if (typeof node.parentSlot !== "string" && node.parentSlot !== null) {
            node.parentSlot = null;
          }

          if (node.field.type === "tabs") {
            const legacyChildren = [...node.children];
            initializeTabsChildren(node);

            const hasLegacyChildren = legacyChildren.length > 0;
            if (hasLegacyChildren) {
              const slots = getTabSlotKeys(node.field.tabs);
              const firstSlot = slots[0];
              if (firstSlot) {
                const existing = node.tabChildren?.[firstSlot] ?? [];
                node.tabChildren = {
                  ...(node.tabChildren ?? {}),
                  [firstSlot]: [...existing, ...legacyChildren],
                };
              }
            }
          }
        }

        for (const node of Object.values(state.nodes)) {
          const parent = node.parentId ? state.nodes[node.parentId] : null;
          if (!parent) {
            node.parentSlot = null;
            continue;
          }

          if (parent.field.type === "tabs") {
            const slots = getTabSlotKeys(parent.field.tabs);
            const firstSlot = slots[0] ?? null;
            node.parentSlot = node.parentSlot ?? firstSlot;
          } else {
            node.parentSlot = null;
          }
        }

        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setSaveStatus("saved");
        }
      },
    },
  ),
);

export function useTemporalStore<T>(
  selector: (state: TemporalState<TrackedState>) => T,
): T {
  return useStore(useBuilderStore.temporal, selector);
}

export const useCanUndo = () =>
  useTemporalStore((state) => state.pastStates.length > 0);

export const useCanRedo = () =>
  useTemporalStore((state) => state.futureStates.length > 0);

export function useUndoRedo() {
  const { undo, redo, clear } = useBuilderStore.temporal.getState();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  return { undo, redo, clear, canUndo, canRedo };
}

let saveStatusTimeout: ReturnType<typeof setTimeout> | null = null;
useBuilderStore.subscribe((state, prevState) => {
  if (
    state.nodes !== prevState.nodes ||
    state.rootIds !== prevState.rootIds ||
    state.formName !== prevState.formName
  ) {
    state.setSaveStatus("saving");
    if (saveStatusTimeout) clearTimeout(saveStatusTimeout);
    saveStatusTimeout = setTimeout(() => {
      useBuilderStore.getState().setSaveStatus("saved", Date.now());
    }, 600);
  }
});
