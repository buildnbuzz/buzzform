"use client";

import { useRef, useEffect } from "react";
import type { TextareaField as TextareaFieldDef } from "@buildnbuzz/form-core";
import { useDataField } from "@buildnbuzz/form-react";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "../components/copy-button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface TextareaUi {
  autoResize?: boolean;
  rows?: number;
  copyable?: boolean;
  autoFocus?: boolean;
  className?: string;
  width?: string | number;
}

export function TextareaField() {
  const {
    fieldApi,
    field,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    placeholder,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
    ariaDescribedBy,
    handleChange,
    handleBlur,
  } = useDataField<TextareaFieldDef>();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const value = (fieldApi.state.value as string) ?? "";
  const ui = field.ui as TextareaUi | undefined;

  const width = ui?.width;
  const widthStyle = width
    ? {
        width: typeof width === "number" ? `${width}px` : width,
        flex: "0 1 auto",
      }
    : undefined;

  // Character count logic
  const showCharCount = field.maxLength !== undefined;
  const charCount = typeof value === "string" ? value.length : 0;
  const isOverLimit = showCharCount && charCount > field.maxLength!;

  // Auto-resize logic
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea && ui?.autoResize) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, ui?.autoResize]);

  return (
    <FieldGroup
      data-field={fieldApi.name}
      className={ui?.className}
      style={widthStyle}
    >
      <Field data-invalid={isInvalid || isOverLimit} data-disabled={isDisabled}>
        {label && (
          <FieldLabel htmlFor={fieldApi.name} className="gap-1 items-baseline">
            {label}
            {isRequired ? <span className="text-destructive">*</span> : null}
          </FieldLabel>
        )}

        <FieldContent>
          <div className={cn("relative", ui?.copyable && "flex items-start")}>
            <Textarea
              ref={textareaRef}
              id={fieldApi.name}
              name={fieldApi.name}
              autoComplete={field.autoComplete}
              autoFocus={ui?.autoFocus}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={isDisabled}
              readOnly={isReadOnly}
              aria-invalid={isInvalid || isOverLimit}
              aria-describedby={ariaDescribedBy}
              minLength={field.minLength}
              maxLength={field.maxLength}
              required={isRequired}
              rows={ui?.rows ?? 3}
              className={cn(ui?.copyable && "pr-9")}
              style={
                ui?.autoResize
                  ? { resize: "none", overflow: "hidden" }
                  : ({
                      resize: "none",
                      fieldSizing: "fixed",
                    } as React.CSSProperties)
              }
            />
            {ui?.copyable && (
              <CopyButton
                value={value}
                disabled={isDisabled}
                className="absolute right-0 top-0 h-9 px-2.5 text-muted-foreground hover:text-foreground"
              />
            )}
          </div>

          {/* Character count */}
          {showCharCount && (
            <div
              className={cn(
                "text-xs mt-1.5 text-right",
                isOverLimit ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {charCount} / {field.maxLength}
            </div>
          )}
        </FieldContent>

        {description && !isInvalid && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {isInvalid && <FieldError id={errorId} errors={errors} />}
      </Field>
    </FieldGroup>
  );
}
