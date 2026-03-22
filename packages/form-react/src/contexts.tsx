import { createContext, useContext } from "react";
import type { AnyFieldApi } from "@tanstack/form-core";
import type { DataField } from "@buildnbuzz/form-core";
import type { FieldFormApi, UnknownData } from "./types";

/** Value exposed by `FieldContext` for field renderer components. */
export interface FieldContextValue<TFormData extends UnknownData = UnknownData> {
  /** TanStack form instance used by this field. */
  form: FieldFormApi<TFormData>;
  /** TanStack field api for the current field instance. */
  fieldApi: AnyFieldApi;
  /** Current core field schema node. */
  field: DataField;
  /** Latest form values snapshot. */
  formData: TFormData;
  /** External context data used by dynamic evaluation and validators. */
  contextData?: UnknownData;
  /** Whether the field is currently hidden. */
  isHidden: boolean;
  /** Whether the field condition currently evaluates to mounted. */
  isConditionMet: boolean;
  /** Whether the field is disabled by runtime visibility rules. */
  isDisabled: boolean;
  /** Whether the field is read-only by runtime visibility rules. */
  isReadOnly: boolean;
}

/** React context for the active field rendering scope. */
export const FieldContext = createContext<unknown>(null);

/** Reads field rendering context from the nearest `Field` wrapper. */
export function useFieldContext<
  TFormData extends UnknownData = UnknownData,
>(): FieldContextValue<TFormData> {
  const ctx = useContext(FieldContext);
  if (!ctx) {
    throw new Error("useFieldContext must be used within a <Field> component");
  }
  return ctx as FieldContextValue<TFormData>;
}

/** Convenience alias for `useFieldContext().fieldApi`. */
export function useFieldApi(): AnyFieldApi {
  return useFieldContext().fieldApi;
}

/** Convenience alias for `useFieldContext().form`. */
export function useFormContext<
  TFormData extends UnknownData = UnknownData,
>(): FieldFormApi<TFormData> {
  return useFieldContext<TFormData>().form;
}
