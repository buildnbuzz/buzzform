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

interface CheckboxUi {
  autoFocus?: boolean;
  className?: string;
  width?: string | number;
}

export function CheckboxField() {
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
    handleChange,
    handleBlur,
  } = useDataField<CheckboxFieldDef>();

  // Delegate to group renderer if hasMany
  if ("hasMany" in field && field.hasMany) {
    return <CheckboxGroupField />;
  }

  // Delegate to tristate renderer if tristate
  if ("tristate" in field && field.tristate) {
    return <TristateCheckboxField />;
  }

  const value = (fieldApi.state.value as boolean) ?? false;
  const ui = field.ui as CheckboxUi | undefined;

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
            handleChange(!!checked);
            handleBlur();
          }}
          disabled={isDisabled}
          aria-invalid={isInvalid}
          aria-describedby={ariaDescribedBy}
          aria-readonly={isReadOnly}
          autoFocus={ui?.autoFocus}
        />

        <FieldContent>
          {label && (
            <FieldLabel
              htmlFor={fieldApi.name}
              className="cursor-pointer m-0 font-normal inline"
            >
              {label}
              {isRequired && <span className="text-destructive">&nbsp;*</span>}
            </FieldLabel>
          )}

          {description && !isInvalid && (
            <FieldDescription id={descriptionId}>
              {description}
            </FieldDescription>
          )}

          {isInvalid && <FieldError id={errorId} errors={errors} />}
        </FieldContent>
      </Field>
    </FieldGroup>
  );
}

import { CheckboxGroupField } from "./checkbox-group";
import { TristateCheckboxField } from "./tristate-checkbox";
