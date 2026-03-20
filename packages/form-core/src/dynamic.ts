import type { DynamicValue } from "./types";
import { getByPath } from "./utils/path";

/**
 * Resolve a DynamicValue using form data and optional context.
 */
export function resolveDynamicValue<T>(
  value: DynamicValue<T> | undefined,
  formData: Record<string, unknown>,
  contextData?: Record<string, unknown>,
): T | undefined {
  if (value === undefined) return undefined;

  if (typeof value === "object" && value !== null) {
    if ("$data" in value) {
      return getByPath(formData, value.$data) as T | undefined;
    }
    if ("$context" in value) {
      return getByPath(contextData ?? {}, value.$context) as T | undefined;
    }
  }

  return value as T;
}
