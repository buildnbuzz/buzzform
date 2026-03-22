import { useMemo } from "react";
import {
  useForm as useTanstackForm,
  type StandardSchemaV1,
} from "@tanstack/react-form";
import type { FormSchema } from "@buildnbuzz/form-core";
import { extractDefaults, transformFormOutput } from "@buildnbuzz/form-core";
import type {
  AnyReactFormExtendedApi,
  AnyTanstackFormOptions,
  UseFormOptions,
  UseFormOptionsWithSchema,
} from "./types";
import { buildStandardSchemaValidator } from "./validator";

/**
 * Wraps TanStack `useForm` with schema defaults, runtime submit validation, and optional output transform.
 */
export function useForm<
  TSchema extends FormSchema,
  TFormData extends Record<string, unknown> = Record<string, unknown>,
>(
  opts: UseFormOptionsWithSchema<TSchema, TFormData>,
): AnyReactFormExtendedApi<TFormData>;
export function useForm<TFormData extends Record<string, unknown>>(
  opts: UseFormOptions<TFormData>,
): AnyReactFormExtendedApi<TFormData>;
export function useForm<TFormData extends Record<string, unknown>>(
  opts: UseFormOptions<TFormData>,
): AnyReactFormExtendedApi<TFormData> {
  const {
    schema,
    defaultValues,
    validators,
    customValidators,
    contextData,
    enableSchemaSubmitValidation = true,
    derivedValidationMode,
    output,
    onSubmit,
    ...tanstackOpts
  } = opts;

  const schemaSubmitValidator = useMemo(() => {
    if (!enableSchemaSubmitValidation) return undefined;
    return buildStandardSchemaValidator<TFormData>(schema, {
      customValidators,
      contextData,
      derivedValidationMode,
    }) as StandardSchemaV1<TFormData, unknown>;
  }, [
    schema,
    customValidators,
    contextData,
    derivedValidationMode,
    enableSchemaSubmitValidation,
  ]);

  const mergedDefaultValues = useMemo(
    () =>
      ({ ...extractDefaults(schema.fields), ...defaultValues }) as TFormData,
    [schema, defaultValues],
  );

  const mergedValidators = useMemo(() => {
    if (schemaSubmitValidator && !validators?.onSubmitAsync) {
      return { ...validators, onSubmitAsync: schemaSubmitValidator };
    }
    return validators;
  }, [schemaSubmitValidator, validators]);

  type TanstackSubmit = NonNullable<
    AnyTanstackFormOptions<TFormData>["onSubmit"]
  >;
  type SubmitProps = Parameters<TanstackSubmit>[0];

  const wrappedOnSubmit = useMemo<TanstackSubmit | undefined>(() => {
    if (!output || !onSubmit) return onSubmit as TanstackSubmit | undefined;
    return ((props: SubmitProps) => {
      const nextProps = {
        ...props,
        value: transformFormOutput(props.value, output),
      } as SubmitProps;
      return (onSubmit as TanstackSubmit)(nextProps);
    }) as TanstackSubmit;
  }, [onSubmit, output]);

  return useTanstackForm({
    ...tanstackOpts,
    defaultValues: mergedDefaultValues,
    validators: mergedValidators,
    onSubmit: wrappedOnSubmit,
  } as AnyTanstackFormOptions<TFormData>) as AnyReactFormExtendedApi<TFormData>;
}
