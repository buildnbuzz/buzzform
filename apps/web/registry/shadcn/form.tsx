"use client";

import {
  Form as HeadlessForm,
  RenderFields,
  RegistryContext,
  useForm,
  type FieldRegistry,
  type UseFormOptionsWithSchema,
} from "@buildnbuzz/form-react";
import type { Field as CoreField, FormSchema } from "@buildnbuzz/form-core";
import { Button } from "@/components/ui/button";
import { useContext } from "react";

type FormProps<TSchema extends FormSchema = FormSchema> =
  UseFormOptionsWithSchema<TSchema> & {
    className?: string;
    submitLabel?: string;
    submitClassName?: string;
    showSubmit?: boolean;
    registry?: FieldRegistry;
  };

export function Form<TSchema extends FormSchema = FormSchema>({
  schema,
  defaultValues,
  onSubmit,
  customValidators,
  contextData,
  derivedValidationMode,
  className,
  submitLabel = "Submit",
  submitClassName,
  showSubmit = true,
  registry,
  ...tanstackOpts
}: FormProps<TSchema>) {
  // Resolve registry: prop > FormProvider context > throw
  const contextRegistry = useContext(RegistryContext);
  const resolvedRegistry = registry ?? contextRegistry;

  if (!resolvedRegistry) {
    throw new Error(
      "No field registry found. Either:\n" +
        "  1. Wrap your app in <FormProvider registry={...}>, or\n" +
        "  2. Pass a registry prop to <Form registry={...}>",
    );
  }

  const schemaFields = schema.fields as readonly CoreField[];

  // Initialize the form engine
  const formOptions = {
    schema: schema as TSchema,
    defaultValues,
    onSubmit,
    customValidators,
    contextData,
    derivedValidationMode,
    ...tanstackOpts,
  } as UseFormOptionsWithSchema<TSchema>;

  const form = useForm<TSchema>(formOptions);

  return (
    <RegistryContext.Provider value={resolvedRegistry}>
      <HeadlessForm
        form={form}
        contextData={contextData}
        customValidators={customValidators}
        derivedValidationMode={derivedValidationMode}
        registry={resolvedRegistry}
        className={className || "space-y-4"}
      >
        <div className="flex flex-col gap-4">
          <RenderFields
            fields={schemaFields}
            form={form}
            contextData={contextData}
            customValidators={customValidators}
            derivedValidationMode={derivedValidationMode}
            registry={resolvedRegistry}
            renderFallback={(field: CoreField) => (
              <div className="rounded border border-destructive bg-destructive/10 p-2 text-xs text-destructive">
                Unsupported field type:{" "}
                <code className="font-mono">{field.type}</code>
              </div>
            )}
          />
        </div>

        {showSubmit && (
          <form.Subscribe
            selector={(state: {
              canSubmit: boolean;
              isSubmitting: boolean;
            }) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({
              canSubmit,
              isSubmitting,
            }: {
              canSubmit: boolean;
              isSubmitting: boolean;
            }) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className={submitClassName}
              >
                {isSubmitting ? "Submitting..." : submitLabel}
              </Button>
            )}
          </form.Subscribe>
        )}
      </HeadlessForm>
    </RegistryContext.Provider>
  );
}
