import { nanoid } from "nanoid";
import type { Field } from "@buildnbuzz/form-core";
import { DEFAULT_SLOT, getTabSlotKeys } from "./node-children";
import type { Node } from "./types";
import { migrateLegacySchema } from "./migration";

export interface ParsedImportPayload {
  state: {
    nodes: Record<string, Node>;
    rootIds: string[];
    formId: string;
    formName: string;
    outputConfig?: unknown;
  };
  warnings?: string[];
}

export interface ParseImportedFormJsonOptions {
  /** Hint for the form name when the input doesn't include one. */
  formNameHint?: string;
}

/**
 * Detects the format of a pasted JSON string and returns a normalised
 * payload ready for import.
 *
 * Accepts a `FormSchema` JSON string (`{ fields: [...] }`).
 * Note: Support for legacy `builder-backup` format has been dropped.
 *
 * @throws {Error} When the JSON is malformed or missing fields.
 */
export function parseImportedFormJson(
  json: string,
  options: ParseImportedFormJsonOptions = {},
): ParsedImportPayload {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Invalid JSON document.");
  }

  if (Array.isArray(parsed)) {
    parsed = { fields: parsed, title: options.formNameHint || "Imported Form" };
  }

  if (!isBuzzFormSchema(parsed)) {
    throw new Error(
      "Unrecognised document format. Expected a FormSchema with a 'fields' array, or a raw array of fields.",
    );
  }

  const { schema, warnings } = migrateLegacySchema(parsed);
  const obj = schema as unknown as Record<string, unknown>;
  const fieldsArray = obj.fields as Field[];

  const { nodes, rootIds } = fieldsToBuilderState(fieldsArray);

  const formName =
    normalizeFormName(obj.title) ??
    normalizeFormName(options.formNameHint) ??
    "Imported Form";

  return {
    state: {
      nodes,
      rootIds,
      formName,
      formId: typeof obj.id === "string" ? obj.id : nanoid(),
      outputConfig: obj.output,
    },
    warnings,
  };
}

function isBuzzFormSchema(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "fields" in value &&
    Array.isArray((value as Record<string, unknown>).fields)
  );
}

function normalizeFormName(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Recursively converts a nested `Field[]` array into a flat adjacency list
 * of nodes and a list of root node IDs, used internally by the builder store.
 *
 * Container fields (`group`, `array`, `row`, `collapsible`, `tabs`) are stripped
 * of their nested fields during this process, moving their children into the
 * `children` map on the respective Node object.
 */
export function fieldsToBuilderState(fields: readonly Field[]): {
  nodes: Record<string, Node>;
  rootIds: string[];
} {
  const nodes: Record<string, Node> = {};
  const rootIds: string[] = [];
  const usedNames = new Set<string>();

  function processField(
    field: Field,
    parentId: string | null,
    parentSlot: string | null,
  ): string {
    const id = nanoid();
    const node: Node = {
      id,
      field: { ...field }, // Shallow copy to avoid mutating the original input
      parentId,
      parentSlot,
      children: {},
    };

    // Handle name collisions to prevent shared state between unrelated fields
    const fieldObj = node.field as unknown as Record<string, unknown>;
    if (typeof fieldObj.name === "string" && fieldObj.name) {
      let uniqueName = fieldObj.name;
      let counter = 1;
      while (usedNames.has(uniqueName)) {
        uniqueName = `${fieldObj.name}_${counter++}`;
      }
      fieldObj.name = uniqueName;
      usedNames.add(uniqueName);
    }

    const type = node.field.type;

    // Handle nested container types (group, array, row, collapsible)
    if (
      type === "group" ||
      type === "array" ||
      type === "row" ||
      type === "collapsible"
    ) {
      // Cast safely since we checked the type
      const containerField = node.field as unknown as {
        fields?: readonly Field[];
      };
      const childFields = containerField.fields;

      // Remove the nested fields array from the node's field payload
      delete containerField.fields;

      if (Array.isArray(childFields)) {
        node.children[DEFAULT_SLOT] = childFields.map((child) =>
          processField(child, id, DEFAULT_SLOT),
        );
      }
    }
    // Handle tabs (which have slots per tab)
    else if (type === "tabs") {
      const tabsField = node.field as unknown as {
        tabs?: { name?: string; fields?: readonly Field[] }[];
      };
      const tabs = tabsField.tabs;

      if (Array.isArray(tabs)) {
        const slots = getTabSlotKeys(tabs);
        // Map over each tab to create slots
        tabsField.tabs = tabs.map((tab, index) => {
          const slot = slots[index]!;
          const tabFields = tab.fields;

          // Shallow copy tab to remove its nested fields
          const strippedTab = { ...tab };
          delete strippedTab.fields;

          if (Array.isArray(tabFields)) {
            node.children[slot] = tabFields.map((child) =>
              processField(child, id, slot),
            );
          }

          return strippedTab;
        });
      }
    }

    nodes[id] = node;
    return id;
  }

  for (const field of fields) {
    if (!field || typeof field !== "object" || !field.type) {
      continue; // Skip malformed or invalid entries gracefully
    }
    rootIds.push(processField(field, null, null));
  }

  return { nodes, rootIds };
}
