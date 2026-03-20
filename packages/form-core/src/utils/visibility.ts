import type { Field } from "../types";
import { evaluateVisibility, type EvaluationContext } from "../conditions";

/**
 * Filter fields based on `condition` and `hidden` flags.
 *
 * - `condition`: removes fields entirely (not present in output)
 * - `hidden`: keeps fields but marks them invisible
 */
export function getVisibleFields(
  fields: Field[],
  ctx: EvaluationContext,
): Field[] {
  const result: Field[] = [];

  for (const field of fields) {
    const isMounted = evaluateVisibility(field.condition, ctx);
    if (!isMounted) continue;

    const isHidden = !evaluateVisibility(field.hidden, ctx);

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

      case "group":
      case "array": {
        result.push({
          ...field,
          hidden: isHidden || field.hidden,
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
