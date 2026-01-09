"use client";

import React, { useRef, useEffect } from "react";
import type {
  TextareaField as TextareaFieldType,
  FormAdapter,
} from "@buildnbuzz/buzzform";
import { getFieldWidthStyle } from "@buildnbuzz/buzzform";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/buzzform/copy";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

export interface TextareaFieldProps {
  field: TextareaFieldType;
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

export function TextareaField({
  field,
  path,
  form,
  autoFocus,
  fieldId,
  label,
  isDisabled,
  isReadOnly,
  error,
}: TextareaFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const value = form.watch<string>(path) ?? "";
  const hasError = !!error;

  // Auto-resize logic
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea && field.autoResize) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      // Set height to scrollHeight to fit content
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // Adjust height on value change and autoResize setting
  useEffect(() => {
    adjustHeight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, field.autoResize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    form.setValue(path, e.target.value, {
      shouldDirty: true,
    });
  };

  const handleBlur = () => {
    form.onBlur?.(path);
  };

  // Character count for maxLength
  const showCharCount = field.maxLength !== undefined;
  const charCount = value.length;
  const isOverLimit =
    field.maxLength !== undefined && charCount > field.maxLength;

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
          <Textarea
            ref={textareaRef}
            id={fieldId}
            name={path}
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
            required={field.required}
            autoFocus={autoFocus}
            rows={field.rows ?? 3}
            className={field.ui?.copyable ? "pr-10" : ""}
            style={
              field.autoResize
                ? { resize: "none", overflow: "hidden" }
                : undefined
            }
          />
          {field.ui?.copyable && value && (
            <CopyButton
              value={value}
              disabled={isDisabled}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
            />
          )}
        </div>

        {/* Character count */}
        {showCharCount && (
          <div
            className={`text-xs mt-1 text-right ${
              isOverLimit ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {charCount}
            {field.maxLength !== undefined && ` / ${field.maxLength}`}
          </div>
        )}
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

export function TextareaFieldSkeleton({ field }: { field: TextareaFieldType }) {
  const label = field.label !== false ? (field.label ?? field.name) : null;
  const rows = field.rows ?? 3;
  // Approximate height: ~24px per row + padding
  const skeletonHeight = rows * 24 + 16;

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
        <div
          className="w-full animate-pulse rounded-lg bg-muted"
          style={{ height: `${skeletonHeight}px` }}
        />
      </FieldContent>
      {field.description && (
        <div className="h-3 w-48 animate-pulse rounded bg-muted" />
      )}
    </Field>
  );
}
