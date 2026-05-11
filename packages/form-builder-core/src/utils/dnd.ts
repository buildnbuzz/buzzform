import type { Field, Tab } from "@buildnbuzz/form-core";
import { isContainerType } from "@buildnbuzz/form-core";

import type { Node } from "../types";
import { getChildList, getNodeChildren, getTabSlotKeys } from "../node-children";

export type { DropLocation } from "../types";
import type { DropLocation } from "../types";

/**
 * Computes the target drop location within the node tree for a dragged item.
 *
 * @param nodes — flat adjacency list of all nodes
 * @param rootIds — top-level node IDs
 * @param overId — ID of the node being hovered over (or `"root"` for the canvas root)
 * @param position — relative placement: `"before"`, `"after"`, or `"inside"`
 */
export function getDropLocation(
  nodes: Record<string, Node>,
  rootIds: string[],
  overId: string,
  position: "before" | "after" | "inside",
): DropLocation | null {
  if (overId === "root") {
    return { parentId: null, parentSlot: null, index: rootIds.length };
  }

  const overNode = nodes[overId];
  if (!overNode) return null;

  // Drop inside a container
  if (position === "inside" && isContainerType(overNode.field.type)) {
    const parentSlot = resolveSlotKey(overNode.field, null);
    const insideSiblings = getChildList(nodes, rootIds, overId, parentSlot);

    return {
      parentId: overId,
      parentSlot,
      index: insideSiblings.length,
    };
  }

  // Drop before/after a sibling
  const parentId = overNode.parentId;
  const parentSlot = overNode.parentSlot ?? null;
  const siblings = getChildList(nodes, rootIds, parentId, parentSlot);
  const overIndex = siblings.indexOf(overId);

  return {
    parentId,
    parentSlot,
    index: position === "before" ? overIndex : overIndex + 1,
  };
}

/**
 * Returns whether a child of `childType` can be dropped into a parent of
 * `parentType`.
 *
 * - `parentType === null` means the canvas root (accepts anything).
 * - `"row"` only accepts leaf fields (no nested containers).
 * - All other containers accept any field type.
 */
export function canDrop(
  parentType: Field["type"] | null,
  childType: Field["type"] | undefined,
): boolean {
  if (!childType) return false;
  if (parentType === null) return true;

  // Row only accepts data fields, not nested containers
  if (parentType === "row") {
    return !isContainerType(childType);
  }

  // group, array, collapsible, tabs accept anything
  return true;
}

/**
 * Returns `true` if `descendantId` is nested anywhere under `ancestorId`.
 */
export function isDescendant(
  nodes: Record<string, Node>,
  ancestorId: string,
  descendantId: string,
): boolean {
  const ancestor = nodes[ancestorId];
  if (!ancestor) return false;

  const children = getNodeChildren(ancestor);
  if (children.includes(descendantId)) return true;

  return children.some((id) => isDescendant(nodes, id, descendantId));
}

/**
 * Converts a free-form string into a URL-safe filename slug.
 */
export function toSafeFileName(input: string): string {
  const normalized = input.trim().toLowerCase();
  const slug = normalized
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || "form";
}

/**
 * Resolves the target slot key for a container node.
 * Non-tab containers always return `__default__`.
 * Tab containers return the first tab's slot key (or fallback).
 */
function resolveSlotKey(
  field: Field,
  parentSlot: string | null,
): string | null {
  if (field.type !== "tabs") return null;

  const tabSlots = getTabSlotKeys(field.tabs as readonly Pick<Tab, "name">[]);
  return parentSlot ?? tabSlots[0] ?? null;
}
