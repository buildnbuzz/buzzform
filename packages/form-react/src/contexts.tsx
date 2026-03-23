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

/** Normalized error entry for UI renderers. */
export interface FieldErrorItem {
  /** Human-readable error message. */
  message?: string;
}

/** Result payload returned by `useFieldErrorState`. */
export interface FieldErrorState {
  /** Normalized error list for rendering. */
  errors: FieldErrorItem[];
  /** Whether the field is currently invalid and errors should be shown. */
  isInvalid: boolean;
  /** Whether errors should be displayed based on interaction state. */
  shouldShowErrors: boolean;
}

/** Options for `useFieldErrorState`. */
export interface FieldErrorStateOptions {
  /** Overrides the default error visibility calculation. */
  shouldShowErrors?: boolean;
}

/**
 * Computes normalized errors and invalid state for data fields.
 */
export function useFieldErrorState(
  options: FieldErrorStateOptions = {},
): FieldErrorState {
  const { fieldApi } = useFieldContext();
  if (!fieldApi) {
    throw new Error(
      "useFieldErrorState must be used within a BuzzForm data field context",
    );
  }

  const meta = fieldApi.state.meta as {
    isTouched?: boolean;
    isDirty?: boolean;
    isValid?: boolean;
    errors?: unknown[];
  };
  const shouldShowErrors =
    options.shouldShowErrors ??
    Boolean(
      meta.isTouched ||
        meta.isDirty ||
        (fieldApi.form?.state?.submissionAttempts ?? 0) > 0,
    );
  const errors = normalizeFieldErrors(meta.errors);
  const isInvalid = shouldShowErrors && !meta.isValid && errors.length > 0;

  return {
    errors,
    isInvalid,
    shouldShowErrors,
  };
}

/** Options for `useFieldA11yIds`. */
export interface FieldA11yIdsOptions {
  /** Field id used as the base for generated ids. */
  fieldId: string;
  /** Optional field description content. */
  description?: string | null;
  /** Whether to include an error id in the described-by chain. */
  isInvalid?: boolean;
}

/** Result payload returned by `useFieldA11yIds`. */
export interface FieldA11yIds {
  /** ID for the description element (if any). */
  descriptionId?: string;
  /** ID for the error element (if any). */
  errorId?: string;
  /** Combined value for `aria-describedby` (if any). */
  ariaDescribedBy?: string;
}

/**
 * Builds stable description/error ids and `aria-describedby` values.
 */
export function useFieldA11yIds({
  fieldId,
  description,
  isInvalid,
}: FieldA11yIdsOptions): FieldA11yIds {
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = isInvalid ? `${fieldId}-error` : undefined;
  const ariaDescribedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return {
    descriptionId,
    errorId,
    ariaDescribedBy,
  };
}

function normalizeFieldErrors(errors: unknown[] | undefined): FieldErrorItem[] {
  if (!errors?.length) return [];
  return errors
    .map((error) => {
      if (!error) return undefined;
      if (typeof error === "string") return { message: error };
      if (typeof error === "object") return error as FieldErrorItem;
      return undefined;
    })
    .filter(Boolean) as FieldErrorItem[];
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
