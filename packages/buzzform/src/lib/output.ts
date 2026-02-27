import type { OutputConfig } from "../types";

/**
 * Transform form data into the configured output shape.
 *
 * NOTE: The input data (typically from RHF with GroupField) is already nested.
 * - 'flat' / 'nested' → pass through as-is (already nested)
 * - 'path' → flatten nested object into path-delimited keys
 */
export function transformFormOutput<TData>(
  data: TData,
  config?: OutputConfig,
): TData {
  if (!config || config.type !== "path") {
    return data;
  }

  if (typeof data !== "object" || data === null) {
    return data;
  }

  return flattenToPathKeys(
    data as Record<string, unknown>,
    config.delimiter ?? ".",
  ) as TData;
}

/**
 * Flatten a nested object into single-level keys using a delimiter.
 * Leaf values (primitives, arrays, Date, File, etc.) are NOT traversed.
 */
function flattenToPathKeys(
  data: Record<string, unknown>,
  delimiter: string,
  prefix = "",
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const path = prefix ? `${prefix}${delimiter}${key}` : key;

    if (isPlainObject(value)) {
      Object.assign(
        result,
        flattenToPathKeys(value as Record<string, unknown>, delimiter, path),
      );
    } else {
      result[path] = value;
    }
  }

  return result;
}

/**
 * Check if a value is a plain object.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
