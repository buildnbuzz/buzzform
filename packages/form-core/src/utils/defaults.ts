import type { FieldInput, ExprContext, FnRegistry } from "../types";
import { walkFields } from "./walk";
import { escapePointer, setByPath } from "./path";
import { resolveExpr } from "../expr";

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

/**
 * Extract default values from a field array.
 * Uses explicit `field.defaultValue` when set (resolved via Expr system),
 * otherwise falls back to a type-appropriate zero-value.
 */
export function extractDefaults(
  fields: readonly FieldInput[],
  context?: Record<string, unknown>,
  fns?: FnRegistry,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  walkFields(
    fields,
    (field, ctx) => {
      if (!("name" in field) || typeof field.name !== "string") return;
      if (ctx.parents.some((parent) => parent.type === "array")) return;

      const fullPath = ctx.path
        ? `${ctx.path}/${escapePointer(field.name)}`
        : `/${escapePointer(field.name)}`;

      const f = field as FieldInput & { defaultValue?: unknown };
      const exprCtx: ExprContext = { data: result, context };

      const resolved = resolveExpr(f.defaultValue, exprCtx, fns, {
        resolveArrays: true,
      });

      if (resolved !== undefined) {
        setByPath(result, fullPath, resolved);
        return;
      }

      // Fallback to zero-values
      if (f.type === "array") {
        setByPath(result, fullPath, []);
        return;
      }

      if (f.type === "group") {
        return;
      }

      let val: unknown;
      if (f.type === "upload") {
        val = f.hasMany === true ? [] : null;
      } else if (f.type === "checkbox" && "tristate" in f && f.tristate === true) {
        val = null;
      } else {
        val = ZERO_VALUES[f.type] ?? "";
      }

      setByPath(result, fullPath, val);
    },
    { arrayItemPath: "container" },
  );

  return result;
}
