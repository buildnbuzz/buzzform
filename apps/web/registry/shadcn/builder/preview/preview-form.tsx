"use client";

import { useBuilderFormContext } from "@buildnbuzz/form-builder-react";
import {
  Form,
  FormContent,
  FormFields,
  FormActions,
  FormSubmit,
} from "@/registry/shadcn/form";

/**
 * PreviewForm: Renders the builder's current state as a functional shadcn-based form.
 * Uses the form instance provided by BuilderFormProvider.
 */
export function PreviewForm() {
  const { form, fields } = useBuilderFormContext();

  return (
    <Form form={form} schema={{ fields }}>
      <FormContent noValidate className="p-0 gap-6">
        <FormFields />
        <FormActions className="mt-4" align="start">
          <FormSubmit>Submit Form</FormSubmit>
        </FormActions>
      </FormContent>
    </Form>
  );
}
