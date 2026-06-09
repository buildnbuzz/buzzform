import type { ElementType, FormEvent, HTMLAttributes, ReactNode } from "react";
import type {
  FieldInput,
  FormRegistries,
  ValidationRegistry,
  OptionResolverRegistry,
  ValidationRun,
} from "@buildnbuzz/form-core";
import type { FieldFormApi, UnknownData } from "./types";
import type { FieldRegistry } from "./contexts";
import { RenderFields } from "./renderer";

/** Props for the headless `<Form>` wrapper component. */
export interface FormProps<
  TFormData extends UnknownData = UnknownData,
> extends Omit<HTMLAttributes<HTMLElement>, "onSubmit"> {
  /** TanStack form instance created by `useForm`. */
  form: FieldFormApi<TFormData>;
  /** Optional component or HTML tag to render instead of 'form'. Use 'div' for nested forms. */
  as?: ElementType;
  /** Optional schema fields to auto-render when no children are provided. */
  fields?: readonly FieldInput[];
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
  renderFallback?: (field: FieldInput) => ReactNode;
  /** Optional parent data path used to resolve nested field names. */
  basePath?: string;
  /** Optional custom submit handler invoked before `form.handleSubmit()`. */
  onSubmit?: (event: FormEvent<HTMLElement>) => void;
  /** Children to render inside the form. */
  children?: ReactNode;
}

/** Headless form wrapper that wires submit handling and optional schema rendering. */
export function Form<TFormData extends UnknownData = UnknownData>({
  form,
  as: Component = "form",
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
  const handleSubmit = (event: FormEvent<HTMLElement>) => {
    onSubmit?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    void form.handleSubmit();
  };

  // Normalize deprecated shims — RenderFields will handle the rest.
  const normalizedRegistries: FormRegistries | undefined =
    registry || registries || customValidators || optionResolvers
      ? {
          ...registries,
          fields: (registries?.fields ?? registry) as FormRegistries["fields"],
          validators: {
            ...registries?.validators,
            ...customValidators,
          } as FormRegistries["validators"],
          resolvers: {
            ...registries?.resolvers,
            ...optionResolvers,
          } as FormRegistries["resolvers"],
        }
      : undefined;

  return (
    <Component
      {...rest}
      onSubmit={Component === "form" ? handleSubmit : undefined}
    >
      {children ??
        (fields ? (
          <RenderFields
            fields={fields}
            form={form}
            contextData={contextData}
            registries={normalizedRegistries}
            derivedValidationMode={derivedValidationMode}
            renderFallback={renderFallback}
            basePath={basePath}
          />
        ) : null)}
    </Component>
  );
}
