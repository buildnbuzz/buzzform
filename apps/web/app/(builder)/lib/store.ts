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

type SaveStatus = "idle" | "saving" | "saved";

type BuilderState = {
  nodes: Record<string, Node>;
  rootIds: string[];
  selectedId: string | null;
  dropIndicator: { parentId: string | null; index: number } | null;
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
  ) => void;
  moveNode: (id: string, newParentId: string | null, index: number) => void;
  selectNode: (id: string | null) => void;
  updateNode: (id: string, updates: Partial<Node["field"]>) => void;
  removeNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  setDropIndicator: (value: BuilderState["dropIndicator"]) => void;
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

let throttleTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingState: TrackedState | null = null;

export const useBuilderStore = create<Store>()(
  persist(
    temporal(
      immer((set) => ({
        ...INITIAL_STATE,

        createNode: (type, parentId, index = 0) => {
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
              children: [],
            };

            if (parentId === null) {
              state.rootIds.splice(index, 0, id);
            } else {
              state.nodes[parentId].children.splice(index, 0, id);
            }

            state.selectedId = id;
          });
        },

        moveNode: (id, newParentId, index) => {
          set((state) => {
            const node = state.nodes[id];
            if (!node) return;

            const oldParentId = node.parentId;
            const oldList =
              oldParentId === null
                ? state.rootIds
                : state.nodes[oldParentId].children;

            const oldIndex = oldList.indexOf(id);
            oldList.splice(oldIndex, 1);

            if (oldParentId === newParentId && oldIndex < index) {
              index -= 1;
            }

            node.parentId = newParentId;

            const newList =
              newParentId === null
                ? state.rootIds
                : state.nodes[newParentId].children;

            newList.splice(index, 0, id);
          });
        },

        selectNode: (id) => set({ selectedId: id }),

        updateNode: (id, updates) => {
          set((state) => {
            const node = state.nodes[id];
            if (node) {
              mergeUpdates(node.field, updates);
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

            const removeRecursive = (nodeId: string) => {
              const n = state.nodes[nodeId];
              if (n) {
                n.children.forEach(removeRecursive);
                delete state.nodes[nodeId];
              }
            };

            const parentId = node.parentId;
            const list =
              parentId === null
                ? state.rootIds
                : state.nodes[parentId].children;
            const idx = list.indexOf(id);
            if (idx !== -1) list.splice(idx, 1);

            removeRecursive(id);

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
            ): string => {
              const sourceNode = state.nodes[nodeId];
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
                children: [],
              };

              state.nodes[newId] = newNode;

              newNode.children = sourceNode.children.map((childId) =>
                cloneRecursive(childId, newId),
              );

              return newId;
            };

            const newRootId = cloneRecursive(id, originalNode.parentId);

            const parentId = originalNode.parentId;
            const list =
              parentId === null
                ? state.rootIds
                : state.nodes[parentId].children;
            const originalIndex = list.indexOf(id);

            if (originalIndex !== -1) {
              list.splice(originalIndex + 1, 0, newRootId);
            }

            state.selectedId = newRootId;
          });
        },

        setDropIndicator: (value) => set({ dropIndicator: value }),
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
      version: 1,
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
