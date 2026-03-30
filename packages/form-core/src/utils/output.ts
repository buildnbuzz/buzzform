import type { OutputConfig } from "../types";

/** Flatten a nested object into single-level path-delimited keys. */
export function flattenToPathKeys(
  data: Record<string, unknown>,
  delimiter = ".",
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  flatten(data, delimiter, "", result);
  return result;
}

/** Expand path-delimited keys back into a nested object. */
export function expandPathKeys(
  data: Record<string, unknown>,
  delimiter = ".",
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const segments = splitEscaped(key, delimiter).map((segment) =>
      unescapeKey(segment, delimiter),
    );

    let current = result;
    for (let i = 0; i < segments.length - 1; i += 1) {
      const segment = segments[i]!;
      if (!(segment in current) || !isPlainObject(current[segment])) {
        current[segment] = {};
      }
      current = current[segment] as Record<string, unknown>;
    }

    const lastSegment = segments[segments.length - 1];
    if (lastSegment !== undefined) {
      current[lastSegment] = value;
    }
  }

  return result;
}

/**
 * Transform form data into the configured output shape.
 * When no config is provided, the input is returned unchanged.
 */
export function transformFormOutput(
  data: unknown,
  config?: OutputConfig,
): unknown {
  if (!config || config.type !== "path") {
    return data;
  }

  if (!isPlainObject(data)) {
    return data;
  }

  return flattenToPathKeys(data, config.delimiter ?? ".");
}

function flatten(
  data: Record<string, unknown>,
  delimiter: string,
  prefix: string,
  result: Record<string, unknown>,
): void {
  for (const [key, value] of Object.entries(data)) {
    const escapedKey = escapeKey(key, delimiter);
    const path = prefix ? `${prefix}${delimiter}${escapedKey}` : escapedKey;

    if (isPlainObject(value)) {
      flatten(value, delimiter, path, result);
    } else {
      result[path] = value;
    }
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function escapeKey(key: string, delimiter: string): string {
  return key
    .replace(/\\/g, "\\\\")
    .replaceAll(delimiter, `\\${delimiter}`);
}

function unescapeKey(segment: string, delimiter: string): string {
  let result = "";

  for (let i = 0; i < segment.length; i += 1) {
    const char = segment[i]!;

    if (char === "\\") {
      const next = segment[i + 1];
      if (next === "\\") {
        result += "\\";
        i += 1;
        continue;
      }

      if (segment.startsWith(delimiter, i + 1)) {
        result += delimiter;
        i += delimiter.length;
        continue;
      }
    }

    result += char;
  }

  return result;
}

function splitEscaped(value: string, delimiter: string): string[] {
  if (!delimiter) return [value];

  const result: string[] = [];
  let current = "";

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i]!;

    if (char === "\\") {
      const next = value[i + 1];
      if (next === "\\") {
        current += "\\";
        i += 1;
        continue;
      }

      if (value.startsWith(delimiter, i + 1)) {
        current += delimiter;
        i += delimiter.length;
        continue;
      }
    }

    if (value.startsWith(delimiter, i)) {
      result.push(current);
      current = "";
      i += delimiter.length - 1;
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}
