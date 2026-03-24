"use client";

import type { NumberField as NumberFieldDef } from "@buildnbuzz/form-core";
import { useDataField } from "@buildnbuzz/form-react";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export function NumberField() {
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
  } = useDataField<NumberFieldDef>();

  const value = fieldApi.state.value as number | undefined;

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
          <Input
            id={fieldApi.name}
            name={fieldApi.name}
            type="number"
            autoComplete={field.autoComplete}
            value={value ?? ""}
            onChange={(e) =>
              fieldApi.handleChange(
                e.target.value === "" ? undefined : Number(e.target.value),
              )
            }
            onBlur={fieldApi.handleBlur}
            placeholder={placeholder}
            disabled={isDisabled}
            readOnly={isReadOnly}
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            aria-invalid={isInvalid}
            aria-describedby={ariaDescribedBy}
            required={isRequired}
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
