"use client";

import type { TristateCheckboxField as TristateCheckboxFieldDef } from "@buildnbuzz/form-core";
import { useDataField } from "@buildnbuzz/form-react";
import { Checkbox } from "../components/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

interface TristateCheckboxUi {
  autoFocus?: boolean;
  className?: string;
  width?: string | number;
}

/** Cycles null → true → false → null on each click. */
function nextTristateValue(current: boolean | null): boolean | null {
  if (current === null) return true;
  if (current === true) return false;
  return null;
}

/**
 * A tristate checkbox field component.
 *
 * Uses a registry Checkbox wrapper to support indeterminate state
 * with icon placeholders.
 */
export function TristateCheckboxField() {
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
  } = useDataField<TristateCheckboxFieldDef>();

  const value = (fieldApi.state.value as boolean | null) ?? null;
  const ui = field.ui as TristateCheckboxUi | undefined;

  const width = ui?.width;
  const widthStyle = width
    ? {
        width: typeof width === "number" ? `${width}px` : width,
        flex: "0 1 auto",
      }
    : undefined;

  // Base UI uses `checked` (boolean) + `indeterminate` (boolean) separately
  const checked = value === true;
  const indeterminate = value === null;

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
          checked={checked}
          indeterminate={indeterminate}
          onCheckedChange={() => {
            if (isReadOnly) return;
            handleChange(nextTristateValue(value));
            handleBlur();
          }}
          disabled={isDisabled}
          aria-invalid={isInvalid}
          aria-describedby={ariaDescribedBy}
          aria-readonly={isReadOnly}
          autoFocus={ui?.autoFocus}
          data-slot="checkbox"
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
