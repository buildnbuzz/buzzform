"use client";

import type { SelectField as SelectFieldDef } from "@buildnbuzz/form-core";
import { useDataField } from "@buildnbuzz/form-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export function SelectField() {
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
  } = useDataField<SelectFieldDef>();

  const value = (fieldApi.state.value as string) ?? "";
  
  // Use static options for simplicity in this baseline implementation
  const options = Array.isArray(field.options) ? field.options : [];

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
          <Select
            value={value || undefined}
            onValueChange={(val) => {
              if (isReadOnly) return;
              fieldApi.handleChange(val);
            }}
            disabled={isDisabled}
          >
            <SelectTrigger
              id={fieldApi.name}
              aria-invalid={isInvalid}
              aria-describedby={ariaDescribedBy}
            >
              <SelectValue>{value ? undefined : placeholder}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {options.map((opt, i) => {
                const optVal =
                  typeof opt === "string" ? opt : String(opt.value);
                const optLabel =
                  typeof opt === "string"
                    ? opt
                    : typeof opt.label === "string"
                      ? opt.label
                      : String(opt.value);
                const optDisabled = typeof opt === "object" && opt.disabled === true;

                return (
                  <SelectItem
                    key={`${optVal}-${i}`}
                    value={optVal}
                    disabled={optDisabled}
                  >
                    {optLabel}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </FieldContent>

        {description && !isInvalid && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {isInvalid && <FieldError id={errorId} errors={errors} />}
      </Field>
    </FieldGroup>
  );
}
