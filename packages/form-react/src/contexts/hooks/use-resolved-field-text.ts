import type { Field as CoreField } from "@buildnbuzz/form-core";
import { resolveDynamicValue } from "@buildnbuzz/form-core";
import type { UnknownData } from "../../types";
import { useFieldContext } from "../field-context";

/** Options for resolving dynamic field text. */
export interface ResolvedFieldTextOptions {
  /** Fallback used when a label is missing or resolves to null. */
  labelFallback?: string;
  /** Fallback used when a placeholder is missing or resolves to null. */
  placeholderFallback?: string;
  /** Fallback used when a description is missing or resolves to null. */
  descriptionFallback?: string;
}

/**
 * Resolves dynamic label/placeholder/description values for the active field.
 */
export function useResolvedFieldText<
  TField extends CoreField = CoreField,
  TFormData extends UnknownData = UnknownData,
>(options: ResolvedFieldTextOptions = {}) {
  const { field, formData, contextData } = useFieldContext<TField, TFormData>();
  const nameFallback = "name" in field ? field.name : "";
  const labelValue = "label" in field ? field.label : undefined;
  const placeholderValue = "placeholder" in field ? field.placeholder : undefined;
  const descriptionValue = "description" in field ? field.description : undefined;

  const resolveText = (value: unknown, fallback: string) => {
    const resolved = resolveDynamicValue(
      value as never,
      formData,
      contextData,
    );
    return resolved ?? fallback;
  };

  return {
    label: resolveText(labelValue, options.labelFallback ?? nameFallback),
    placeholder: resolveText(
      placeholderValue,
      options.placeholderFallback ?? "",
    ),
    description: resolveText(
      descriptionValue,
      options.descriptionFallback ?? "",
    ),
  };
}
