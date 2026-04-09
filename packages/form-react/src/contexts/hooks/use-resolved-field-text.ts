import type { Field as CoreField } from "@buildnbuzz/form-core";
import { resolveDynamicValue } from "@buildnbuzz/form-core";
import { isValidElement, type ReactNode } from "react";
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

function isDynamicReference(
  value: unknown,
): value is { $data: string } | { $context: string } {
  if (!value || typeof value !== "object") return false;
  return "$data" in value || "$context" in value;
}

/**
 * Resolves dynamic label/placeholder/description values for the active field.
 */
export function useResolvedFieldText<
  TField extends CoreField = CoreField,
  TFormData extends UnknownData = UnknownData,
>(options: ResolvedFieldTextOptions = {}) {
  const { field, formData, contextData } = useFieldContext<TField, TFormData>();
  const nameFallback =
    "name" in field && typeof field.name === "string" ? field.name : "";
  const labelValue = "label" in field ? field.label : undefined;
  const placeholderValue = "placeholder" in field ? field.placeholder : undefined;
  const descriptionValue = "description" in field ? field.description : undefined;

  const resolveText = (value: unknown, fallback: ReactNode): ReactNode => {
    if (isDynamicReference(value)) {
      const resolved = resolveDynamicValue(
        value as never,
        formData,
        contextData,
      );
      return (resolved as ReactNode | undefined) ?? fallback;
    }
    if (isValidElement(value)) return value;
    if (typeof value === "string" || typeof value === "number") return value;
    if (typeof value === "boolean") return value;
    if (value == null) return fallback;
    // Guard against unresolved dynamic references (plain objects)
    return fallback;
  };

  const resolvePlaceholder = (value: unknown, fallback: string): string => {
    if (isDynamicReference(value)) {
      const resolved = resolveDynamicValue(
        value as never,
        formData,
        contextData,
      );
      return (resolved as string | undefined) ?? fallback;
    }
    if (typeof value === "string") return value;
    return value == null ? fallback : String(value);
  };

  return {
    label: resolveText(labelValue, options.labelFallback ?? nameFallback),
    placeholder: resolvePlaceholder(
      placeholderValue,
      options.placeholderFallback ?? "",
    ),
    description: resolveText(
      descriptionValue,
      options.descriptionFallback ?? "",
    ),
  };
}
