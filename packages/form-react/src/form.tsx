import type { FormEvent, FormHTMLAttributes, ReactNode } from "react";
import type {
  Field as CoreField,
  FormRegistries,
  ValidationRegistry,
  OptionResolverRegistry,
  ValidationRun,
} from "@buildnbuzz/form-core";
import type { FieldFormApi, UnknownData } from "./types";
import type { FieldRegistry } from "./contexts";
import { RenderFields } from "./renderer";

/** Props for the headless `<Form>` wrapper component. */
export interface FormProps<TFormData extends UnknownData = UnknownData>
  extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  /** TanStack form instance created by `useForm`. */
  form: FieldFormApi<TFormData>;
  /** Optional schema fields to auto-render when no children are provided. */
  fields?: readonly CoreField[];
  /** External context data used by dynamic runtime checks. */
  contextData?: UnknownData;
  /** Optional runtime registries (fields, validators, resolvers, fns). */
  registries?: FormRegistries;
  /** @deprecated Use `registries.validators` instead. */
  customValidators?: ValidationRegistry;
  /** @deprecated Use `registries.resolvers` instead. */
  optionResolvers?: OptionResolverRegistry;
  /** Which run includes derived checks for generated field validators. */
  derivedValidationMode?: ValidationRun;
  /** @deprecated Use `registries.fields` instead. */
  registry?: FieldRegistry;
  /** Optional fallback when a field type has no renderer. */
  renderFallback?: (field: CoreField) => ReactNode;
  /** Optional parent data path used to resolve nested field names. */
  basePath?: string;
  /** Optional custom submit handler invoked before `form.handleSubmit()`. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /** Children to render inside the form. */
  children?: ReactNode;
}

/** Headless form wrapper that wires submit handling and optional schema rendering. */
export function Form<TFormData extends UnknownData = UnknownData>({
  form,
  fields,
  contextData,
  registries,
  customValidators,
  optionResolvers,
  derivedValidationMode,
  registry,
  renderFallback,
  basePath,
  onSubmit,
  children,
  ...rest
}: FormProps<TFormData>) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    onSubmit?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    void form.handleSubmit();
  };

  return (
    <form
      {...rest}
      onSubmit={handleSubmit}
    >
      {children ??
        (fields ? (
          <RenderFields
            fields={fields}
            form={form}
            contextData={contextData}
            registries={registries}
            customValidators={customValidators}
            optionResolvers={optionResolvers}
            derivedValidationMode={derivedValidationMode}
            registry={registry}
            renderFallback={renderFallback}
            basePath={basePath}
          />
        ) : null)}
    </form>
  );
}
