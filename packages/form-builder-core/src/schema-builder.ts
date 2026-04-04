import type { Field } from "@buildnbuzz/form-core";
import { isContainerType } from "@buildnbuzz/form-core";

import { DEFAULT_SLOT, getTabSlotKeys, getNodeChildren } from "./node-children";
import { isDataField } from "./types";
import type { Node } from "./types";

/**
 * Converts the entire builder node tree into a `Field[]` schema for
 * `@buildnbuzz/form-core`.
 *
 * Maps each root node ID through `nodeToField`, filtering out any entries
 * whose node could not be resolved.
 */
export function nodesToFields(
  nodes: Record<string, Node>,
  rootIds: string[],
): Field[] {
  return rootIds.map((id) => nodeToField(nodes, id)).filter(Boolean) as Field[];
}

/**
 * Converts a single builder node into its `Field` representation,
 * recursively populating nested `fields[]` or `tabs[].fields[]` arrays.
 */
export function nodeToField(
  nodes: Record<string, Node>,
  id: string,
): Field | null {
  const node = nodes[id];
  if (!node) return null;

  const fieldType = node.field.type;

  // Tabs — populate each tab's fields from the corresponding slot.
  if (fieldType === "tabs") {
    const tabs = (node.field as Extract<Field, { type: "tabs" }>).tabs;
    const slots = getTabSlotKeys(tabs);

    return {
      ...node.field,
      tabs: tabs.map((tab, index) => {
        const slotKey = slots[index];
        if (slotKey === undefined) return { ...tab, fields: [] };

        const childIds = node.children[slotKey] ?? [];
        return {
          ...tab,
          fields: childIds
            .map((childId) => nodeToField(nodes, childId))
            .filter(Boolean) as Field[],
        };
      }),
    };
  }

  // Container (group, array, row, collapsible) — populate fields from
  // the default slot.
  if (isContainerType(fieldType) && "fields" in node.field) {
    const childIds = node.children[DEFAULT_SLOT] ?? [];
    return {
      ...node.field,
      fields: childIds
        .map((childId) => nodeToField(nodes, childId))
        .filter(Boolean) as Field[],
    };
  }

  // Leaf data field — return as-is.
  return node.field;
}

/**
 * Extracts every `name` from all data-bearing fields in the node tree.
 *
 * Useful for generating unique names when creating new fields or
 * detecting naming conflicts.
 */
export function getAllFieldNames(
  nodes: Record<string, Node>,
  rootIds: string[],
): Set<string> {
  const names = new Set<string>();

  function traverse(ids: string[]) {
    for (const id of ids) {
      const node = nodes[id];
      if (!node) continue;

      if (isDataField(node.field)) {
        names.add(node.field.name);
      }

      traverse(getNodeChildren(node));
    }
  }

  traverse(rootIds);
  return names;
}
