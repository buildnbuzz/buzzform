"use client";

import * as React from "react";
import {
  Form as HeadlessForm,
  FormProvider,
  RenderFields,
  RegistryContext,
  useForm,
  type FieldFormApi,
  type FieldRegistry,
  type UseFormOptionsWithSchema,
} from "@buildnbuzz/form-react";
import type {
  Field as CoreField,
  FormSchema,
  ValidationRun,
} from "@buildnbuzz/form-core";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Context ---

interface FormContextValue {
  form: FieldFormApi;
  registry: FieldRegistry;
  schema?: FormSchema;
  formId: string;
  derivedValidationMode?: ValidationRun;
}

const FormContext = React.createContext<FormContextValue | null>(null);

function useFormContext(): FormContextValue {
  const ctx = React.useContext(FormContext);
  if (!ctx) throw new Error("Must be used within <Form>");
  return ctx;
}

// --- Types ---

type FormActionsConfig = {
  /** Label for the submit button. Defaults to "Submit". */
  submitLabel?: string;
  /** Props forwarded to the submit button. */
  submitProps?: Omit<FormSubmitProps, "children">;
  /** Alignment of the actions row. Defaults to "end". */
  align?: FormActionsProps["align"];
  /** Whether to show a reset button. Defaults to false. */
  showReset?: boolean;
  /** Label for the reset button. Defaults to "Reset". */
  resetLabel?: string;
  /** Props forwarded to the reset button. */
  resetProps?: Omit<FormResetProps, "children">;
};

type FormOwnProps = {
  registry?: FieldRegistry;
  children?: React.ReactNode;
  actions?: FormActionsConfig;
};

type FormWithInstance = FormOwnProps & {
  form: FieldFormApi;
  schema?: FormSchema;
  derivedValidationMode?: ValidationRun;
};

type FormWithSchema<TSchema extends FormSchema = FormSchema> = FormOwnProps &
  UseFormOptionsWithSchema<TSchema> & {
    form?: never;
  };

type FormProps<TSchema extends FormSchema = FormSchema> =
  | FormWithInstance
  | FormWithSchema<TSchema>;

// --- Form ---

function Form<TSchema extends FormSchema = FormSchema>(
  props: FormProps<TSchema>,
) {
  const contextRegistry = React.useContext(RegistryContext);
  const registry = props.registry ?? contextRegistry;
  const formId = React.useId();

  if (!registry) {
    throw new Error(
      "No field registry found. Pass `registry` to <Form> or wrap with <FormProvider>.",
    );
  }

  if ("form" in props && props.form) {
    return (
      <FormContext.Provider
        value={{
          form: props.form,
          registry,
          schema: props.schema,
          formId,
          derivedValidationMode: props.derivedValidationMode,
        }}
      >
        <FormProvider registry={registry}>{props.children}</FormProvider>
      </FormContext.Provider>
    );
  }

  return (
    <FormInner
      {...(props as FormWithSchema<TSchema>)}
      registry={registry}
      formId={formId}
    />
  );
}

function FormInner<TSchema extends FormSchema = FormSchema>({
  registry,
  formId,
  children,
  schema,
  actions,
  defaultValues,
  onSubmit,
  customValidators,
  contextData,
  derivedValidationMode,
  ...tanstackOpts
}: FormWithSchema<TSchema> & { registry: FieldRegistry; formId: string }) {
  if (process.env.NODE_ENV === "development" && children && actions) {
    console.warn(
      "<Form>: `actions` prop is ignored when children are provided.",
    );
  }

  const {
    submitLabel = "Submit",
    submitProps,
    align = "end",
    showReset = false,
    resetLabel = "Reset",
    resetProps,
  } = actions ?? {};

  const form = useForm<TSchema>({
    schema: schema as TSchema,
    defaultValues,
    onSubmit,
    customValidators,
    contextData,
    derivedValidationMode,
    ...tanstackOpts,
  } as UseFormOptionsWithSchema<TSchema>);

  return (
    <FormContext.Provider
      value={{ form, registry, schema, formId, derivedValidationMode }}
    >
      <FormProvider registry={registry}>
        {children ?? (
          <FormContent>
            <FormFields />
            <FormActions align={align}>
              {showReset && <FormReset {...resetProps}>{resetLabel}</FormReset>}
              <FormSubmit {...submitProps}>{submitLabel}</FormSubmit>
            </FormActions>
          </FormContent>
        )}
      </FormProvider>
    </FormContext.Provider>
  );
}

// --- FormContent ---

type FormContentProps = Omit<React.ComponentProps<"form">, "onSubmit"> & {
  autoRender?: boolean;
};

function FormContent({
  className,
  autoRender,
  children,
  ...props
}: FormContentProps) {
  const { form, registry, formId, derivedValidationMode } = useFormContext();

  return (
    <HeadlessForm
      id={formId}
      form={form}
      registry={registry}
      derivedValidationMode={derivedValidationMode}
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      {autoRender ? (
        <>
          <FormFields />
          {children}
        </>
      ) : (
        children
      )}
    </HeadlessForm>
  );
}

// --- FormFields ---

type FormFieldsProps = {
  className?: string;
};

function FormFields({ className }: FormFieldsProps) {
  const { form, registry, schema, derivedValidationMode } = useFormContext();
  const fields = (schema?.fields ?? []) as readonly CoreField[];

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <RenderFields
        fields={fields}
        form={form}
        registry={registry}
        derivedValidationMode={derivedValidationMode}
      />
    </div>
  );
}

// --- FormActions ---

type FormActionsProps = React.ComponentProps<"div"> & {
  align?: "start" | "center" | "end" | "between";
};

function FormActions({ className, align = "end", ...props }: FormActionsProps) {
  return (
    <div
      data-slot="form-actions"
      className={cn(
        "flex gap-2",
        align === "start" && "justify-start",
        align === "center" && "justify-center",
        align === "end" && "justify-end",
        align === "between" && "justify-between",
        className,
      )}
      {...props}
    />
  );
}

// --- FormSubmit ---

type FormSubmitProps = Omit<
  React.ComponentProps<typeof Button>,
  "type" | "form"
> & {
  submittingText?: string;
};

function FormSubmit({
  children,
  submittingText = "Submitting...",
  disabled,
  ...props
}: FormSubmitProps) {
  const { form, formId } = useFormContext();
  return (
    <form.Subscribe
      selector={(s) => ({
        canSubmit: s.canSubmit,
        isSubmitting: s.isSubmitting,
      })}
    >
      {({ canSubmit, isSubmitting }) => (
        <Button
          type="submit"
          form={formId}
          disabled={disabled || !canSubmit || isSubmitting}
          {...props}
        >
          {isSubmitting ? submittingText : (children ?? "Submit")}
        </Button>
      )}
    </form.Subscribe>
  );
}

// --- FormReset ---

type FormResetProps = Omit<
  React.ComponentProps<typeof Button>,
  "type" | "onClick"
> & {
  disabled?: boolean;
};

function FormReset({
  children,
  disabled,
  variant = "outline",
  ...props
}: FormResetProps) {
  const { form } = useFormContext();
  return (
    <form.Subscribe
      selector={(s) => ({ isSubmitting: s.isSubmitting, isDirty: s.isDirty })}
    >
      {({ isSubmitting, isDirty }) => (
        <Button
          type="button"
          variant={variant}
          disabled={disabled || isSubmitting || !isDirty}
          onClick={() => form.reset()}
          {...props}
        >
          {children ?? "Reset"}
        </Button>
      )}
    </form.Subscribe>
  );
}

// --- FormMessage ---

function FormMessage({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { form } = useFormContext();
  return (
    <form.Subscribe selector={(s) => s.errors}>
      {(errors) => {
        const rootError = errors[0];
        const message =
          children ?? (typeof rootError === "string" ? rootError : null);
        if (!message) return null;
        return (
          <div
            role="alert"
            data-slot="form-message"
            className={cn(
              "rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive",
              className,
            )}
            {...props}
          >
            {message}
          </div>
        );
      }}
    </form.Subscribe>
  );
}

// --- Exports ---

export {
  Form,
  FormContent,
  FormFields,
  FormActions,
  FormSubmit,
  FormReset,
  FormMessage,
  useFormContext,
  type FormProps,
  type FormContentProps,
  type FormActionsProps,
  type FormSubmitProps,
  type FormResetProps,
};
