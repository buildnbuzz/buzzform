"use client";

import * as React from "react";
import type {
  Field,
  FormAdapter,
  FormSettings,
  UseFormOptions,
} from "@buildnbuzz/buzzform";
import { useForm } from "@buildnbuzz/buzzform";

import {
  RenderFields,
  FieldRenderer,
  type FieldRegistry,
} from "@/components/buzzform/fields/render";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";

// Types
type ButtonProps = React.ComponentProps<typeof Button>;

// Context
interface FormContextValue<TData = Record<string, unknown>> {
  form: FormAdapter<TData>;
  fields: readonly Field[];
  registry?: FieldRegistry;
  disabled: boolean;
  requireDirty: boolean;
  disableIfInvalid: boolean;
}

const FormContext = React.createContext<FormContextValue | null>(null);

function useFormContext<TData = Record<string, unknown>>() {
  const ctx = React.useContext(FormContext);
  if (!ctx) throw new Error("useFormContext must be used within <Form>");
  return ctx as FormContextValue<TData>;
}

// Form
interface FormProps<
  TData extends Record<string, unknown> = Record<string, unknown>,
> extends UseFormOptions<TData> {
  fields?: readonly Field[];
  className?: string;
  children?: React.ReactNode;
  registry?: FieldRegistry;
  disabled?: boolean;
  requireDirty?: boolean;
  disableIfInvalid?: boolean;
  submitLabel?: string;
  submitClassName?: string;
  showSubmit?: boolean;
}

function FormRoot<TData extends Record<string, unknown>>(
  {
    schema,
    fields: explicitFields,
    defaultValues,
    onSubmit,
    mode,
    settings: explicitSettings,
    adapter,
    className,
    children,
    registry,
    disabled = false,
    requireDirty = false,
    disableIfInvalid = false,
    submitLabel,
    submitClassName,
    showSubmit = true,
  }: FormProps<TData>,
  ref: React.ForwardedRef<FormAdapter<TData>>
) {
  const settings = React.useMemo<FormSettings | undefined>(() => {
    if (!explicitSettings && !requireDirty) return undefined;
    return {
      ...explicitSettings,
      submitOnlyWhenDirty:
        requireDirty || explicitSettings?.submitOnlyWhenDirty,
    };
  }, [explicitSettings, requireDirty]);

  const form = useForm<TData>({
    schema,
    defaultValues,
    onSubmit,
    mode,
    settings,
    adapter,
  });

  React.useImperativeHandle(ref, () => form);

  const fields = React.useMemo(() => {
    if (explicitFields) return explicitFields;
    if (schema && "fields" in schema) return schema.fields as readonly Field[];
    return [];
  }, [explicitFields, schema]);

  const contextValue = React.useMemo<FormContextValue<TData>>(
    () => ({
      form,
      fields,
      registry,
      disabled,
      requireDirty,
      disableIfInvalid,
    }),
    [form, fields, registry, disabled, requireDirty, disableIfInvalid]
  );

  const content = children ?? (
    <FormContent className={className}>
      <FormFields />
      {showSubmit && (
        <FormSubmit className={submitClassName}>{submitLabel}</FormSubmit>
      )}
    </FormContent>
  );

  return (
    <FormContext.Provider value={contextValue as FormContextValue}>
      {content}
    </FormContext.Provider>
  );
}

const Form = React.forwardRef(FormRoot) as <
  TData extends Record<string, unknown>,
>(
  props: FormProps<TData> & { ref?: React.ForwardedRef<FormAdapter<TData>> }
) => React.ReactElement;

// FormContent
function FormContent({ className, ...props }: React.ComponentProps<"form">) {
  const { form } = useFormContext();
  return (
    <form
      data-slot="form-content"
      onSubmit={form.handleSubmit}
      className={cn("space-y-4", className)}
      {...props}
    />
  );
}

// FormFields
function FormFields({ className, ...props }: React.ComponentProps<"div">) {
  const { fields, form, registry } = useFormContext();
  return (
    <FieldGroup
      data-slot="field-group"
      className={cn("gap-2", className)}
      {...props}
    >
      <RenderFields fields={fields} form={form} registry={registry} />
    </FieldGroup>
  );
}

// FormField
function FormField({
  name,
  className,
  ...props
}: React.ComponentProps<"div"> & { name: string }) {
  const { fields, form, registry } = useFormContext();
  const field = React.useMemo(
    () => fields.find((f) => "name" in f && f.name === name),
    [fields, name]
  );

  if (!field) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`FormField: Field "${name}" not found in schema.`);
    }
    return null;
  }

  return (
    <div data-slot="form-field" className={className} {...props}>
      <FieldRenderer
        field={field}
        path={name}
        form={form}
        registry={registry}
      />
    </div>
  );
}

type FormActionProps = ButtonProps;

function FormAction({
  children,
  disabled: propDisabled,
  ...props
}: FormActionProps) {
  const { form, disabled: formDisabled } = useFormContext();
  const { isSubmitting, isLoading } = form.formState;

  return (
    <Button
      disabled={propDisabled || formDisabled || isSubmitting || isLoading}
      {...props}
    >
      {children}
    </Button>
  );
}

type FormSubmitProps = Omit<ButtonProps, "disabled"> & {
  disabled?: boolean;
  submittingText?: string;
};

function FormSubmit({
  children,
  className,
  disabled: propDisabled,
  variant,
  size,
  submittingText = "Submitting...",
  ...props
}: FormSubmitProps) {
  const {
    form,
    disabled: formDisabled,
    requireDirty,
    disableIfInvalid,
  } = useFormContext();
  const { isSubmitting, isLoading, isDirty, isValid } = form.formState;

  const isDisabled =
    propDisabled ||
    formDisabled ||
    isSubmitting ||
    isLoading ||
    (requireDirty && !isDirty) ||
    (disableIfInvalid && !isValid);

  return (
    <Button
      type="submit"
      data-slot="form-submit"
      disabled={isDisabled}
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {isSubmitting ? submittingText : children || "Submit"}
    </Button>
  );
}

type FormResetProps = Omit<ButtonProps, "disabled" | "onClick"> & {
  disabled?: boolean;
};

function FormReset({
  children,
  className,
  disabled: propDisabled,
  variant = "outline",
  size,
  ...props
}: FormResetProps) {
  const { form, disabled: formDisabled } = useFormContext();
  const { isSubmitting, isDirty } = form.formState;

  return (
    <Button
      type="button"
      data-slot="form-reset"
      variant={variant}
      size={size}
      onClick={() => form.reset()}
      disabled={propDisabled || formDisabled || isSubmitting || !isDirty}
      className={className}
      {...props}
    >
      {children || "Reset"}
    </Button>
  );
}

// FormActions
function FormActions({
  className,
  align = "end",
  ...props
}: React.ComponentProps<"div"> & {
  align?: "start" | "center" | "end" | "between";
}) {
  return (
    <div
      data-slot="form-actions"
      data-align={align}
      className={cn(
        "flex gap-2",
        align === "start" && "justify-start",
        align === "center" && "justify-center",
        align === "end" && "justify-end",
        align === "between" && "justify-between",
        className
      )}
      {...props}
    />
  );
}

// FormMessage
function FormMessage({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { form } = useFormContext();
  const rootError = form.formState.errors[""] || form.formState.errors["root"];
  const message =
    children || (typeof rootError === "string" ? rootError : null);

  if (!message) return null;

  return (
    <div
      role="alert"
      data-slot="form-message"
      className={cn(
        "rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive",
        className
      )}
      {...props}
    >
      {message}
    </div>
  );
}

// Exports
export {
  Form,
  FormContent,
  FormFields,
  FormField,
  FormSubmit,
  FormReset,
  FormAction,
  FormActions,
  FormMessage,
  useFormContext,
  type FormProps,
};
