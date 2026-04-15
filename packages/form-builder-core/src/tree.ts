import { nanoid } from "nanoid";
import type { TabsField, Field } from "@buildnbuzz/form-core";
import type { Node } from "./types";
import { ensureChildList, getNodeChildren, getTabSlotKeys } from "./node-children";
import { sanitizeFieldDefaults } from "./properties";

export interface TreeState {
  nodes: Record<string, Node>;
  rootIds: string[];
}

/** Merges an object recursively without mutating. */
function mergeUpdates<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target } as unknown as Record<string, unknown>;
  const keys = Object.keys(source) as Array<keyof T>;
  for (const key of keys) {
    const sourceValue = source[key];
    const targetValue = result[key as string];

    if (
      sourceValue && typeof sourceValue === "object" && !Array.isArray(sourceValue) &&
      targetValue && typeof targetValue === "object" && !Array.isArray(targetValue)
    ) {
      result[key as string] = mergeUpdates(targetValue as object, sourceValue as object);
    } else if (sourceValue === undefined) {
      delete result[key as string];
    } else {
      result[key as string] = sourceValue;
    }
  }
  return result as T;
}

export function removeNodeTree(state: TreeState, nodeId: string): TreeState {
  const node = state.nodes[nodeId];
  if (!node) return state;

  const nextNodes = { ...state.nodes };
  
  function recurseRemove(id: string) {
    const n = nextNodes[id];
    if (!n) return;
    const children = getNodeChildren(n);
    for (const childId of children) {
      recurseRemove(childId);
    }
    delete nextNodes[id];
  }

  recurseRemove(nodeId);

  // Remove from parent
  let nextRootIds = state.rootIds;
  if (node.parentId === null) {
    nextRootIds = nextRootIds.filter((id) => id !== nodeId);
  } else {
    const parentNode = nextNodes[node.parentId];
    if (parentNode) {
      const slot = node.parentSlot ?? "__default__";
      const slotList = parentNode.children[slot] || [];
      nextNodes[node.parentId] = {
        ...parentNode,
        children: {
          ...parentNode.children,
          [slot]: slotList.filter((id) => id !== nodeId),
        },
      };
    }
  }

  return { nodes: nextNodes, rootIds: nextRootIds };
}

export function insertNode(
  state: TreeState,
  node: Node,
  index: number,
): TreeState {
  const nextNodes = { ...state.nodes, [node.id]: node };
  let nextRootIds = [...state.rootIds];

  const { list, resolvedSlot } = ensureChildList(nextNodes, nextRootIds, node.parentId, node.parentSlot);
  
  const newList = [...list];
  newList.splice(index, 0, node.id);

  // Attach to parent or root
  if (node.parentId === null) {
    nextRootIds = newList;
  } else {
    const parent = nextNodes[node.parentId];
    if (parent) {
      nextNodes[node.parentId] = {
        ...parent,
        children: {
          ...parent.children,
          [resolvedSlot]: newList,
        },
      };
    }
  }

  nextNodes[node.id] = { ...node, parentSlot: resolvedSlot };
  return { nodes: nextNodes, rootIds: nextRootIds };
}

export function moveNode(
  state: TreeState,
  id: string,
  newParentId: string | null,
  index: number,
  newParentSlot: string | null = null,
): TreeState {
  const node = state.nodes[id];
  if (!node) return state;

  const oldParentId = node.parentId;
  const oldParentSlot = node.parentSlot;
  
  const nextNodes = { ...state.nodes };
  let nextRootIds = [...state.rootIds];

  // 1. Remove from old list
  const { list: oldList, resolvedSlot: oldResolvedSlot } = ensureChildList(state.nodes, state.rootIds, oldParentId, oldParentSlot);
  const oldIdx = oldList.indexOf(id);
  const nextOldList = [...oldList];
  if (oldIdx !== -1) {
    nextOldList.splice(oldIdx, 1);
  }

  if (oldParentId === null) {
    nextRootIds = nextOldList;
  } else {
    const p = nextNodes[oldParentId]!;
    nextNodes[oldParentId] = {
      ...p,
      children: { ...p.children, [oldResolvedSlot]: nextOldList },
    };
  }

  // 2. Adjust index if same list
  let insertIdx = index;
  if (oldParentId === newParentId && oldParentSlot === newParentSlot && oldIdx !== -1 && oldIdx < index) {
    insertIdx -= 1;
  }

  // 3. Insert to new list
  const { list: newList, resolvedSlot: newResolvedSlot } = ensureChildList(nextNodes, nextRootIds, newParentId, newParentSlot);
  const nextNewList = [...newList];
  nextNewList.splice(insertIdx, 0, id);

  if (newParentId === null) {
    nextRootIds = nextNewList;
  } else {
    const p = nextNodes[newParentId]!;
    nextNodes[newParentId] = {
      ...p,
      children: { ...p.children, [newResolvedSlot]: nextNewList },
    };
  }

  // 4. Update node pointer
  nextNodes[id] = {
    ...node,
    parentId: newParentId,
    parentSlot: newResolvedSlot,
  };

  return { nodes: nextNodes, rootIds: nextRootIds };
}

export function duplicateNode(
  state: TreeState,
  id: string,
): { state: TreeState; newId: string | null } {
  const originalNode = state.nodes[id];
  if (!originalNode) return { state, newId: null };

  const nextNodes = { ...state.nodes };

  function cloneRecursive(nodeId: string, newParentId: string | null, newParentSlot: string | null): string | null {
    const sourceNode = state.nodes[nodeId];
    if (!sourceNode) return null;
    
    const newId = nanoid();
    const newField = { ...sourceNode.field };

    if ("name" in newField && typeof newField.name === "string") {
      const baseName = newField.name;
      let newName = `${baseName}_copy`;
      let counter = 1;
      const isNameTaken = (n: string) => Object.values(nextNodes).some(node => "name" in node.field && node.field.name === n);
      while (isNameTaken(newName)) {
        newName = `${baseName}_copy_${counter}`;
        counter++;
      }
      (newField as Extract<Field, { name: string }>).name = newName;
    }

    const newNode: Node = {
      id: newId,
      field: newField,
      parentId: newParentId,
      parentSlot: newParentSlot,
      children: {},
    };

    nextNodes[newId] = newNode;

    const sourceSlots = Object.keys(sourceNode.children);
    for (const slot of sourceSlots) {
      newNode.children[slot] = (sourceNode.children[slot] || [])
        .map(childId => cloneRecursive(childId, newId, slot))
        .filter(Boolean) as string[];
    }

    return newId;
  }

  const newRootId = cloneRecursive(id, originalNode.parentId, originalNode.parentSlot);
  if (!newRootId) return { state, newId: null };

  // Insert the clone below the original
  const { list: parentList } = ensureChildList(state.nodes, state.rootIds, originalNode.parentId, originalNode.parentSlot);
  const originalIndex = parentList.indexOf(id);
  const insertIndex = originalIndex !== -1 ? originalIndex + 1 : parentList.length;

  return {
    state: insertNode(
      { nodes: nextNodes, rootIds: state.rootIds },
      nextNodes[newRootId]!,
      insertIndex
    ),
    newId: newRootId,
  };
}

export function updateNode(
  state: TreeState,
  id: string,
  updates: Partial<Node["field"]>,
): TreeState {
  const node = state.nodes[id];
  if (!node) return state;

  const previousTabs = node.field.type === "tabs" ? [...(node.field as TabsField).tabs] : null;

  const nextField = mergeUpdates(node.field, updates);
  sanitizeFieldDefaults(nextField as unknown as Record<string, unknown>);

  const nextNode: Node = { ...node, field: nextField as Field };
  let nextState: TreeState = { nodes: { ...state.nodes, [id]: nextNode }, rootIds: state.rootIds };

  if (nextNode.field.type === "tabs" && previousTabs) {
    nextState = syncTabsChildren(nextState, id, previousTabs);
    // Sanitize default tab (logic simplified for core)
    const tabs = (nextNode.field as TabsField).tabs;
    if (tabs && tabs.length > 0 && !tabs.some(t => t.name === nextNode.field.ui?.defaultTab)) {
        if (!nextNode.field.ui) nextNode.field.ui = {};
        nextNode.field.ui.defaultTab = tabs[0]?.name ?? 0;
    }
  }

  return nextState;
}

function syncTabsChildren(state: TreeState, nodeId: string, previousTabs: TabsField["tabs"]): TreeState {
  const node = state.nodes[nodeId];
  if (!node || node.field.type !== "tabs") return state;

  const nextTabs = node.field.tabs;
  const prevSlots = getTabSlotKeys(previousTabs);
  const nextSlots = getTabSlotKeys(nextTabs);
  const prevChildren = node.children;
  const nextChildren: Record<string, string[]> = {};

  const usedPreviousIndexes = new Set<number>();
  const previousNameToIndex = new Map<string, number>();

  previousTabs.forEach((tab, index) => {
    const name = typeof tab.name === "string" ? tab.name.trim() : "";
    if (name && !previousNameToIndex.has(name)) previousNameToIndex.set(name, index);
  });

  nextTabs.forEach((tab, index) => {
    const nextSlot = nextSlots[index]!;
    const nextName = typeof tab.name === "string" ? tab.name.trim() : "";
    let sourceIndex = -1;
    const nameMatchIndex = nextName ? previousNameToIndex.get(nextName) : undefined;

    if (typeof nameMatchIndex === "number" && !usedPreviousIndexes.has(nameMatchIndex)) {
      sourceIndex = nameMatchIndex;
    } else if (index < prevSlots.length && !usedPreviousIndexes.has(index)) {
      sourceIndex = index;
    }

    if (sourceIndex !== -1) {
      usedPreviousIndexes.add(sourceIndex);
      const sourceSlot = prevSlots[sourceIndex]!;
      nextChildren[nextSlot] = [...(prevChildren[sourceSlot] ?? [])];
    } else {
      nextChildren[nextSlot] = [];
    }
  });

  const assignedIds = new Set<string>();
  for (const slot of nextSlots) {
    for (const childId of nextChildren[slot] ?? []) assignedIds.add(childId);
  }

  const orphanedIds: string[] = [];
  for (const sourceIds of Object.values(prevChildren)) {
    for (const childId of sourceIds) {
      if (!assignedIds.has(childId)) orphanedIds.push(childId);
    }
  }

  if (nextSlots.length > 0 && orphanedIds.length > 0) {
    nextChildren[nextSlots[0]!]!.push(...orphanedIds);
  }

  let nextState = { ...state, nodes: { ...state.nodes, [nodeId]: { ...node, children: nextChildren } } };

  if (nextSlots.length === 0) {
    for (const childId of orphanedIds) {
      nextState = removeNodeTree(nextState, childId);
    }
    return nextState;
  }

  for (const [slot, ids] of Object.entries(nextChildren)) {
    for (const childId of ids) {
      const childNode = nextState.nodes[childId];
      if (childNode) {
        nextState.nodes[childId] = { ...childNode, parentId: nodeId, parentSlot: slot };
      }
    }
  }

  return nextState;
}
