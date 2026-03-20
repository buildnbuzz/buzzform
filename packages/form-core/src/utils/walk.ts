import type { Field, FieldOption } from "../types";

export interface WalkContext {
  /** JSON Pointer to the current field. */
  path: string;
  /** Parent field stack, closest parent last. */
  parents: Field[];
}

export type WalkVisitor = (field: Field, ctx: WalkContext) => void;

function joinPointer(base: string, segment: string): string {
  if (base === "") return `/${segment}`;
  return `${base}/${segment}`;
}

function escapePointer(segment: string): string {
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}

function walkField(field: Field, ctx: WalkContext, visitor: WalkVisitor): void {
  visitor(field, ctx);

  switch (field.type) {
    case "row":
    case "collapsible": {
      const nextParents = [...ctx.parents, field];
      for (const child of field.fields) {
        walkField(child, { path: ctx.path, parents: nextParents }, visitor);
      }
      break;
    }

    case "tabs": {
      const nextParents = [...ctx.parents, field];
      for (const tab of field.tabs) {
        for (const child of tab.fields) {
          walkField(child, { path: ctx.path, parents: nextParents }, visitor);
        }
      }
      break;
    }

    case "group": {
      const nextParents = [...ctx.parents, field];
      const groupPath = joinPointer(ctx.path, escapePointer(field.name));
      for (const child of field.fields) {
        walkField(child, { path: groupPath, parents: nextParents }, visitor);
      }
      break;
    }

    case "array": {
      const nextParents = [...ctx.parents, field];
      const arrayPath = joinPointer(ctx.path, escapePointer(field.name));
      for (const child of field.fields) {
        walkField(child, { path: arrayPath, parents: nextParents }, visitor);
      }
      break;
    }

    default: {
      // Leaf field, no-op.
      break;
    }
  }
}

/**
 * Walk all fields in a schema in depth-first order.
 */
export function walkFields(fields: Field[], visitor: WalkVisitor): void {
  for (const field of fields) {
    const path = "";
    walkField(field, { path, parents: [] }, visitor);
  }
}

/**
 * Collect option values from a field for easy validation use.
 */
export function getOptionValues(
  field: { options?: FieldOption[] } | undefined,
): unknown[] {
  if (!field?.options) return [];
  return field.options.map((option) => option.value);
}
