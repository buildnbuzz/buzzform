"use client";

import type { CheckboxField as CheckboxFieldDef } from "@buildnbuzz/form-core";
import { useDataField } from "@buildnbuzz/form-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export function CheckboxField() {
  const {
    fieldApi,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
    ariaDescribedBy,
  } = useDataField<CheckboxFieldDef>();

  const value = (fieldApi.state.value as boolean) ?? false;

  return (
    <FieldGroup data-field={fieldApi.name}>
      <Field
        orientation="horizontal"
        data-invalid={isInvalid}
        data-disabled={isDisabled}
      >
        <Checkbox
          id={fieldApi.name}
          checked={value}
          onCheckedChange={(checked) => {
            if (isReadOnly) return;
            fieldApi.handleChange(!!checked);
          }}
          disabled={isDisabled}
          aria-invalid={isInvalid}
          aria-describedby={ariaDescribedBy}
          aria-readonly={isReadOnly}
        />

        <FieldContent>
          {label && (
            <FieldLabel
              htmlFor={fieldApi.name}
              className="cursor-pointer m-0 font-normal flex-none gap-1 items-baseline"
            >
              {isRequired && <span className="text-destructive">*</span>}
              {label}
            </FieldLabel>
          )}

          {description && !isInvalid && (
            <FieldDescription id={descriptionId}>{description}</FieldDescription>
          )}

          {isInvalid && <FieldError id={errorId} errors={errors} />}
        </FieldContent>
      </Field>
    </FieldGroup>
  );
}
