"use client";

import React from "react";
import type {
  TextField as TextFieldType,
  FormAdapter,
} from "@buildnbuzz/buzzform";
import { getFieldWidthStyle } from "@buildnbuzz/buzzform";
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
  // Computed props
  fieldId: string;
  label: string | null;
  isDisabled: boolean;
  isReadOnly: boolean;
  error?: string;
}

export function TextField({
  field,
  path,
  form,
  autoFocus,
  fieldId,
  label,
  isDisabled,
  isReadOnly,
  error,
}: TextFieldProps) {
  const value = form.watch<string>(path) ?? "";
  const hasError = !!error;

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
    form.onBlur?.(path);
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
      style={getFieldWidthStyle(field.style)}
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

      {error && <FieldError>{error}</FieldError>}
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
