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
  let result: Field;

  // Tabs — populate each tab's fields from the corresponding slot.
  if (fieldType === "tabs") {
    const tabs = (node.field as Extract<Field, { type: "tabs" }>).tabs;
    const slots = getTabSlotKeys(tabs);

    result = {
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
  } else if (isContainerType(fieldType) && "fields" in node.field) {
    // Container (group, array, row, collapsible) — populate fields from
    // the default slot.
    const childIds = node.children[DEFAULT_SLOT] ?? [];
    const nestedFields = childIds
      .map((childId) => nodeToField(nodes, childId))
      .filter(Boolean) as Field[];
    result = { ...node.field, fields: nestedFields } as Field;
  } else {
    // Leaf data field — return as-is.
    result = node.field;
  }

  return sanitizeField(result) as Field;
}

/**
 * Removes empty values (null, undefined, "") from a field object.
 * Recursively cleans nested objects and arrays.
 */
function sanitizeField(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "object" ? sanitizeField(item) : item))
      .filter((item) => item !== null && item !== undefined && item !== "");
  }

  if (value !== null && typeof value === "object") {
    const cleaned: Record<string, unknown> = {};
    const obj = value as Record<string, unknown>;

    for (const key in obj) {
      const val = obj[key];

      // Skip empty strings, null, undefined
      if (val === "" || val === null || val === undefined) {
        continue;
      }

      // Preserve fields and tabs structure (already sanitized via recursion)
      if (key === "fields" || key === "tabs") {
        cleaned[key] = val;
        continue;
      }

      // Recursively clean objects and arrays
      if (typeof val === "object") {
        const recursive = sanitizeField(val);
        // Only add if not empty object or array (special cases like empty expressions might need care)
        if (
          recursive !== null &&
          typeof recursive === "object" &&
          Object.keys(recursive).length === 0 &&
          !Array.isArray(recursive)
        ) {
          continue;
        }
        cleaned[key] = recursive;
      } else {
        cleaned[key] = val;
      }
    }
    return cleaned;
  }

  return value;
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
