import { useMemo } from "react";
import { useStore } from "@tanstack/react-form";
import type { Field } from "@buildnbuzz/form-core";
import { walkFields, toDotNotation, fromDotNotation, escapePointer } from "@buildnbuzz/form-core";
import { useFieldContext } from "../field-context";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Collects dot-notation names of all data (leaf) fields in a field subtree,
 * resolved relative to `basePath` (dot-notation).
 *
 * Delegates traversal to `walkFields` from `form-core`, which correctly
 * handles all container types (row, collapsible, tabs, group, array).
 *
 * @internal
 */
export function collectDataFieldNames(
  fields: readonly Field[],
  basePath: string,
): string[] {
  const basePointer = basePath ? fromDotNotation(basePath) : "";
  const names: string[] = [];

  const isLayoutField = (field: Field) =>
    field.type === "row" ||
    field.type === "tabs" ||
    field.type === "collapsible" ||
    field.type === "ui";

  walkFields(fields, (field, ctx) => {
    if (isLayoutField(field)) return;
    const fieldPointer =
      "name" in field && typeof field.name === "string" && field.name.length > 0
        ? ctx.path
          ? `${ctx.path}/${escapePointer(field.name)}`
          : `/${escapePointer(field.name)}`
        : ctx.path;
    const fullPointer = basePointer ? `${basePointer}${fieldPointer}` : fieldPointer;
    names.push(toDotNotation(fullPointer));
  });

  return names;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns the number of nested data fields that currently have at least one
 * validation error, scoped to the provided `fields` subtree.
 *
 * Reads directly from `form.store.state.fieldMeta` so it stays in sync with
 * TanStack Form's validation state without requiring a subscription.
 *
 * Intended for container fields that render an error-count badge (collapsible,
 * tabs, array, group). Must be called inside a `<LayoutField>` or `<Field>`
 * context.
 *
 * @param fields - The direct children of the container field schema.
 * @param basePath - Dot-notation path prefix for the container (use
 *   `toDotNotation(fieldPath)` from `useLayoutField`). Defaults to `""`.
 */
export function useNestedErrorCount(
  fields: readonly Field[],
  basePath = "",
): number {
  const { form } = useFieldContext();

  const fieldNames = useMemo(
    () => collectDataFieldNames(fields, basePath),
    // fields reference is stable from schema; basePath changes only on re-mount
    [fields, basePath],
  );

  type FieldMetaEntry = {
    errors?: unknown[];
    isTouched?: boolean;
    isDirty?: boolean;
    isValid?: boolean;
  };

  type FormStateSnapshot = {
    fieldMeta: Record<string, FieldMetaEntry | undefined>;
    submissionAttempts?: number;
  };

  return useStore(form.store, (state: FormStateSnapshot) => {
    const submissionAttempts = state.submissionAttempts ?? 0;

    let count = 0;
    for (const name of fieldNames) {
      const meta = state.fieldMeta[name];
      if (!meta?.errors?.length) continue;
      const shouldShow = meta.isTouched || meta.isDirty || submissionAttempts > 0;
      if (shouldShow && !meta.isValid) count++;
    }
    return count;
  });
}
