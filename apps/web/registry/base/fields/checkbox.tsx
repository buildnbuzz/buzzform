"use client";

import type {
  CheckboxField as CheckboxFieldType,
  FormAdapter,
} from "@buildnbuzz/buzzform";
import { generateFieldId } from "@buildnbuzz/buzzform";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

export interface CheckboxFieldProps {
  field: CheckboxFieldType;
  path: string;
  form: FormAdapter;
  autoFocus?: boolean;
  formValues: Record<string, unknown>;
  siblingData: Record<string, unknown>;
}

export function CheckboxField({
  field,
  path,
  form,
  autoFocus,
  formValues,
  siblingData,
}: CheckboxFieldProps) {
  const value = form.watch<boolean>(path) ?? false;

  const error = form.formState.errors[path];
  const errorMessage =
    typeof error === "string"
      ? error
      : Array.isArray(error)
        ? error[0]
        : undefined;
  const hasError = !!errorMessage;

  const isDisabled =
    (typeof field.disabled === "function"
      ? field.disabled(formValues, siblingData)
      : (field.disabled ?? false)) || form.formState.isSubmitting;

  const isReadOnly =
    typeof field.readOnly === "function"
      ? field.readOnly(formValues, siblingData)
      : (field.readOnly ?? false);

  const label = field.label !== false ? (field.label ?? field.name) : null;
  const fieldId = field.id ?? generateFieldId(path);

  const handleChange = (checked: boolean | "indeterminate") => {
    if (isReadOnly) return;
    const newValue = checked === "indeterminate" ? false : checked;
    form.setValue(path, newValue, {
      shouldDirty: true,
    });
  };

  return (
    <Field
      orientation="horizontal"
      className={field.style?.className}
      data-invalid={hasError}
      data-disabled={isDisabled}
      style={
        field.style?.width
          ? {
              width:
                typeof field.style.width === "number"
                  ? `${field.style.width}px`
                  : field.style.width,
            }
          : undefined
      }
    >
      <Checkbox
        id={fieldId}
        checked={value}
        onCheckedChange={handleChange}
        disabled={isDisabled}
        aria-invalid={hasError}
        aria-describedby={
          field.description ? `${fieldId}-description` : undefined
        }
        aria-readonly={isReadOnly}
        autoFocus={autoFocus}
      />

      <FieldContent>
        {label && (
          <FieldLabel
            htmlFor={fieldId}
            className="cursor-pointer m-0 font-normal flex-none gap-1 items-baseline"
          >
            {field.required && <span className="text-destructive">*</span>}
            {label}
          </FieldLabel>
        )}

        {field.description && (
          <FieldDescription id={`${fieldId}-description`}>
            {field.description}
          </FieldDescription>
        )}

        {errorMessage && <FieldError>{errorMessage}</FieldError>}
      </FieldContent>
    </Field>
  );
}

export function CheckboxFieldSkeleton({ field }: { field: CheckboxFieldType }) {
  const label = field.label !== false ? (field.label ?? field.name) : null;

  return (
    <Field
      orientation="horizontal"
      className={field.style?.className}
      style={
        field.style?.width
          ? {
              width:
                typeof field.style.width === "number"
                  ? `${field.style.width}px`
                  : field.style.width,
            }
          : undefined
      }
    >
      {/* Checkbox skeleton */}
      <div className="size-4 shrink-0 animate-pulse rounded bg-muted" />

      <FieldContent>
        {label && <div className="h-4 w-24 animate-pulse rounded bg-muted" />}
        {field.description && (
          <div className="h-3 w-48 animate-pulse rounded bg-muted" />
        )}
      </FieldContent>
    </Field>
  );
}
