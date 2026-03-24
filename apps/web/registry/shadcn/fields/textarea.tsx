"use client";

import { useRef, useEffect } from "react";
import type { TextareaField as TextareaFieldDef } from "@buildnbuzz/form-core";
import { useDataField } from "@buildnbuzz/form-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

interface TextareaUi {
  autoResize?: boolean;
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
  } = useDataField<TextareaFieldDef>();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const value = (fieldApi.state.value as string) ?? "";
  const ui = field.ui as TextareaUi | undefined;

  // Auto-resize logic
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea && ui?.autoResize) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, ui?.autoResize]);

  return (
    <FieldGroup data-field={fieldApi.name}>
      <Field data-invalid={isInvalid} data-disabled={isDisabled}>
        {label && (
          <FieldLabel htmlFor={fieldApi.name} className="gap-1 items-baseline">
            {label}
            {isRequired ? <span className="text-destructive">*</span> : null}
          </FieldLabel>
        )}

        <FieldContent>
          <Textarea
            ref={textareaRef}
            id={fieldApi.name}
            name={fieldApi.name}
            autoComplete={field.autoComplete}
            value={value}
            onChange={(e) => fieldApi.handleChange(e.target.value)}
            onBlur={fieldApi.handleBlur}
            placeholder={placeholder}
            disabled={isDisabled}
            readOnly={isReadOnly}
            aria-invalid={isInvalid}
            aria-describedby={ariaDescribedBy}
            minLength={field.minLength}
            maxLength={field.maxLength}
            required={isRequired}
            style={
              ui?.autoResize
                ? { resize: "none", overflow: "hidden" }
                : undefined
            }
          />
        </FieldContent>

        {description && !isInvalid && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {isInvalid && <FieldError id={errorId} errors={errors} />}
      </Field>
    </FieldGroup>
  );
}
