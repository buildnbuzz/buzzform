import { createContext, useContext } from "react";
import type { AnyFieldApi } from "@tanstack/form-core";
import type { Field as CoreField, DataField, OptionResolverRegistry } from "@buildnbuzz/form-core";
import type { FieldFormApi, UnknownData } from "../types";

/** Value exposed by `FieldContext` for field renderer components. */
export interface FieldContextValue<
  TField extends CoreField = CoreField,
  TFormData extends UnknownData = UnknownData,
> {
  /** TanStack form instance used by this field. */
  form: FieldFormApi<TFormData>;
  /** TanStack field api for the current field instance (undefined for layout fields). */
  fieldApi?: AnyFieldApi;
  /** Current core field schema node. */
  field: TField;
  /** JSON Pointer path for the field in form data. */
  fieldPath: string;
  /** Latest form values snapshot. */
  formData: TFormData;
  /** External context data used by dynamic evaluation and validators. */
  contextData?: UnknownData;
  /** Custom option resolvers passed down for options fetching hooks. */
  optionResolvers?: OptionResolverRegistry;
  /** Whether the field is currently hidden. */
  isHidden: boolean;
  /** Whether the field condition currently evaluates to mounted. */
  isConditionMet: boolean;
  /** Whether the field is disabled by runtime visibility rules. */
  isDisabled: boolean;
  /** Whether the field is read-only by runtime visibility rules. */
  isReadOnly: boolean;
  /** Whether the field is currently required by runtime visibility rules. */
  isRequired: boolean;
}

/** Value exposed by `useDataFieldContext` for data field renderer components. */
export interface DataFieldContextValue<
  TField extends DataField = DataField,
  TFormData extends UnknownData = UnknownData,
> extends FieldContextValue<TField, TFormData> {
  /** TanStack field api for the current field instance. */
  fieldApi: AnyFieldApi;
  /** Current core field schema node. */
  field: TField;
}

/** React context for the active field rendering scope. */
export const FieldContext = createContext<unknown>(null);

/** Reads field rendering context from the nearest `Field` wrapper. */
export function useFieldContext<
  TField extends CoreField = CoreField,
  TFormData extends UnknownData = UnknownData,
>(): FieldContextValue<TField, TFormData> {
  const ctx = useContext(FieldContext);
  if (!ctx) {
    throw new Error(
      "useFieldContext must be used within a BuzzForm <Field> or <LayoutField> component",
    );
  }
  // Context is stored as `unknown` to avoid circular generic constraints.
  // Callers provide the expected shape via type parameters.
  return ctx as unknown as FieldContextValue<TField, TFormData>;
}

/**
 * Reads field rendering context for data fields and guarantees a field api.
 */
export function useDataFieldContext<
  TField extends DataField = DataField,
  TFormData extends UnknownData = UnknownData,
>(): DataFieldContextValue<TField, TFormData> {
  const ctx = useFieldContext<TField, TFormData>();
  if (!ctx.fieldApi) {
    throw new Error(
      "useDataFieldContext must be used within a BuzzForm data field",
    );
  }
  return ctx as DataFieldContextValue<TField, TFormData>;
}

/** Convenience alias for `useFieldContext().fieldApi`. */
export function useFieldApi(): AnyFieldApi | undefined {
  return useFieldContext().fieldApi;
}
