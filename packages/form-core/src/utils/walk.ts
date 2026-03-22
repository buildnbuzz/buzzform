import type { Field, FieldOption } from "../types";
import { escapePointer } from "./path";

/** Context provided to a walk visitor. */
export interface WalkContext {
  /** JSON Pointer to the current field. */
  path: string;
  /** Parent field stack, closest parent last. */
  parents: Field[];
}

/** Visitor invoked for each field during traversal. */
export type WalkVisitor = (field: Field, ctx: WalkContext) => void;

/** Options for schema traversal behavior. */
export interface WalkFieldsOptions {
  /** How array child paths should be represented during traversal. */
  arrayItemPath?: "container" | "wildcard";
}

function joinPointer(base: string, segment: string): string {
  if (base === "") return `/${segment}`;
  return `${base}/${segment}`;
}

function walkField(
  field: Field,
  ctx: WalkContext,
  visitor: WalkVisitor,
  options: WalkFieldsOptions,
): void {
  visitor(field, ctx);

  switch (field.type) {
    case "row":
    case "collapsible": {
      const nextParents = [...ctx.parents, field];
      for (const child of field.fields) {
        walkField(child, { path: ctx.path, parents: nextParents }, visitor, options);
      }
      break;
    }

    case "tabs": {
      const nextParents = [...ctx.parents, field];
      for (const tab of field.tabs) {
        for (const child of tab.fields) {
          walkField(child, { path: ctx.path, parents: nextParents }, visitor, options);
        }
      }
      break;
    }

    case "group": {
      const nextParents = [...ctx.parents, field];
      const groupPath = joinPointer(ctx.path, escapePointer(field.name));
      for (const child of field.fields) {
        walkField(child, { path: groupPath, parents: nextParents }, visitor, options);
      }
      break;
    }

    case "array": {
      const nextParents = [...ctx.parents, field];
      const arrayPath = joinPointer(ctx.path, escapePointer(field.name));
      const itemPath =
        options.arrayItemPath === "container" ? arrayPath : `${arrayPath}/*`;
      for (const child of field.fields) {
        walkField(child, { path: itemPath, parents: nextParents }, visitor, options);
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
export function walkFields(
  fields: readonly Field[],
  visitor: WalkVisitor,
  options: WalkFieldsOptions = {},
): void {
  const normalizedOptions: WalkFieldsOptions = {
    arrayItemPath: options.arrayItemPath ?? "wildcard",
  };

  for (const field of fields) {
    const path = "";
    walkField(field, { path, parents: [] }, visitor, normalizedOptions);
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
