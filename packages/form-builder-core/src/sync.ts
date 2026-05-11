import type { Field } from "@buildnbuzz/form-core";

type UnknownRecord = Record<string, unknown>;

// =============================================================================
// SCHEMA SIGNATURE
// =============================================================================

/**
 * Computes a deterministic signature based on field structure and default values.
 * Changes to these properties trigger a form sync; cosmetic changes do not.
 */
export function computeSchemaSignature(
  fields: readonly Field[],
  defaultValues: UnknownRecord,
): string {
  const paths = collectSchemaPaths(fields);
  paths.sort();

  // Include defaults hash so changes to default values trigger sync
  return paths.join("|") + "||" + stableStringify(defaultValues);
}

function collectSchemaPaths(fields: readonly Field[], basePath = ""): string[] {
  const paths: string[] = [];

  for (const field of fields) {
    if ("name" in field && typeof field.name === "string" && field.name) {
      const fieldPath = basePath ? `${basePath}.${field.name}` : field.name;
      paths.push(fieldPath);

      if (
        field.type === "group" &&
        "fields" in field &&
        Array.isArray(field.fields)
      ) {
        paths.push(
          ...collectSchemaPaths(field.fields as readonly Field[], fieldPath),
        );
      }

      if (
        field.type === "array" &&
        "fields" in field &&
        Array.isArray(field.fields)
      ) {
        paths.push(
          ...collectSchemaPaths(
            field.fields as readonly Field[],
            `${fieldPath}.*`,
          ),
        );
      }

      continue;
    }

    if ("tabs" in field && Array.isArray(field.tabs)) {
      for (const tab of field.tabs) {
        if (tab.name) {
          paths.push(tab.name as string);
          paths.push(
            ...collectSchemaPaths(
              tab.fields as readonly Field[],
              tab.name as string,
            ),
          );
        } else {
          paths.push(
            ...collectSchemaPaths(tab.fields as readonly Field[], basePath),
          );
        }
      }
      continue;
    }

    if ("fields" in field && Array.isArray(field.fields)) {
      paths.push(
        ...collectSchemaPaths(field.fields as readonly Field[], basePath),
      );
    }
  }

  return paths;
}

/** Deterministic JSON stringify with sorted object keys. */
function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value !== "object") return String(value);
  if (Array.isArray(value)) {
    return "[" + value.map(stableStringify).join(",") + "]";
  }
  const keys = Object.keys(value as UnknownRecord).sort();
  return (
    "{" +
    keys
      .map((k) => `${k}:${stableStringify((value as UnknownRecord)[k])}`)
      .join(",") +
    "}"
  );
}

// =============================================================================
// RUNTIME SYNC
// =============================================================================

/**
 * Syncs runtime values with schema: preserves existing, applies defaults, prunes removed.
 * Pure function, never requires a component remount.
 */
// TODO (#43): Add renameMappings param for path migration
export function syncRuntimeForm(
  currentValues: UnknownRecord,
  nextFields: readonly Field[],
  nextDefaults: UnknownRecord,
): UnknownRecord {
  return syncFieldValues(nextFields, currentValues, nextDefaults);
}

function syncFieldValues(
  fields: readonly Field[],
  currentValues: UnknownRecord,
  defaultValues: UnknownRecord,
): UnknownRecord {
  const result: UnknownRecord = {};

  for (const field of fields) {
    // Named data field
    if ("name" in field && typeof field.name === "string" && field.name) {
      const name = field.name as string;
      const currentVal = currentValues[name];
      const defaultVal = defaultValues[name];

      // Group: recurse
      if (
        field.type === "group" &&
        "fields" in field &&
        Array.isArray(field.fields)
      ) {
        const currentGroup =
          currentVal &&
          typeof currentVal === "object" &&
          !Array.isArray(currentVal)
            ? (currentVal as UnknownRecord)
            : {};
        const defaultGroup =
          defaultVal &&
          typeof defaultVal === "object" &&
          !Array.isArray(defaultVal)
            ? (defaultVal as UnknownRecord)
            : {};

        result[name] = syncFieldValues(
          field.fields as readonly Field[],
          currentGroup,
          defaultGroup,
        );
        continue;
      }

      // Array: always preserve rows
      if (field.type === "array") {
        if (Array.isArray(currentVal)) {
          result[name] = currentVal;
        } else if (Array.isArray(defaultVal)) {
          result[name] = defaultVal;
        } else {
          result[name] = [];
        }
        continue;
      }

      // Leaf: preserve or apply default
      if (currentVal !== undefined) {
        result[name] = currentVal;
      } else if (defaultVal !== undefined) {
        result[name] = defaultVal;
      }

      continue;
    }

    // Tabs
    if ("tabs" in field && Array.isArray(field.tabs)) {
      for (const tab of field.tabs) {
        if (tab.name) {
          const tabName = tab.name as string;
          const currentTab =
            currentValues[tabName] &&
            typeof currentValues[tabName] === "object" &&
            !Array.isArray(currentValues[tabName])
              ? (currentValues[tabName] as UnknownRecord)
              : {};
          const defaultTab =
            defaultValues[tabName] &&
            typeof defaultValues[tabName] === "object" &&
            !Array.isArray(defaultValues[tabName])
              ? (defaultValues[tabName] as UnknownRecord)
              : {};

          result[tabName] = syncFieldValues(
            tab.fields as readonly Field[],
            currentTab,
            defaultTab,
          );
        } else {
          const tabResult = syncFieldValues(
            tab.fields as readonly Field[],
            currentValues,
            defaultValues,
          );
          Object.assign(result, tabResult);
        }
      }
      continue;
    }

    // Layout containers (row, collapsible): merge into scope
    if ("fields" in field && Array.isArray(field.fields)) {
      const nestedResult = syncFieldValues(
        field.fields as readonly Field[],
        currentValues,
        defaultValues,
      );
      Object.assign(result, nestedResult);
    }
  }

  return result;
}
