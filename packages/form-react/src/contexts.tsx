import { createContext, useContext } from "react";
import type { AnyFieldApi } from "@tanstack/form-core";
import type { DataField, Field as CoreField } from "@buildnbuzz/form-core";
import type { ComponentType, ReactNode } from "react";
import type { FieldFormApi, UnknownData } from "./types";
import { resolveDynamicValue } from "@buildnbuzz/form-core";

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
  return ctx as unknown as FieldContextValue<TField, TFormData>;
}

/** Convenience alias for `useFieldContext().fieldApi`. */
export function useFieldApi(): AnyFieldApi | undefined {
  return useFieldContext().fieldApi;
}

/** Convenience alias for `useFieldContext().form`. */
export function useFormContext<
  TFormData extends UnknownData = UnknownData,
>(): FieldFormApi<TFormData> {
  return useFieldContext<CoreField, TFormData>().form;
}

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
  const { field, formData, contextData } = useFieldContext<
    CoreField,
    TFormData
  >() as unknown as {
    field: TField;
    formData: UnknownData;
    contextData?: UnknownData;
  };
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

/** Registry mapping field type strings to renderer components. */
export type FieldRegistry = {
  [K in CoreField["type"]]?: ComponentType<{ children?: ReactNode }>;
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
