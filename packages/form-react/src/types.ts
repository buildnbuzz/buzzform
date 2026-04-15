/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  FormOptions as TanstackFormOptions,
  ReactFormExtendedApi,
} from "@tanstack/react-form";
import type { FieldValidators } from "@tanstack/form-core";
import type { ReactNode } from "react";
import type {
  DataField,
  Field as CoreField,
  FormSchema,
  FormRegistries,
  OutputConfig,
  OptionResolverRegistry,
  ValidationRegistry,
  ValidationRun,
} from "@buildnbuzz/form-core";

declare module "@buildnbuzz/form-core" {
  interface FrameworkOverrides {
    react: ReactNode;
  }
}

/** Shared dictionary type used by form-react runtime and API surfaces. */
export type UnknownData = Record<string, unknown>;

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
  TFormData extends UnknownData = UnknownData,
> extends Omit<
  AnyTanstackFormOptions<TFormData>,
  "defaultValues" | "onSubmit"
> {
  /** Form schema used to derive defaults and build runtime validation. */
  schema: TSchema;
  /** Optional overrides merged over schema-derived defaults. */
  defaultValues?: Partial<TFormData>;
  /** Optional runtime registries (validators, resolvers, fns). */
  registries?: FormRegistries;
  /** @deprecated Use `registries.validators` instead. */
  customValidators?: ValidationRegistry;
  /** @deprecated Use `registries.resolvers` instead. */
  optionResolvers?: OptionResolverRegistry;
  /** Optional context data used by dynamic validators. */
  contextData?: UnknownData;
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
export type UseFormOptions<TFormData extends UnknownData = UnknownData> =
  UseFormOptionsWithSchema<FormSchema, TFormData>;

/** TanStack field validators with validation slot generics widened to `any`. */
export type AnyFieldValidators = FieldValidators<
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
  any,
  any
>;

/** Minimal form API contract required by the headless `<Field>` wrapper. */
export type FieldFormApi<TFormData extends UnknownData = UnknownData> =
  AnyReactFormExtendedApi<TFormData>;

/** Props for the headless `<Field>` wrapper. */
export interface FieldProps<TFormData extends UnknownData = UnknownData> {
  /** Data field schema node. */
  field: DataField;
  /** TanStack form instance from `useForm`. */
  form: FieldFormApi<TFormData>;
  /** External data available to dynamic validation conditions and checks. */
  contextData?: UnknownData;
  /** Runtime registries (validators, resolvers, fns, fields). Merged over global config. */
  registries?: FormRegistries;
  /** @deprecated Use `registries.validators` instead. */
  customValidators?: ValidationRegistry;
  /** @deprecated Use `registries.resolvers` instead. */
  optionResolvers?: OptionResolverRegistry;
  /** Explicit TanStack validators merged with generated schema validators. */
  validators?: AnyFieldValidators;
  /** Which run includes derived checks (defaults to `submit`). */
  derivedValidationMode?: ValidationRun;
  /** Field UI content; rendered inside `form.Field` when mounted and visible. */
  children: ReactNode;
}
