import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type { Node, FieldType, Viewport, BuilderMode } from './types';
import { builderFieldRegistry } from './registry';

type Store = {
    nodes: Record<string, Node>;
    rootIds: string[];
    selectedId: string | null;

    createNode: (type: FieldType, parentId: string | null, index?: number) => void;
    moveNode: (id: string, newParentId: string | null, index: number) => void;
    selectNode: (id: string | null) => void;
    updateNode: (id: string, updates: Partial<Node['field']>) => void;
    removeNode: (id: string) => void;
    duplicateNode: (id: string) => void;
    dropIndicator: {
        parentId: string | null;
        index: number;
    } | null;
    setDropIndicator: (value: { parentId: string | null; index: number } | null) => void;

    // Canvas State
    mode: BuilderMode;
    setMode: (mode: BuilderMode) => void;
    zoom: number;
    setZoom: (zoom: number) => void;
    viewport: Viewport;
    setViewport: (viewport: Viewport) => void;

};

/**
 * Recursively merges updates into the target object.
 * Preserves nested properties that are not present in the updates.
 */
function mergeUpdates<T extends object>(target: T, source: Partial<T>) {
    const keys = Object.keys(source) as Array<keyof T>;
    for (const key of keys) {
        const sourceValue = source[key];
        const targetValue = target[key];

        // If both are objects (and not arrays), merge recursively
        if (
            sourceValue &&
            typeof sourceValue === 'object' &&
            !Array.isArray(sourceValue) &&
            targetValue &&
            typeof targetValue === 'object' &&
            !Array.isArray(targetValue)
        ) {
            mergeUpdates(targetValue as object, sourceValue as object);
        }
        // Otherwise, if source has a value, overwrite target
        else if (sourceValue !== undefined) {
            target[key] = sourceValue as T[keyof T];
        }
    }
}

export const useBuilderStore = create<Store>()(
    immer((set) => ({
        nodes: {},
        rootIds: [],
        selectedId: null,
        mode: 'edit',
        zoom: 0.9,
        viewport: 'desktop',
        collapsedFields: {},

        createNode: (type, parentId, index = 0) => {
            const id = nanoid();
            const entry = builderFieldRegistry[type];
            if (!entry) return;

            const name = `${type}_${id.slice(0, 4)}`;

            set(state => {
                const fieldProps = entry.kind === 'data'
                    ? { ...entry.defaultProps, name }
                    : { ...entry.defaultProps };

                state.nodes[id] = {
                    id,
                    field: fieldProps as Node['field'],
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
            set(state => {
                const node = state.nodes[id];

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
            set(state => {
                const node = state.nodes[id];
                if (node) {
                    mergeUpdates(node.field, updates);
                }
            });
        },

        removeNode: (id) => {
            set(state => {
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
                const list = parentId === null ? state.rootIds : state.nodes[parentId].children;
                const idx = list.indexOf(id);
                if (idx !== -1) list.splice(idx, 1);

                removeRecursive(id);

                if (state.selectedId === id) {
                    state.selectedId = null;
                }
            });
        },

        duplicateNode: (id) => {
            set(state => {
                const originalNode = state.nodes[id];
                if (!originalNode) return;

                const cloneRecursive = (nodeId: string, newParentId: string | null): string => {
                    const sourceNode = state.nodes[nodeId];
                    const newId = nanoid();

                    // Clone field props
                    const newField = { ...sourceNode.field };

                    // Handle name collision / suffix
                    if ("name" in newField && typeof newField.name === "string") {
                        const baseName = newField.name;
                        let newName = `${baseName}_copy`;
                        let counter = 1;

                        // Check uniqueness against ALL nodes to be safe
                        const isNameTaken = (n: string) =>
                            Object.values(state.nodes).some(node =>
                                "name" in node.field && node.field.name === n
                            );

                        while (isNameTaken(newName)) {
                            newName = `${baseName}_copy_${counter}`;
                            counter++;
                        }
                        (newField as { name: string }).name = newName;
                    }

                    // Create new node
                    const newNode: Node = {
                        id: newId,
                        field: newField,
                        parentId: newParentId,
                        children: [],
                    };

                    // Add to state
                    state.nodes[newId] = newNode;

                    // Clone children
                    newNode.children = sourceNode.children.map(childId =>
                        cloneRecursive(childId, newId)
                    );

                    return newId;
                };

                const newRootId = cloneRecursive(id, originalNode.parentId);

                // Insert into parent list
                const parentId = originalNode.parentId;
                const list = parentId === null ? state.rootIds : state.nodes[parentId].children;
                const originalIndex = list.indexOf(id);

                if (originalIndex !== -1) {
                    list.splice(originalIndex + 1, 0, newRootId);
                }

                state.selectedId = newRootId;
            });
        },

        dropIndicator: null,
        setDropIndicator: (value) => set({ dropIndicator: value }),

        setMode: (mode) => set({ mode }),
        setZoom: (zoom) => set({ zoom }),
        setViewport: (viewport) => set({ viewport }),
    }))
);
