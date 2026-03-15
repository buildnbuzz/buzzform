"use client";

import type { TextField as TextFieldDef } from "@buildnbuzz/form-core";
import { useFieldContext, useResolvedFieldText } from "@buildnbuzz/form-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TextField() {
  const { fieldApi, field, isDisabled, isReadOnly } =
    useFieldContext<TextFieldDef>();

  const { label, placeholder, description } = useResolvedFieldText({
    labelFallback: field.name,
  });

  const errors = fieldApi.state.meta.errors ?? [];
  const errorText = errors
    .map((e) => (typeof e === "string" ? e : undefined))
    .filter(Boolean)
    .join(", ");

  const shouldShowErrors =
    fieldApi.state.meta.isTouched ||
    fieldApi.state.meta.isDirty ||
    fieldApi.form.state.submissionAttempts > 0;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <Label htmlFor={fieldApi.name}>
          {label}
          {field.required === true ? (
            <span className="text-red-500 ml-1">*</span>
          ) : null}
        </Label>
      )}

      <Input
        id={fieldApi.name}
        name={fieldApi.name}
        type="text"
        autoComplete={field.autoComplete}
        value={(fieldApi.state.value as string) ?? ""}
        onChange={(e) => fieldApi.handleChange(e.target.value)}
        onBlur={fieldApi.handleBlur}
        placeholder={placeholder}
        disabled={isDisabled}
        readOnly={isReadOnly}
        minLength={field.minLength}
        maxLength={field.maxLength}
      />

      {description && !errorText && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {shouldShowErrors && errorText && !fieldApi.state.meta.isValid ? (
        <p className="text-sm text-red-500">{errorText}</p>
      ) : null}
    </div>
  );
}
