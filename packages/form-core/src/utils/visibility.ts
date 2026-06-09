import type {
  ExprContext,
  FieldInput,
  RowField,
  CollapsibleField,
  TabsField,
  GroupField,
  ArrayField,
  ExprBoolean,
} from "../types";
import { resolveExpr } from "../expr";

/**
 * Filter fields based on `condition` and `hidden` flags.
 *
 * - `condition`: removes fields entirely (not present in output)
 * - `hidden`: keeps fields but marks them invisible
 */
export function getVisibleFields(
  fields: readonly FieldInput[],
  ctx: ExprContext,
): FieldInput[] {
  const result: FieldInput[] = [];

  for (const field of fields) {
    const isMounted = resolveExpr<boolean>(field.condition as ExprBoolean | undefined, ctx) ?? true;
    if (!isMounted) continue;

    const isHidden = !resolveExpr<boolean>(field.hidden as ExprBoolean | undefined, ctx);

    switch (field.type) {
      case "row":
      case "collapsible": {
        const f = field as RowField | CollapsibleField;
        result.push({
          ...f,
          hidden: isHidden || f.hidden,
          fields: getVisibleFields(f.fields, ctx),
        });
        break;
      }

      case "tabs": {
        const f = field as TabsField;
        result.push({
          ...f,
          hidden: isHidden || f.hidden,
          tabs: f.tabs.map((tab) => ({
            ...tab,
            fields: getVisibleFields(tab.fields, ctx),
          })),
        });
        break;
      }

      case "group": {
        const f = field as GroupField;
        result.push({
          ...f,
          hidden: isHidden || f.hidden,
          fields: getVisibleFields(f.fields, ctx),
        });
        break;
      }

      case "array": {
        const f = field as ArrayField;
        const hidden = isHidden || f.hidden;

        if (f.primitive) {
          // Primitive arrays have exactly one child field — no visibility filtering needed.
          result.push({ ...f, hidden });
          break;
        }

        result.push({
          ...f,
          hidden,
          fields: getVisibleFields(f.fields, ctx),
        });
        break;
      }

      default:
        result.push({ ...field, hidden: isHidden || field.hidden });
        break;
    }
  }

  return result;
}
