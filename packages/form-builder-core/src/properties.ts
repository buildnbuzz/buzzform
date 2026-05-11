import type { Field } from "@buildnbuzz/form-core";
import { getByPath, walkFields } from "@buildnbuzz/form-core";

// ---------------------------------------------------------------------------
// deepClone
// ---------------------------------------------------------------------------

/**
 * Deep-clones a value, breaking frozen object references from Zustand/immer.
 */
export function deepClone<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(deepClone) as T;
  const result: Record<string, unknown> = {};
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      result[key] = deepClone((value as Record<string, unknown>)[key]);
    }
  }
  return result as T;
}

// ---------------------------------------------------------------------------
// extractPropertyEditorDefaults
// ---------------------------------------------------------------------------

/**
 * Extracts default values from a property editor config to pre-fill the
 * properties panel form.
 *
 * Unlike `extractDefaults` from `@buildnbuzz/form-core` (which extracts
 * form data initial values), this extracts defaults *from the config
 * itself* — i.e. what each property editor field should default to.
 */
export function extractPropertyEditorDefaults(
  fields: Field[],
): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const field of fields) {
    if ("name" in field && typeof field.name === "string") {
      if (field.defaultValue !== undefined) {
        defaults[field.name] = deepClone(field.defaultValue);
      }
    }
    if ("fields" in field && Array.isArray(field.fields)) {
      Object.assign(defaults, extractPropertyEditorDefaults(field.fields));
    }
    if ("tabs" in field && Array.isArray(field.tabs)) {
      for (const tab of field.tabs) {
        Object.assign(
          defaults,
          extractPropertyEditorDefaults(tab.fields),
        );
      }
    }
  }
  return defaults;
}

// ---------------------------------------------------------------------------
// sanitizeFieldConstraints
// ---------------------------------------------------------------------------

/**
 * Sanitises range constraints so that min never exceeds max.
 * Removes the lower bound when an invalid pairing is detected.
 */
export function sanitizeFieldConstraints<T extends Record<string, unknown>>(
  field: T,
): T {
  const result = { ...field };

  type RangePair = [string, string];
  const pairs: RangePair[] = [
    ["minLength", "maxLength"],
    ["min", "max"],
    ["minTags", "maxTags"],
    ["minSelected", "maxSelected"],
    ["minFiles", "maxFiles"],
    ["minRows", "maxRows"],
  ];

  for (const [minKey, maxKey] of pairs) {
    if (minKey in result && maxKey in result) {
      const min = result[minKey] as number | undefined;
      const max = result[maxKey] as number | undefined;
      if (min !== undefined && max !== undefined && min > max) {
        delete result[minKey];
      }
    }
  }

  // Date/datetime: minDate must not be after maxDate
  if ("minDate" in result && "maxDate" in result) {
    const min = result.minDate as string | Date | undefined;
    const max = result.maxDate as string | Date | undefined;
    if (min && max) {
      const minTime = new Date(min).getTime();
      const maxTime = new Date(max).getTime();
      if (!isNaN(minTime) && !isNaN(maxTime) && minTime > maxTime) {
        delete result.minDate;
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// sanitizeFieldDefaults
// ---------------------------------------------------------------------------

/**
 * Ensures `defaultValue` stays in sync with `options` for option-based
 * fields. Clears invalid defaults when options are removed or changed.
 */
export function sanitizeFieldDefaults<T extends Record<string, unknown>>(
  field: T,
): T {
  const options = (field as Record<string, unknown>).options;
  if (!Array.isArray(options)) return field;

  const optionValues = options
    .map((opt) =>
      typeof opt === "string" ? opt : (opt as { value?: unknown }).value,
    )
    .filter((val) => val !== undefined && val !== null && val !== "");

  if (optionValues.length === 0) {
    if ("defaultValue" in field) {
      (field as Record<string, unknown>).defaultValue = undefined;
    }
    return field;
  }

  const defaultValue = (field as Record<string, unknown>).defaultValue;
  if (
    defaultValue === undefined ||
    defaultValue === null ||
    defaultValue === ""
  )
    return field;

  if (Array.isArray(defaultValue)) {
    const filtered = defaultValue.filter((val) =>
      optionValues.some((opt) => opt === val),
    );
    (field as Record<string, unknown>).defaultValue =
      filtered.length > 0 ? filtered : undefined;
    return field;
  }

  const isValid = optionValues.some((opt) => opt === defaultValue);
  if (!isValid) {
    (field as Record<string, unknown>).defaultValue = undefined;
  }

  return field;
}

// ---------------------------------------------------------------------------
// flattenFieldToFormValues
// ---------------------------------------------------------------------------

/**
 * Flattens a `Field` into a flat key-value map for the properties editor.
 *
 * Skips structural keys (`type`, `fields`, `tabs`). Pre-creates parent
 * objects for dot-notation paths found in `propertyConfig`.
 */
export function flattenFieldToFormValues(
  field: Field,
  propertyConfig?: Field[],
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(field)) {
    if (key === "type" || key === "fields") continue;
    values[key] = deepClone(value);
  }

  if (propertyConfig) {
    const nestedPaths = collectNestedPaths(propertyConfig);
    ensureNestedParents(values, nestedPaths);
  }

  return values;
}

// ---------------------------------------------------------------------------
// collectNestedPaths
// ---------------------------------------------------------------------------

/**
 * Collects every field name containing dot-notation from a property config.
 *
 * Uses `walkFields` from `@buildnbuzz/form-core` for tree traversal.
 */
export function collectNestedPaths(fields: Field[]): string[] {
  const paths: string[] = [];

  walkFields(fields, (field) => {
    if ("name" in field && typeof field.name === "string" && field.name.includes(".")) {
      paths.push(field.name);
    }
  });

  return paths;
}

// ---------------------------------------------------------------------------
// ensureNestedParents
// ---------------------------------------------------------------------------

/**
 * Ensures parent objects exist for dot-notation paths.
 * E.g. `"criteria.requireLowercase"` → ensures `values.criteria` is an object.
 */
function ensureNestedParents(
  values: Record<string, unknown>,
  paths: string[],
): void {
  for (const path of paths) {
    const parts = path.split(".");
    let current = values;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (part === undefined) continue;
      if (!(part in current) || current[part] === null || current[part] === undefined) {
        current[part] = {};
      } else if (typeof current[part] === "object" && !Array.isArray(current[part])) {
        current[part] = deepClone(current[part]);
      }
      current = current[part] as Record<string, unknown>;
    }
  }
}

// ---------------------------------------------------------------------------
// unflattenFormValues
// ---------------------------------------------------------------------------

/**
 * Unflattens dot-notation keys into a nested object.
 * `{ "criteria.requireLowercase": true }` → `{ criteria: { requireLowercase: true } }`
 */
export function unflattenFormValues(
  values: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const key in values) {
    const parts = key.split(".");
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (part === undefined) continue;
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    const value = values[key];
    const lastPart = parts[parts.length - 1];
    if (lastPart !== undefined) {
      current[lastPart] =
        value && typeof value === "object" ? deepClone(value) : value;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// generateSchemaKey
// ---------------------------------------------------------------------------

/**
 * Generates a stable string key for a field array to detect structural changes.
 *
 * Only tracks properties that require form re-initialisation: `type`, `name`,
 * `defaultValue`, and tab names.
 */
export function generateSchemaKey(fields: Field[]): string {
  const parts: string[] = [];

  walkFields(fields, (field) => {
    parts.push(field.type);
    if ("name" in field && typeof field.name === "string") parts.push(field.name);
    if ("defaultValue" in field) {
      parts.push(String((field as unknown as Record<string, unknown>).defaultValue ?? ""));
    }
  });

  // Also collect tab names (walkFields doesn't descend into tabs)
  const collectTabNames = (f: Field) => {
    if ("tabs" in f && Array.isArray(f.tabs)) {
      for (const tab of f.tabs) {
        if (tab.name) parts.push(tab.name);
        tab.fields.forEach(collectTabNames);
      }
    }
  };
  fields.forEach(collectTabNames);

  return parts.join("|");
}

// ---------------------------------------------------------------------------
// getNestedValue (delegates to form-core)
// ---------------------------------------------------------------------------

/**
 * Retrieves a nested value from an object using a dot-notation path.
 * Delegates to `getByPath` from `@buildnbuzz/form-core`.
 */
export function getNestedValue(
  obj: Record<string, unknown>,
  path: string,
): unknown {
  // Convert dot notation to JSON Pointer
  const pointer = path.split(".").map((s) => s.replace(/~/g, "~0").replace(/\//g, "~1")).join("/");
  return getByPath(obj, `/${pointer}`);
}
