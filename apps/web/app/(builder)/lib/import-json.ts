import { nanoid } from "nanoid";
import { z } from "zod";
import { getTabSlotKeys } from "./node-children";
import {
  fromBuilderDocument,
  parseBuilderDocumentJson,
  SerializableFieldSchema,
  type BuilderDocumentState,
  type SerializableField,
} from "./persistence";
import type { Node } from "./types";

const BuzzFormSchemaArraySchema = z.array(SerializableFieldSchema);

const BuzzFormSchemaObjectSchema = z
  .object({
    fields: BuzzFormSchemaArraySchema,
    formName: z.string().optional(),
  })
  .passthrough();

export type ImportPayloadFormat = "builder-backup" | "buzzform-schema";

export type ParsedImportPayload = {
  format: ImportPayloadFormat;
  state: BuilderDocumentState;
};

export type ParseImportedFormJsonOptions = {
  formNameHint?: string;
};

export function parseImportedFormJson(
  json: string,
  options: ParseImportedFormJsonOptions = {},
): ParsedImportPayload {
  try {
    const builderDocument = parseBuilderDocumentJson(json);
    return {
      format: "builder-backup",
      state: fromBuilderDocument(builderDocument),
    };
  } catch {
    // Fall through and attempt BuzzForm schema import.
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Invalid JSON document.");
  }

  const schemaArrayResult = BuzzFormSchemaArraySchema.safeParse(parsed);
  if (schemaArrayResult.success) {
    return {
      format: "buzzform-schema",
      state: fieldsToBuilderState(
        schemaArrayResult.data,
        normalizeFormName(options.formNameHint),
      ),
    };
  }

  const schemaObjectResult = BuzzFormSchemaObjectSchema.safeParse(parsed);
  if (schemaObjectResult.success) {
    return {
      format: "buzzform-schema",
      state: fieldsToBuilderState(
        schemaObjectResult.data.fields,
        normalizeFormName(schemaObjectResult.data.formName) ??
          normalizeFormName(options.formNameHint),
      ),
    };
  }

  throw new Error(
    "Unsupported JSON format. Provide a BuzzForm Builder backup or BuzzForm schema.",
  );
}

function fieldsToBuilderState(
  fields: SerializableField[],
  formNameHint?: string,
): BuilderDocumentState {
  const nodes: Record<string, Node> = {};

  const rootIds = fields.map((field) =>
    appendFieldNode(nodes, field, null, null),
  );

  return {
    nodes,
    rootIds,
    formId: nanoid(),
    formName: formNameHint ?? "Imported Form",
  };
}

function appendFieldNode(
  nodes: Record<string, Node>,
  field: SerializableField,
  parentId: string | null,
  parentSlot: string | null,
): string {
  const nodeId = nanoid();
  const node: Node = {
    id: nodeId,
    field: toNodeField(field) as Node["field"],
    parentId,
    parentSlot,
    children: [],
  };

  nodes[nodeId] = node;

  if (field.type === "tabs") {
    const slots = getTabSlotKeys(field.tabs);
    const tabChildren: Record<string, string[]> = {};

    field.tabs.forEach((tab, index) => {
      const slot = slots[index] ?? `__tab_${index}`;
      tabChildren[slot] = tab.fields.map((childField) =>
        appendFieldNode(nodes, childField, nodeId, slot),
      );
    });

    if (Object.keys(tabChildren).length > 0) {
      node.tabChildren = tabChildren;
    }

    return nodeId;
  }

  if (hasNestedFields(field)) {
    node.children = field.fields.map((childField) =>
      appendFieldNode(nodes, childField, nodeId, null),
    );
  }

  return nodeId;
}

function toNodeField(field: SerializableField): SerializableField {
  if (field.type === "tabs") {
    return {
      ...deepClone(field),
      tabs: field.tabs.map((tab) => ({
        ...deepClone(tab),
        fields: [],
      })),
    };
  }

  if (hasNestedFields(field)) {
    return {
      ...deepClone(field),
      fields: [],
    };
  }

  return deepClone(field);
}

type NestedFieldsContainer = Extract<
  SerializableField,
  { type: "group" | "array" | "row" | "collapsible" }
>;

function hasNestedFields(field: SerializableField): field is NestedFieldsContainer {
  return (
    "fields" in field &&
    Array.isArray((field as { fields?: unknown }).fields)
  );
}

function deepClone<T>(value: T): T {
  if (typeof globalThis.structuredClone === "function") {
    try {
      return globalThis.structuredClone(value);
    } catch {
      // Fall through to JSON clone.
    }
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeFormName(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
