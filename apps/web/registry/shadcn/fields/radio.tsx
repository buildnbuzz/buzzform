"use client";

import type { RadioField as RadioFieldDef } from "@buildnbuzz/form-core";
import { useDataField } from "@buildnbuzz/form-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  getSelectOptionValue,
  getSelectOptionLabel,
  isSelectOptionDisabled,
} from "@buildnbuzz/buzzform";
import { cn } from "@/lib/utils";

interface RadioUi {
  direction?: "vertical" | "horizontal";
}

export function RadioField() {
  const {
    fieldApi,
    field,
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
  } = useDataField<RadioFieldDef>();

  const value = (fieldApi.state.value as string) ?? "";
  const ui = field.ui as RadioUi | undefined;
  const isHorizontal = ui?.direction === "horizontal";

  // Get options (static only for now based on base implementation)
  const options = Array.isArray(field.options) ? field.options : [];

  return (
    <FieldGroup data-field={fieldApi.name}>
      <Field data-invalid={isInvalid} data-disabled={isDisabled}>
        {label && (
          <FieldLabel htmlFor={`${fieldApi.name}-0`}>
            {isRequired && <span className="text-destructive mr-1">*</span>}
            {label}
          </FieldLabel>
        )}

        {description && !isInvalid && (
          <FieldDescription id={descriptionId} className="mb-2">
            {description}
          </FieldDescription>
        )}

        <FieldContent>
          <RadioGroup
            value={value}
            onValueChange={(val) => {
              if (isReadOnly) return;
              fieldApi.handleChange(val);
            }}
            disabled={isDisabled}
            className={cn(
              isHorizontal && "flex flex-row flex-wrap gap-x-4 gap-y-2",
            )}
            aria-describedby={ariaDescribedBy}
          >
            {options.map((opt, i) => {
              const val = getSelectOptionValue(opt as any);
              const optLabel = getSelectOptionLabel(opt as any);
              const optDisabled = isSelectOptionDisabled(opt as any) || isDisabled;
              const id = `${fieldApi.name}-${i}`;

              return (
                <Field
                  key={`${val}-${i}`}
                  orientation="horizontal"
                  className={cn(
                    "items-center gap-2.5 space-y-0",
                    isHorizontal && "w-auto",
                    optDisabled && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <RadioGroupItem value={val} id={id} disabled={optDisabled} />
                  <FieldLabel
                    htmlFor={id}
                    className={cn(
                      "font-normal cursor-pointer m-0",
                      optDisabled && "cursor-not-allowed",
                    )}
                  >
                    {optLabel}
                  </FieldLabel>
                </Field>
              );
            })}
          </RadioGroup>
        </FieldContent>

        {isInvalid && <FieldError id={errorId} errors={errors} />}
      </Field>
    </FieldGroup>
  );
}
