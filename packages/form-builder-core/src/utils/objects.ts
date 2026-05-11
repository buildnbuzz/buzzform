import {
  fromDotNotation,
  setByPath,
  flattenToPathKeys,
  type Field,
} from "@buildnbuzz/form-core";

/**
 * Deep clone a value to break references to frozen objects.
 * Essential when working with Zustand/immer state.
 */
export function deepClone<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.map(deepClone) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  const obj = value as Record<string, unknown>;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepClone(obj[key]);
    }
  }

  return result as unknown as T;
}

/**
 * Unflattens form values with dot notation (e.g., { "props.foo": "bar" })
 * into a nested object structure.
 *
 * Leverages form-core's JSON Pointer logic for consistency.
 */
export function unflattenFormValues(
  values: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const key in values) {
    const value = values[key];
    const pointer = fromDotNotation(key);

    // setByPath creates intermediate objects/arrays automatically
    setByPath(result, pointer, deepClone(value));
  }

  return result;
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
    const field = f as unknown as Record<string, unknown>;
    if ("fields" in field && Array.isArray(field.fields)) {
      (field.fields as Field[]).forEach(walk);
    }
    if ("tabs" in field && Array.isArray(field.tabs)) {
      for (const tab of field.tabs as { fields: Field[] }[]) {
        tab.fields.forEach(walk);
      }
    }
  };

  fields.forEach(walk);
  return paths;
}

/**
 * Ensures parent objects exist for all nested paths in a values object.
 */
export function ensureNestedParents(
  values: Record<string, unknown>,
  paths: string[],
): void {
  for (const path of paths) {
    const parts = path.split(".");
    let current = values;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!;
      const existing = current[part];

      if (!(part in current) || existing === null || existing === undefined) {
        current[part] = {};
      } else if (typeof existing === "object" && !Array.isArray(existing)) {
        // Break references to frozen objects from Zustand/immer
        current[part] = { ...(existing as object) };
      }
      current = current[part] as Record<string, unknown>;
    }
  }
}

/**
 * Flattens field props into dot-notation values for the properties editor.
 */
export function flattenFieldToFormValues(
  field: Field,
  propertyConfig?: Field[],
): Record<string, unknown> {
  const base: Record<string, unknown> = {};
  const f = field as unknown as Record<string, unknown>;

  for (const [key, value] of Object.entries(f)) {
    if (key === "children" || key === "fields" || key === "type") continue;
    base[key] = deepClone(value);
  }

  const flattened = flattenToPathKeys(base);

  if (propertyConfig) {
    const nestedPaths = collectNestedPaths(propertyConfig);
    ensureNestedParents(flattened, nestedPaths);
  }

  return flattened;
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
 * Extract default values from field definitions.
 */
export function extractDefaults(fields: Field[]): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  for (const field of fields) {
    const f = field as unknown as Record<string, unknown>;
    const name = f.name;
    if (typeof name === "string" && name) {
      if (f.type === "array") {
        const explicitDefault = f.defaultValue;
        defaults[name] = Array.isArray(explicitDefault)
          ? deepClone(explicitDefault)
          : [];
        continue;
      }

      if ("defaultValue" in f) {
        defaults[name] = deepClone(f.defaultValue);
      }

      if ("fields" in f && Array.isArray(f.fields)) {
        const existing = defaults[name];
        defaults[name] = {
          ...(typeof existing === "object" && existing !== null
            ? existing
            : {}),
          ...extractDefaults(f.fields as Field[]),
        };
      }
    } else if ("tabs" in f && Array.isArray(f.tabs)) {
      for (const tab of f.tabs as { name?: string; fields: Field[] }[]) {
        const tabDefaults = extractDefaults(tab.fields);
        const tabName = tab.name;
        if (tabName) {
          const existing = defaults[tabName];
          defaults[tabName] = {
            ...(typeof existing === "object" && existing !== null
              ? existing
              : {}),
            ...tabDefaults,
          };
        } else {
          Object.assign(defaults, tabDefaults);
        }
      }
    } else if ("fields" in f && Array.isArray(f.fields)) {
      Object.assign(defaults, extractDefaults(f.fields as Field[]));
    }
  }

  return defaults;
}
