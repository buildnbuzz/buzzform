import { createContext, useContext } from "react";
import type { AnyFieldApi } from "@tanstack/form-core";
import type { DataField, Field as CoreField } from "@buildnbuzz/form-core";
import type { ComponentType, ReactNode } from "react";
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

/** Registry mapping field type strings to renderer components. */
export type FieldRegistry = {
  [K in CoreField["type"]]?: ComponentType;
};

/** React context for globally configured renderer registry. */
export const RegistryContext = createContext<FieldRegistry | null>(null);

/** Reads field renderer registry from the nearest `FormProvider`. */
export function useRegistry(): FieldRegistry {
  const registry = useContext(RegistryContext);
  if (!registry) {
    throw new Error(
      "No field registry found. Wrap with <FormProvider> or pass `registry` directly.",
    );
  }
  return registry;
}

/** Props for global form-react provider configuration. */
export interface FormProviderProps {
  /** Default registry used by `FieldRenderer` and `RenderFields`. */
  registry: FieldRegistry;
  children: ReactNode;
}

/** Provides default field renderer registry to descendants. */
export function FormProvider({ registry, children }: FormProviderProps) {
  return (
    <RegistryContext.Provider value={registry}>
      {children}
    </RegistryContext.Provider>
  );
}
