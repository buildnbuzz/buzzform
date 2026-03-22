import type { Field } from "../types";
import { walkFields } from "./walk";
import { escapePointer, setByPath } from "./path";

/** Zero-values by field type — used when no explicit defaultValue is set. */
const ZERO_VALUES: Record<string, unknown> = {
  text: "",
  textarea: "",
  number: 0,
  select: "",
  radio: "",
  checkbox: false,
  switch: false,
  array: [],
};

/** Returns true if a value is a static literal (not a $data/$context ref). */
function isStaticValue(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return true;
  return !("$data" in value || "$context" in value);
}

/**
 * Extract default values from a field array.
 * Uses explicit `field.defaultValue` when set, otherwise falls back to
 * a type-appropriate zero-value ("" for text, 0 for number, etc.).
 */
export function extractDefaults(fields: readonly Field[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  walkFields(
    fields,
    (field, ctx) => {
      if (!("name" in field) || typeof field.name !== "string") return;

      const fullPath = ctx.path
        ? `${ctx.path}/${escapePointer(field.name)}`
        : `/${escapePointer(field.name)}`;

      const f = field as Field & { defaultValue?: unknown };

      if (f.type === "array") {
        let val: unknown = [];
        if (f.defaultValue !== undefined && isStaticValue(f.defaultValue)) {
          val = f.defaultValue;
        }
        setByPath(result, fullPath, val);
        return;
      }

      if (f.type === "group") {
        if (f.defaultValue !== undefined && isStaticValue(f.defaultValue)) {
          setByPath(result, fullPath, f.defaultValue);
        }
        return;
      }

      let val: unknown = ZERO_VALUES[f.type] ?? "";
      if (f.defaultValue !== undefined && isStaticValue(f.defaultValue)) {
        val = f.defaultValue;
      }

      setByPath(result, fullPath, val);
    },
    { arrayItemPath: "container" },
  );

  return result;
}
