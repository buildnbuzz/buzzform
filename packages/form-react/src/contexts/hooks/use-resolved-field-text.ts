import type { ReactNode } from "react";
import { isValidElement } from "react";
import { resolveExpr } from "@buildnbuzz/form-core";
import type { Expr, Field as CoreField, ExprText, FnRegistry } from "@buildnbuzz/form-core";
import type { UnknownData } from "../../types";
import { useFieldContext } from "../field-context";

/** Options for resolving dynamic field text. */
export interface ResolvedFieldTextOptions {
  /** Fallback used when a label is missing or resolves to null. */
  labelFallback?: ReactNode;
  /** Fallback used when a placeholder is missing or resolves to null. */
  placeholderFallback?: string;
  /** Fallback used when a description is missing or resolves to null. */
  descriptionFallback?: ReactNode;
}

/**
 * Convert a resolved value into a React node.
 */
function toReactNode(value: unknown, fallback: ReactNode): ReactNode {
  if (value == null) return fallback;
  if (isValidElement(value)) return value;
  if (typeof value === "string" || typeof value === "number") return value;
  if (typeof value === "boolean") return value ? "true" : "false";
  return fallback;
}

/**
 * Convert a resolved value into a string.
 */
function toStringValue(value: unknown, fallback: string): string {
  if (value == null) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

/**
 * Resolve an expression against the current form and context data.
 */
function resolveTextExpr<T>(
  value: Expr<T> | undefined,
  formData: UnknownData,
  contextData: UnknownData | undefined,
  fns?: FnRegistry,
): T | undefined {
  if (value === undefined) return undefined;

  return resolveExpr<T>(value, {
    data: formData,
    context: contextData,
  }, fns);
}

/**
 * Resolves dynamic label, placeholder, and description values for the active field.
 */
export function useResolvedFieldText<
  TField extends CoreField = CoreField,
  TFormData extends UnknownData = UnknownData,
>(options: ResolvedFieldTextOptions = {}) {
  const { field, formData, contextData, registries } = useFieldContext<TField, TFormData>();
  const fns = registries?.fns;

  const nameFallback =
    "name" in field && typeof field.name === "string" ? field.name : "";

  const labelValue = "label" in field ? field.label : undefined;
  const placeholderValue =
    "placeholder" in field ? field.placeholder : undefined;
  const descriptionValue =
    "description" in field ? field.description : undefined;

  const resolvedLabel = resolveTextExpr<ExprText | ReactNode>(
    labelValue,
    formData,
    contextData,
    fns,
  );

  const resolvedPlaceholder = resolveTextExpr<string>(
    placeholderValue,
    formData,
    contextData,
    fns,
  );

  const resolvedDescription = resolveTextExpr<ExprText | ReactNode>(
    descriptionValue,
    formData,
    contextData,
    fns,
  );

  return {
    label: toReactNode(resolvedLabel, options.labelFallback ?? nameFallback),
    placeholder: toStringValue(
      resolvedPlaceholder,
      options.placeholderFallback ?? "",
    ),
    description: toReactNode(
      resolvedDescription,
      options.descriptionFallback ?? "",
    ),
  };
}
