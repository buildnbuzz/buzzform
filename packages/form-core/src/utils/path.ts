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
  if (pointer === "" || pointer === "/") return obj;
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
  if (pointer === "" || pointer === "/") return;
  if (!pointer.startsWith("/")) return;

  const parts = splitPointer(pointer);
  if (parts.length === 0) return;

  let current: Record<string, unknown> | unknown[] = target;

  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i]!;
    const nextKey = parts[i + 1]!;
    const nextIsIndex = isArraySegment(nextKey);

    if (Array.isArray(current)) {
      if (key === "-") {
        const index = current.length;
        current[index] = nextIsIndex ? [] : {};
        current = current[index] as Record<string, unknown> | unknown[];
        continue;
      }

      if (isArraySegment(key)) {
        const index = Number(key);
        const existing = current[index];
        if (existing === null || typeof existing !== "object") {
          current[index] = nextIsIndex ? [] : {};
        }
        current = current[index] as Record<string, unknown> | unknown[];
        continue;
      }

      const arrayRecord = current as unknown as Record<string, unknown>;
      const existing = arrayRecord[key];
      if (existing === null || typeof existing !== "object") {
        arrayRecord[key] = nextIsIndex ? [] : {};
      }
      current = arrayRecord[key] as Record<string, unknown> | unknown[];
      continue;
    }

    const existing = current[key];
    if (existing === null || typeof existing !== "object") {
      current[key] = nextIsIndex ? [] : {};
    }
    current = current[key] as Record<string, unknown> | unknown[];
  }

  const lastKey = parts[parts.length - 1]!;
  if (Array.isArray(current)) {
    if (lastKey === "-") {
      current.push(value);
      return;
    }

    if (isArraySegment(lastKey)) {
      current[Number(lastKey)] = value;
      return;
    }

    (current as unknown as Record<string, unknown>)[lastKey] = value;
    return;
  }

  current[lastKey] = value;
}

/** Escape a JSON Pointer segment. */
export function escapePointer(segment: string): string {
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}

/**
 * Join a base pointer with an optional segment, skipping empty segments.
 */
export function joinPointer(basePointer: string, segment?: string): string {
  if (!segment) return basePointer;
  const escaped = escapePointer(segment);
  if (basePointer === "") return `/${escaped}`;
  return `${basePointer}/${escaped}`;
}

/** Convert a JSON Pointer path into dot notation. */
export function toDotNotation(pointer: string): string {
  if (pointer === "" || pointer === "/") return "";
  if (!pointer.startsWith("/")) return pointer;
  return splitPointer(pointer).join(".");
}

/** Convert a dot-notation path into a JSON Pointer path. */
export function fromDotNotation(path: string): string {
  if (path === "") return "/";
  if (path.startsWith("/")) return path;
  return `/${path.split(".").join("/")}`;
}

/** Replace numeric array indices with "*" for schema path matching. */
export function normalizeArrayIndicesToWildcard(pointer: string): string {
  if (pointer === "") return pointer;
  if (!pointer.startsWith("/")) return pointer;

  return `/${splitPointer(pointer)
    .map((part) => {
      const index = Number(part);
      return Number.isInteger(index) && index >= 0 ? "*" : escapePointer(part);
    })
    .join("/")}`;
}

/** Split a JSON Pointer into unescaped path segments. */
export function splitPointer(pointer: string): string[] {
  return pointer
    .split("/")
    .slice(1)
    .map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"));
}

function isArraySegment(segment: string): boolean {
  const index = Number(segment);
  return Number.isInteger(index) && index >= 0;
}
