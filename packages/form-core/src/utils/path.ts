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

  const parts = splitPointer(pointer);

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

/**
 * Set a value at a JSON Pointer path, creating objects/arrays as needed.
 */
export function setByPath(
  target: Record<string, unknown>,
  pointer: string,
  value: unknown,
): void {
  if (pointer === "") return;
  if (!pointer.startsWith("/")) return;

  const parts = splitPointer(pointer);
  if (parts.length === 0) return;

  let current: unknown = target;

  for (let i = 0; i < parts.length; i += 1) {
    const key = parts[i]!;
    const isLast = i === parts.length - 1;

    if (Array.isArray(current)) {
      const index = Number(key);
      if (!Number.isInteger(index) || index < 0) return;

      if (isLast) {
        current[index] = value as never;
        return;
      }

      if (current[index] === undefined || current[index] === null) {
        const nextKey = parts[i + 1]!;
        const nextIsIndex = Number.isInteger(Number(nextKey));
        current[index] = nextIsIndex ? [] : {};
      }

      current = current[index] as unknown;
      continue;
    }

    const container = current as Record<string, unknown>;

    if (isLast) {
      container[key] = value;
      return;
    }

    if (container[key] === undefined || container[key] === null) {
      const nextKey = parts[i + 1]!;
      const nextIsIndex = Number.isInteger(Number(nextKey));
      container[key] = nextIsIndex ? [] : {};
    }

    current = container[key] as unknown;
  }
}

/** Escape a JSON Pointer segment. */
export function escapePointer(segment: string): string {
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}

function splitPointer(pointer: string): string[] {
  return pointer
    .split("/")
    .slice(1)
    .map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"));
}
