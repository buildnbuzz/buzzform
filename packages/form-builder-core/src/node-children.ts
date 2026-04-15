import type { Tab } from "@buildnbuzz/form-core";

import type { Node } from "./types";

const TAB_SLOT_FALLBACK_PREFIX = "__tab_";

/** Shared default slot key for non-tab containers. */
export const DEFAULT_SLOT = "__default__";

function normalizeTabName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Computes unique slot keys for a tabs field's tab definitions.
 *
 * Uses the tab's `name` property when available, falling back to
 * `__tab_0`, `__tab_1`, etc. Appends numeric suffixes to resolve
 * duplicate names.
 */
export function getTabSlotKeys(tabs: readonly Pick<Tab, "name">[]): string[] {
  const used = new Set<string>();

  return tabs.map((tab, index) => {
    const base =
      normalizeTabName(tab.name) ?? `${TAB_SLOT_FALLBACK_PREFIX}${index}`;
    let key = base;
    let suffix = 1;

    while (used.has(key)) {
      key = `${base}_${suffix}`;
      suffix += 1;
    }

    used.add(key);
    return key;
  });
}

/**
 * Returns the child IDs of a node across all slots.
 *
 * For non-tab containers this returns the `"__default__"` slot's array.
 * For tabs it flattens every named slot into one list.
 */
export function getNodeChildren(node: Node): string[] {
  const allIds: string[] = [];
  for (const ids of Object.values(node.children)) {
    allIds.push(...ids);
  }
  return allIds;
}

/**
 * Returns all slot keys used by a node.
 *
 * Non-tab containers return a single `"__default__"` key. Tab containers
 * return keys derived from the tab definitions (via `getTabSlotKeys`).
 */
export function getSlotKeys(node: Node): string[] {
  return Object.keys(node.children);
}

/**
 * Returns a read-only reference to the child list for a given parent node
 * and slot.
 *
 * When `parentId` is `null`, returns the `rootIds` array. For tab
 * containers, `parentSlot` selects the named tab's child list. For
 * all other containers the slot is ignored in favour of `"__default__"`.
 *
 * Use `ensureChildList` when you need to mutate the list.
 */
export function getChildList(
  nodes: Record<string, Node>,
  rootIds: string[],
  parentId: string | null,
  parentSlot: string | null = null,
): readonly string[] {
  if (parentId === null) return rootIds;

  const parentNode = nodes[parentId];
  if (!parentNode) return [];

  const resolvedSlot = resolveSlotKey(parentNode, parentSlot);
  return parentNode.children[resolvedSlot] ?? [];
}

/**
 * Returns a new child list for a given parent node and slot,
 * and the resolved slot key.
 *
 * *Does not mutate the node.* Callers must update the node's `children` dictionary.
 */
export function ensureChildList(
  nodes: Record<string, Node>,
  rootIds: string[],
  parentId: string | null,
  parentSlot: string | null = null,
): { list: string[]; resolvedSlot: string } {
  if (parentId === null) {
    return { list: [...rootIds], resolvedSlot: DEFAULT_SLOT };
  }

  const parentNode = nodes[parentId];
  if (!parentNode) {
    return { list: [], resolvedSlot: parentSlot ?? DEFAULT_SLOT };
  }

  const resolvedSlot = resolveSlotKey(parentNode, parentSlot);
  const existingList = parentNode.children[resolvedSlot];

  return {
    list: existingList ? [...existingList] : [],
    resolvedSlot,
  };
}

function resolveSlotKey(node: Node, parentSlot: string | null): string {
  // Non-tab containers (group, array, row, collapsible) use a single slot.
  if (node.field.type !== "tabs") {
    return DEFAULT_SLOT;
  }

  // Tab containers use the first available tab slot as fallback.
  const tabSlots = getTabSlotKeys(node.field.tabs);
  const fallbackSlot = tabSlots[0] ?? `${TAB_SLOT_FALLBACK_PREFIX}0`;
  return parentSlot ?? fallbackSlot;
}
