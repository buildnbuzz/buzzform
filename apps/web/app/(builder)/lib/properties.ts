import { type Field } from "@buildnbuzz/buzzform";

/**
 * Deep clone a value to break references to frozen objects.
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

/**
 * Extract default values from field definitions.
 * Deep clones values to avoid frozen object references from Zustand/immer.
 */
export function extractDefaults(fields: Field[]): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const field of fields) {
    if ("name" in field && field.name) {
      if ("defaultValue" in field) {
        // Deep clone to avoid frozen object references from Zustand/immer
        defaults[field.name] = deepClone(
          (field as unknown as Record<string, unknown>).defaultValue,
        );
      }
      if ("fields" in field && Array.isArray(field.fields)) {
        defaults[field.name] = {
          ...(defaults[field.name] as object),
          ...extractDefaults(field.fields),
        };
      }
    } else if ("tabs" in field && Array.isArray(field.tabs)) {
      for (const tab of field.tabs) {
        const tabDefaults = extractDefaults(tab.fields);
        if (tab.name) {
          defaults[tab.name] = {
            ...(defaults[tab.name] as object),
            ...tabDefaults,
          };
        } else {
          Object.assign(defaults, tabDefaults);
        }
      }
    } else if ("fields" in field && Array.isArray(field.fields)) {
      Object.assign(defaults, extractDefaults(field.fields));
    }
  }
  return defaults;
}

/**
 * Sanitizes field constraints to prevent invalid min/max combinations.
 */
export function sanitizeFieldConstraints<T extends Record<string, unknown>>(
  field: T,
): T {
  const result = { ...field };

  // Text fields: minLength/maxLength
  if ("minLength" in result && "maxLength" in result) {
    const min = result.minLength as number | undefined;
    const max = result.maxLength as number | undefined;
    if (min !== undefined && max !== undefined && min > max) {
      delete result.minLength;
    }
  }

  // Number fields: min/max
  if ("min" in result && "max" in result) {
    const min = result.min as number | undefined;
    const max = result.max as number | undefined;
    if (min !== undefined && max !== undefined && min > max) {
      delete result.min;
    }
  }

  // Tags fields: minTags/maxTags
  if ("minTags" in result && "maxTags" in result) {
    const min = result.minTags as number | undefined;
    const max = result.maxTags as number | undefined;
    if (min !== undefined && max !== undefined && min > max) {
      delete result.minTags;
    }
  }

  // Checkbox group fields: minSelected/maxSelected
  if ("minSelected" in result && "maxSelected" in result) {
    const min = result.minSelected as number | undefined;
    const max = result.maxSelected as number | undefined;
    if (min !== undefined && max !== undefined && min > max) {
      delete result.minSelected;
    }
  }

  // Upload fields: minFiles/maxFiles
  if ("minFiles" in result && "maxFiles" in result) {
    const min = result.minFiles as number | undefined;
    const max = result.maxFiles as number | undefined;
    if (min !== undefined && max !== undefined && min > max) {
      delete result.minFiles;
    }
  }

  // Date/datetime fields: minDate/maxDate
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

/**
 * Ensure defaultValue stays in sync with options for option-based fields.
 * Clears invalid defaults when options are removed/changed.
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

/**
 * Flattens field props to form values for the properties editor.
 * Excludes structural props like children, fields, and type.
 * Deep clones values to avoid frozen object references from Zustand/immer.
 *
 * @param field - The field to flatten
 * @param propertyConfig - Optional property config to pre-create parent objects for nested paths
 */
export function flattenFieldToFormValues(
  field: Field,
  propertyConfig?: Field[],
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(field)) {
    if (key === "children" || key === "fields" || key === "type") continue;
    // Deep clone to break frozen object references
    values[key] = deepClone(value);
  }

  // Pre-create parent objects for nested paths from property config
  if (propertyConfig) {
    const nestedPaths = collectNestedPaths(propertyConfig);
    ensureNestedParents(values, nestedPaths);
  }

  return values;
}

/**
 * Collects all field names with dot-notation from a property config.
 */
export function collectNestedPaths(fields: Field[]): string[] {
  const paths: string[] = [];

  const walk = (f: Field) => {
    if ("name" in f && typeof f.name === "string" && f.name.includes(".")) {
      paths.push(f.name);
    }
    if ("fields" in f && Array.isArray(f.fields)) {
      f.fields.forEach(walk);
    }
    if ("tabs" in f && Array.isArray(f.tabs)) {
      for (const tab of f.tabs) {
        tab.fields.forEach(walk);
      }
    }
  };

  fields.forEach(walk);
  return paths;
}

/**
 * Ensures parent objects exist for all nested paths.
 * For example, if paths include "criteria.requireLowercase",
 * this ensures `values.criteria` is an extensible object.
 */
function ensureNestedParents(
  values: Record<string, unknown>,
  paths: string[],
): void {
  for (const path of paths) {
    const parts = path.split(".");
    // Skip the last part (the actual field name), only create parents
    let current = values;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (
        !(part in current) ||
        current[part] === null ||
        current[part] === undefined
      ) {
        // Create a new extensible object
        current[part] = {};
      } else if (
        typeof current[part] === "object" &&
        !Array.isArray(current[part])
      ) {
        // If it exists but might be frozen, deep clone it to make it extensible
        current[part] = deepClone(current[part]);
      }
      current = current[part] as Record<string, unknown>;
    }
  }
}

/**
 * Unflattens form values with dot notation (e.g., { "props.foo": "bar" })
 * into a nested object structure (e.g., { props: { foo: "bar" } }).
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
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = values[key];
  }

  return result;
}

/**
 * Generate a stable key for field arrays to detect structural changes.
 * Only tracks properties that require form re-initialization:
 * - type, name (structure)
 * - defaultValue (RHF only applies on mount)
 * Uses string concatenation instead of JSON.stringify for efficiency.
 */
export function generateSchemaKey(fields: Field[]): string {
  const parts: string[] = [];

  const walk = (f: Field) => {
    parts.push(f.type);
    if ("name" in f) parts.push(f.name);
    if ("defaultValue" in f)
      parts.push(
        String((f as unknown as Record<string, unknown>).defaultValue ?? ""),
      );

    if ("fields" in f && Array.isArray(f.fields)) f.fields.forEach(walk);
    if ("tabs" in f && Array.isArray(f.tabs)) {
      for (const tab of f.tabs) {
        if (tab.name) parts.push(tab.name);
        tab.fields.forEach(walk);
      }
    }
  };

  fields.forEach(walk);
  return parts.join("|");
}

/**
 * Get a nested value from an object using dot notation path.
 */
export function getNestedValue(
  obj: Record<string, unknown>,
  path: string,
): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && acc !== null) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Ensures parent objects in the form values are mutable (not frozen).
 * This is needed when working with Zustand/immer frozen objects.
 */
export function ensureMutableParents(
  form: {
    getValues: () => unknown;
    setValue: (
      name: string,
      value: unknown,
      opts?: { shouldDirty?: boolean },
    ) => void;
  },
  path: string,
): void {
  const parts = path.split(".");
  if (parts.length <= 1) return;

  const values = form.getValues() as Record<string, unknown>;

  for (let depth = 0; depth < parts.length - 1; depth++) {
    const parentPath = parts.slice(0, depth + 1).join(".");
    const parentValue = getNestedValue(values, parentPath);

    if (parentValue === undefined || parentValue === null) {
      form.setValue(parentPath, {}, { shouldDirty: false });
    } else if (
      typeof parentValue === "object" &&
      Object.isFrozen(parentValue)
    ) {
      form.setValue(parentPath, deepClone(parentValue), { shouldDirty: false });
    }
  }
}
