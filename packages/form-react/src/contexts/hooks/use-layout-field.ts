import type { Field as CoreField } from "@buildnbuzz/form-core";
import type { ReactNode } from "react";
import type { UnknownData } from "../../types";
import type { FieldContextValue } from "../field-context";
import { useFieldContext } from "../field-context";
import type { ResolvedFieldTextOptions } from "./use-resolved-field-text";
import { useResolvedFieldText } from "./use-resolved-field-text";

/** Result payload returned by `useLayoutField`. */
export interface LayoutFieldState<
  TField extends CoreField = CoreField,
  TFormData extends UnknownData = UnknownData,
> extends FieldContextValue<TField, TFormData> {
  /** Resolved field label (if the layout field defines one). */
  label: ReactNode;
  /** Resolved field description (if the layout field defines one). */
  description: ReactNode;
}

/** Options for `useLayoutField`. */
export type LayoutFieldOptions = ResolvedFieldTextOptions;

/**
 * Aggregates common UI state for BuzzForm layout fields.
 *
 * Provides the field context and resolved text without error state or a11y ids,
 * since layout fields do not register with TanStack Form.
 */
export function useLayoutField<
  TField extends CoreField = CoreField,
  TFormData extends UnknownData = UnknownData,
>(options: LayoutFieldOptions = {}): LayoutFieldState<TField, TFormData> {
  const ctx = useFieldContext<TField, TFormData>();
  const { label, description } = useResolvedFieldText<TField, TFormData>(
    options,
  );

  return {
    ...ctx,
    label,
    description,
  };
}
