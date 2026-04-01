"use client";

import type { SwitchField as SwitchFieldDef } from "@buildnbuzz/form-core";
import { useDataField } from "@buildnbuzz/form-react";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface SwitchUi {
  alignment?: "start" | "end" | "between";
  autoFocus?: boolean;
}

export function SwitchField() {
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
  } = useDataField<SwitchFieldDef>();

  const value = (fieldApi.state.value as boolean) ?? false;
  const ui = field.ui as SwitchUi | undefined;
  const alignment = ui?.alignment ?? "between";

  const switchElement = (
    <Switch
      id={fieldApi.name}
      checked={value}
      onCheckedChange={(checked) => {
        if (isReadOnly) return;
        handleChange(checked);
        handleBlur();
      }}
      disabled={isDisabled}
      aria-invalid={isInvalid}
      aria-describedby={ariaDescribedBy}
      aria-readonly={isReadOnly}
      autoFocus={ui?.autoFocus}
    />
  );

  const contentElement = (
    <FieldContent className={alignment === "between" ? "flex-1" : undefined}>
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
  );

  return (
    <FieldGroup data-field={fieldApi.name}>
      <Field
        orientation="horizontal"
        className={cn(alignment === "between" && "w-full justify-between")}
        data-invalid={isInvalid}
        data-disabled={isDisabled}
      >
        {alignment === "start" && (
          <>
            {switchElement}
            {contentElement}
          </>
        )}
        {(alignment === "end" || alignment === "between") && (
          <>
            {contentElement}
            {switchElement}
          </>
        )}
      </Field>
    </FieldGroup>
  );
}
