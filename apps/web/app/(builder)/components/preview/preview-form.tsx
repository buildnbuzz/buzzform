"use client";

import {
  FormFields,
  FormActions,
  FormSubmit,
  FormContent,
} from "@/registry/base/form";

// PreviewForm: Pure BuzzForm rendering with zero builder logic
export function PreviewForm() {
  return (
    <FormContent noValidate>
      <FormFields />
      <FormActions className="mt-4" align="start">
        <FormSubmit>Submit</FormSubmit>
      </FormActions>
    </FormContent>
  );
}
