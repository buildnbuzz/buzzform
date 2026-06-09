import type {
  FieldInput,
  OptionsConfig,
  GroupField,
  ArrayField,
  RowField,
  CollapsibleField,
  TabsField,
} from "../types";
import { joinPointer } from "./path";

/** Context provided to a walk visitor. */
export interface WalkContext {
  /** JSON Pointer to the current field. */
  path: string;
  /** Parent field stack, closest parent last. */
  parents: FieldInput[];
}

/** Visitor invoked for each field during traversal. */
export type WalkVisitor = (field: FieldInput, ctx: WalkContext) => void;

/** Options for schema traversal behavior. */
export interface WalkFieldsOptions {
  /** How array child paths should be represented during traversal. */
  arrayItemPath?: "container" | "wildcard";
}

function walkField(
  field: FieldInput,
  ctx: WalkContext,
  visitor: WalkVisitor,
  options: WalkFieldsOptions,
): void {
  visitor(field, ctx);

  switch (field.type) {
    case "row":
    case "collapsible": {
      const f = field as RowField | CollapsibleField;
      const nextParents = [...ctx.parents, field];
      for (const child of f.fields) {
        walkField(
          child,
          { path: ctx.path, parents: nextParents },
          visitor,
          options,
        );
      }
      break;
    }

    case "tabs": {
      const f = field as TabsField;
      const nextParents = [...ctx.parents, field];
      for (const tab of f.tabs) {
        for (const child of tab.fields) {
          walkField(
            child,
            { path: ctx.path, parents: nextParents },
            visitor,
            options,
          );
        }
      }
      break;
    }

    case "group": {
      const f = field as GroupField;
      const nextParents = [...ctx.parents, field];
      const groupPath = joinPointer(ctx.path, f.name);
      for (const child of f.fields) {
        walkField(
          child,
          { path: groupPath, parents: nextParents },
          visitor,
          options,
        );
      }
      break;
    }

    case "array": {
      const f = field as ArrayField;
      const nextParents = [...ctx.parents, field];
      const arrayPath = joinPointer(ctx.path, f.name);
      const itemPath =
        options.arrayItemPath === "container" ? arrayPath : `${arrayPath}/*`;
      for (const child of f.fields) {
        walkField(
          child,
          { path: itemPath, parents: nextParents },
          visitor,
          options,
        );
      }
      break;
    }

    default: {
      // Leaf field (including custom fields), no-op.
      break;
    }
  }
}

/**
 * Walk all fields in a schema in depth-first order.
 */
export function walkFields(
  fields: readonly FieldInput[],
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
 * Note: Only returns values for static option arrays.
 */
export function getOptionValues(
  field: { options?: OptionsConfig } | undefined,
): unknown[] {
  if (!field?.options || !Array.isArray(field.options)) return [];
  return field.options.map((option) =>
    typeof option === "string" ? option : option.value,
  );
}
