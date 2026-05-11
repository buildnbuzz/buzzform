import type { UnknownData } from "@buildnbuzz/form-core";

/**
 * Current schema version for builder documents.
 * Increment when breaking changes are introduced.
 */
export const CURRENT_SCHEMA_VERSION = 1;

/** Human-readable version label for exported documents. */
export const BUILDER_VERSION = "@buildnbuzz/form-builder@dev";

export class BuilderDocumentMigrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BuilderDocumentMigrationError";
  }
}

type MigrationResult = {
  fields: unknown[];
  formId: string;
  formName: string;
  outputConfig?: UnknownData;
};

type LegacyNode = {
  field: UnknownData;
  children?: Record<string, string[]>;
  tabChildren?: Record<string, string[]>;
};

function isBuilderBackup(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "schemaVersion" in value &&
    "nodes" in value &&
    "rootIds" in value
  );
}

function isBuzzFormSchema(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "fields" in value &&
    Array.isArray((value as { fields?: unknown }).fields)
  );
}

/**
 * Migrates a parsed JSON document into the current schema shape.
 *
 * Accepts both the legacy builder backup format (with `nodes` / `rootIds`)
 * and the modern `FormSchema` shape (with `fields`).
 *
 * @returns An object with `fields` and form metadata ready for import.
 * @throws {BuilderDocumentMigrationError} When the input shape is unrecognised.
 */
export function migrateBuilderDocument(input: unknown): MigrationResult {
  if (isBuilderBackup(input)) {
    return migrateLegacyBackup(input as UnknownData);
  }

  if (isBuzzFormSchema(input)) {
    const obj = input as UnknownData;
    return {
      fields: obj.fields as unknown[],
      formId: typeof obj.id === "string" ? obj.id : "",
      formName:
        typeof obj.title === "string" && obj.title.trim().length > 0
          ? obj.title
          : "",
      outputConfig: obj.output as UnknownData | undefined,
    };
  }

  throw new BuilderDocumentMigrationError(
    "Unrecognised document format. Provide a builder backup or FormSchema.",
  );
}

function migrateLegacyBackup(backup: UnknownData): MigrationResult {
  const nodes = backup.nodes as Record<string, LegacyNode> | undefined;
  const rootIds = backup.rootIds as string[] | undefined;

  if (!nodes || !rootIds) {
    return { fields: [], formId: "", formName: "" };
  }

  const fields = convertNodesToFields(nodes, rootIds);

  return {
    fields,
    formId: typeof backup.formId === "string" ? backup.formId : "",
    formName:
      typeof backup.formName === "string" && backup.formName.trim().length > 0
        ? backup.formName
        : "",
    outputConfig: backup.outputConfig as UnknownData | undefined,
  };
}

/**
 * Recursively converts a legacy Node adjacency list into a nested `fields[]`
 * array. Only preserves the `field` payload — tree structure is derived
 * from the parent/child links.
 */
function convertNodesToFields(
  nodes: Record<string, LegacyNode>,
  rootIds: string[],
): unknown[] {
  return rootIds
    .map((id) => convertNode(nodes, id))
    .filter(Boolean) as unknown[];
}

function convertNode(nodes: Record<string, LegacyNode>, id: string): unknown {
  const node = nodes[id];
  if (!node) return null;

  const field = { ...node.field };
  const fieldType = field.type as string | undefined;

  // Tabs
  if (fieldType === "tabs" && Array.isArray(field.tabs)) {
    const tabs = field.tabs as Array<UnknownData>;
    const tabSlots = tabs.map((_, i) => getFallbackTabSlotKey(i));

    return {
      ...field,
      tabs: tabs.map((tab, index) => {
        const slot = tabSlots[index];
        if (!slot) return { ...tab, fields: [] };

        const slotChildren =
          node.tabChildren?.[slot] ??
          (index === 0 && Array.isArray(node.children)
            ? (node.children as string[])
            : []);

        return {
          ...tab,
          fields: slotChildren
            .map((childId: string) => convertNode(nodes, childId))
            .filter(Boolean),
        };
      }),
    };
  }

  // Containers with nested fields
  if (
    fieldType &&
    ["group", "array", "row", "collapsible"].includes(fieldType)
  ) {
    const slotChildren = node.children?.__default__ ?? [];
    return {
      ...field,
      fields: slotChildren
        .map((childId) => convertNode(nodes, childId))
        .filter(Boolean),
    };
  }

  return field;
}

function getFallbackTabSlotKey(index: number): string {
  return `__tab_${index}`;
}
