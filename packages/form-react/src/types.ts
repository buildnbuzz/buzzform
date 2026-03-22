/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  FormOptions as TanstackFormOptions,
  ReactFormExtendedApi,
} from "@tanstack/react-form";
import type {
  FormSchema,
  OutputConfig,
  ValidationRegistry,
  ValidationRun,
} from "@buildnbuzz/form-core";

/**
 * TanStack Form options with validation slot generics widened to `any`.
 */
export type AnyTanstackFormOptions<TFormData> = TanstackFormOptions<
  TFormData,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

/**
 * TanStack React Form API with validation slot generics widened to `any`.
 */
export type AnyReactFormExtendedApi<TFormData> = ReactFormExtendedApi<
  TFormData,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

/** Schema-aware options for `useForm`, keyed by explicit `TFormData`. */
export interface UseFormOptionsWithSchema<
  TSchema extends FormSchema,
  TFormData extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<
    AnyTanstackFormOptions<TFormData>,
    "defaultValues" | "onSubmit"
  > {
  /** Form schema used to derive defaults and build runtime validation. */
  schema: TSchema;
  /** Optional overrides merged over schema-derived defaults. */
  defaultValues?: Partial<TFormData>;
  /** Optional custom validation registry. */
  customValidators?: ValidationRegistry;
  /** Optional context data used by dynamic validators. */
  contextData?: Record<string, unknown>;
  /** Enables schema-derived submit validation. Defaults to `true`. */
  enableSchemaSubmitValidation?: boolean;
  /** Which validation run should include derived checks. Defaults to `submit`. */
  derivedValidationMode?: ValidationRun;
  /** Optional runtime output transformation config. */
  output?: OutputConfig;
  /** TanStack submit handler. */
  onSubmit?: AnyTanstackFormOptions<TFormData>["onSubmit"];
}

/** Convenience `useForm` options type using generic `FormSchema`. */
export type UseFormOptions<
  TFormData extends Record<string, unknown> = Record<string, unknown>,
> = UseFormOptionsWithSchema<FormSchema, TFormData>;
