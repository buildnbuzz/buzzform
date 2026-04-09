import { useMemo } from "react";
import { getByPath } from "@buildnbuzz/form-core";
import type { UnknownData } from "../../types";

/**
 * Creates a stable store selector that extracts values for a list of JSON Pointer paths.
 * Returns the exact same array instance if no values have changed, preventing unnecessary re-renders.
 *
 * @param deps Array of JSON Pointer paths to extract.
 */
export function useDependenciesSelector(deps: string[]) {
  return useMemo(() => {
    let prev: unknown[] | undefined;

    return (state: { values: UnknownData }) => {
      if (deps.length === 0) return [];
      if (!prev || prev.length !== deps.length) {
        const next = deps.map((path) => getByPath(state.values, path));
        prev = next;
        return next;
      }

      let next: unknown[] | undefined;
      for (let i = 0; i < deps.length; i += 1) {
        const value = getByPath(state.values, deps[i]!);
        if (!next) {
          if (Object.is(value, prev[i])) continue;
          next = prev.slice();
        }
        next[i] = value;
      }

      if (!next) return prev;
      prev = next;
      return next;
    };
  }, [deps]);
}
