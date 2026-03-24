"use client";

import type { TextField as TextFieldDef } from "@buildnbuzz/form-core";
import { useDataField } from "@buildnbuzz/form-react";
import { Input } from "@/components/ui/input";
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

interface TextUi {
  copyable?: boolean;
  autoFocus?: boolean;
  className?: string;
  width?: string | number;
}

export function TextField() {
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
  } = useDataField<TextFieldDef>();

  const value = (fieldApi.state.value as string) ?? "";
  const ui = field.ui as TextUi | undefined;

  const width = ui?.width;
  const widthStyle = width
    ? {
        width: typeof width === "number" ? `${width}px` : width,
        flex: "0 1 auto",
      }
    : undefined;

  return (
    <FieldGroup
      data-field={fieldApi.name}
      className={ui?.className}
      style={widthStyle}
    >
      <Field data-invalid={isInvalid} data-disabled={isDisabled}>
        {label && (
          <FieldLabel htmlFor={fieldApi.name} className="gap-1 items-baseline">
            {label}
            {isRequired ? <span className="text-destructive">*</span> : null}
          </FieldLabel>
        )}

        <FieldContent>
          <div className={cn("relative", ui?.copyable && "flex items-center")}>
            <Input
              id={fieldApi.name}
              name={fieldApi.name}
              type="text"
              autoComplete={field.autoComplete}
              autoFocus={ui?.autoFocus}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={isDisabled}
              readOnly={isReadOnly}
              aria-invalid={isInvalid}
              aria-describedby={ariaDescribedBy}
              minLength={field.minLength}
              maxLength={field.maxLength}
              required={isRequired}
              className={cn(ui?.copyable && "pr-9")}
            />
            {ui?.copyable && (
              <CopyButton
                value={value}
                disabled={isDisabled}
                className="absolute right-0 top-0 h-full px-2.5 text-muted-foreground hover:text-foreground"
              />
            )}
          </div>
        </FieldContent>

        {description && !isInvalid && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {isInvalid && <FieldError id={errorId} errors={errors} />}
      </Field>
    </FieldGroup>
  );
}
