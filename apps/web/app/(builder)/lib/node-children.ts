import type { Tab, TabsField } from "@buildnbuzz/buzzform";
import type { Node } from "./types";

const TAB_SLOT_FALLBACK_PREFIX = "__tab_";

function normalizeTabName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getTabSlotKeys(tabs: readonly Pick<Tab, "name">[]): string[] {
  const used = new Set<string>();

  return tabs.map((tab, index) => {
    const base = normalizeTabName(tab.name) ?? `${TAB_SLOT_FALLBACK_PREFIX}${index}`;
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

function isTabsFieldType(field: Node["field"]): field is TabsField {
  return field.type === "tabs";
}

export function getNodeChildren(node: Node): string[] {
  if (!isTabsFieldType(node.field)) return node.children;

  const allIds: string[] = [...node.children];
  if (node.tabChildren) {
    for (const ids of Object.values(node.tabChildren)) {
      allIds.push(...ids);
    }
  }
  return [...new Set(allIds)];
}

export function getChildList(
  nodes: Record<string, Node>,
  rootIds: string[],
  parentId: string | null,
  parentSlot: string | null = null,
): string[] {
  if (parentId === null) return rootIds;

  const parentNode = nodes[parentId];
  if (!parentNode) return [];

  if (!isTabsFieldType(parentNode.field)) {
    return parentNode.children;
  }

  const slots = getTabSlotKeys(parentNode.field.tabs);
  const fallbackSlot = slots[0] ?? `${TAB_SLOT_FALLBACK_PREFIX}0`;
  const resolvedSlot = parentSlot ?? fallbackSlot;

  return parentNode.tabChildren?.[resolvedSlot] ?? [];
}

export function ensureChildList(
  nodes: Record<string, Node>,
  rootIds: string[],
  parentId: string | null,
  parentSlot: string | null = null,
): { list: string[]; resolvedSlot: string | null } {
  if (parentId === null) {
    return { list: rootIds, resolvedSlot: null };
  }

  const parentNode = nodes[parentId];
  if (!parentNode) {
    return { list: [], resolvedSlot: parentSlot };
  }

  if (!isTabsFieldType(parentNode.field)) {
    return { list: parentNode.children, resolvedSlot: null };
  }

  const slots = getTabSlotKeys(parentNode.field.tabs);
  const fallbackSlot = slots[0] ?? `${TAB_SLOT_FALLBACK_PREFIX}0`;
  const resolvedSlot = parentSlot ?? fallbackSlot;

  if (!parentNode.tabChildren) {
    parentNode.tabChildren = {};
  }

  if (!parentNode.tabChildren[resolvedSlot]) {
    parentNode.tabChildren[resolvedSlot] = [];
  }

  return {
    list: parentNode.tabChildren[resolvedSlot],
    resolvedSlot,
  };
}
