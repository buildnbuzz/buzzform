import type { ExprContext, Field } from "../types";
import { resolveExpr } from "../expr";

/**
 * Filter fields based on `condition` and `hidden` flags.
 *
 * - `condition`: removes fields entirely (not present in output)
 * - `hidden`: keeps fields but marks them invisible
 */
export function getVisibleFields(
  fields: readonly Field[],
  ctx: ExprContext,
): Field[] {
  const result: Field[] = [];

  for (const field of fields) {
    const isMounted = resolveExpr<boolean>(field.condition, ctx) ?? true;
    if (!isMounted) continue;

    const isHidden = !resolveExpr<boolean>(field.hidden, ctx);

    switch (field.type) {
      case "row":
      case "collapsible": {
        result.push({
          ...field,
          hidden: isHidden || field.hidden,
          fields: getVisibleFields(field.fields, ctx),
        });
        break;
      }

      case "tabs": {
        result.push({
          ...field,
          hidden: isHidden || field.hidden,
          tabs: field.tabs.map((tab) => ({
            ...tab,
            fields: getVisibleFields(tab.fields, ctx),
          })),
        });
        break;
      }

      case "group": {
        result.push({
          ...field,
          hidden: isHidden || field.hidden,
          fields: getVisibleFields(field.fields, ctx),
        });
        break;
      }

      case "array": {
        const hidden = isHidden || field.hidden;

        if (field.primitive) {
          // Primitive arrays have exactly one child field — no visibility filtering needed.
          result.push({ ...field, hidden });
          break;
        }

        result.push({
          ...field,
          hidden,
          fields: getVisibleFields(field.fields, ctx),
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
