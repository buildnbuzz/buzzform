import { useContext, useMemo } from "react";
import {
  useForm as useTanstackForm,
  type StandardSchemaV1,
} from "@tanstack/react-form";
import type { FormSchema } from "@buildnbuzz/form-core";
import { extractDefaults, transformFormOutput } from "@buildnbuzz/form-core";
import type { FormRegistries } from "@buildnbuzz/form-core";
import type {
  AnyReactFormExtendedApi,
  AnyTanstackFormOptions,
  UnknownData,
  UseFormOptions,
  UseFormOptionsWithSchema,
} from "./types";
import { buildStandardSchemaValidator } from "./validator";
import { FormConfigContext } from "./contexts";
import { mergeRegistries } from "./utils/merge-registries";

/**
 * Wraps TanStack `useForm` with schema defaults, runtime submit validation, and optional output transform.
 */
export function useForm<
  TSchema extends FormSchema,
  TFormData extends UnknownData = UnknownData,
>(
  opts: UseFormOptionsWithSchema<TSchema, TFormData>,
): AnyReactFormExtendedApi<TFormData>;
export function useForm<TFormData extends UnknownData>(
  opts: UseFormOptions<TFormData>,
): AnyReactFormExtendedApi<TFormData>;
export function useForm<TFormData extends UnknownData>(
  opts: UseFormOptions<TFormData>,
): AnyReactFormExtendedApi<TFormData> {
  const config = useContext(FormConfigContext);
  const {
    schema,
    defaultValues,
    validators,
    registries,
    customValidators,
    optionResolvers,
    contextData,
    enableSchemaSubmitValidation = true,
    derivedValidationMode = config?.derivedValidationMode,
    output,
    onSubmit,
    ...tanstackOpts
  } = opts;

  const mergedRegistries = useMemo<FormRegistries>(() => {
    // Normalize deprecated shims into registries, then merge with global.
    return (
      mergeRegistries(config?.registries, {
        ...registries,
        validators: {
          ...registries?.validators,
          ...customValidators,
        } as FormRegistries["validators"],
        resolvers: {
          ...registries?.resolvers,
          ...optionResolvers,
        } as FormRegistries["resolvers"],
      }) ?? {}
    );
  }, [config?.registries, registries, customValidators, optionResolvers]);

  const schemaSubmitValidator = useMemo(() => {
    if (!enableSchemaSubmitValidation) return undefined;
    return buildStandardSchemaValidator<TFormData>(schema, {
      customValidators: mergedRegistries.validators,
      contextData,
      derivedValidationMode,
    }) as StandardSchemaV1<TFormData, unknown>;
  }, [
    schema,
    mergedRegistries.validators,
    contextData,
    derivedValidationMode,
    enableSchemaSubmitValidation,
  ]);

  const mergedDefaultValues = useMemo(
    () =>
      ({
        ...extractDefaults(schema.fields, contextData, mergedRegistries.fns),
        ...defaultValues,
      }) as TFormData,
    [schema.fields, contextData, mergedRegistries.fns, defaultValues],
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
