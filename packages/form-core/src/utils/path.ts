/**
 * Resolve a JSON Pointer (RFC 6901) against an object.
 *
 * @remarks
 * This is intentionally minimal for v0.1. It supports:
 * - leading slash paths ("/user/name")
 * - root pointer "" (returns the object)
 * - unescaping "~1" and "~0"
 */
export function getByPath(obj: unknown, pointer: string): unknown {
  if (pointer === "") return obj;
  if (!pointer.startsWith("/")) return undefined;

  const parts = pointer
    .split("/")
    .slice(1)
    .map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"));

  let current: unknown = obj;

  for (const key of parts) {
    if (current === null || typeof current !== "object") return undefined;

    if (Array.isArray(current)) {
      const index = Number(key);
      if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        return undefined;
      }
      current = current[index];
      continue;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return current;
}
