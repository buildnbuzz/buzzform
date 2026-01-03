"use client";

import React from "react";
import type {
  TextField as TextFieldType,
  FormAdapter,
} from "@buildnbuzz/buzzform";
import { generateFieldId } from "@buildnbuzz/buzzform";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/buzzform/copy";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

export interface TextFieldProps {
  field: TextFieldType;
  path: string;
  form: FormAdapter;
  autoFocus?: boolean;
  formValues: Record<string, unknown>;
  siblingData: Record<string, unknown>;
}

export function TextField({
  field,
  path,
  form,
  autoFocus,
  formValues,
  siblingData,
}: TextFieldProps) {
  const value = form.watch<string>(path) ?? "";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue(path, e.target.value, {
      shouldDirty: true,
    });
  };

  const handleBlur = () => {
    if (field.trim && typeof value === "string") {
      const trimmedValue = value.trim();
      if (trimmedValue !== value) {
        form.setValue(path, trimmedValue, {
          shouldDirty: true,
        });
      }
    }
    form.onBlur(path);
  };

  // Convert pattern to string if it's a RegExp
  const pattern = field.pattern
    ? typeof field.pattern === "string"
      ? field.pattern
      : field.pattern.source
    : undefined;

  return (
    <Field
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
      {label && (
        <FieldLabel htmlFor={fieldId} className="gap-1 items-baseline">
          {label}
          {field.required && <span className="text-destructive">*</span>}
        </FieldLabel>
      )}

      <FieldContent>
        <div className="relative">
          <Input
            id={fieldId}
            name={path}
            type={field.type}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            disabled={isDisabled}
            readOnly={isReadOnly}
            autoComplete={field.autoComplete}
            aria-invalid={hasError}
            aria-describedby={
              field.description ? `${fieldId}-description` : undefined
            }
            minLength={field.minLength}
            maxLength={field.maxLength}
            pattern={pattern}
            required={field.required}
            autoFocus={autoFocus}
            className={field.ui?.copyable ? "pr-10" : ""}
          />
          {field.ui?.copyable && value && (
            <CopyButton
              value={value}
              disabled={isDisabled}
              className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
            />
          )}
        </div>
      </FieldContent>

      {field.description && (
        <FieldDescription id={`${fieldId}-description`}>
          {field.description}
        </FieldDescription>
      )}

      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </Field>
  );
}

export function TextFieldSkeleton({ field }: { field: TextFieldType }) {
  const label = field.label !== false ? (field.label ?? field.name) : null;

  return (
    <Field
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
      {label && <div className="h-4 w-24 animate-pulse rounded bg-muted" />}
      <FieldContent>
        <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
      </FieldContent>
      {field.description && (
        <div className="h-3 w-48 animate-pulse rounded bg-muted" />
      )}
    </Field>
  );
}
