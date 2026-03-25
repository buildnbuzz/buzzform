"use client";

import type { CheckboxGroupField as CheckboxGroupFieldDef } from "@buildnbuzz/form-core";
import { useDataField, useFieldOptions } from "@buildnbuzz/form-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

type OptionGroupVariant = "default" | "card";
type OptionGroupDirection = "vertical" | "horizontal";
type OptionGroupColumns = 1 | 2 | 3 | 4 | string | number | undefined;

interface OptionUi {
  description?: string;
}

interface CheckboxGroupUi {
  variant?: OptionGroupVariant;
  direction?: OptionGroupDirection;
  columns?: OptionGroupColumns;
  card?: {
    size?: "sm" | "md" | "lg";
    bordered?: boolean;
  };
  autoFocus?: boolean;
  className?: string;
  width?: string | number;
}

const cardSizeClasses = {
  sm: "p-2.5 sm:p-3",
  md: "p-3 sm:p-4",
  lg: "p-4 sm:p-5",
} as const;

function getGridColumnsClass(columns: OptionGroupColumns | undefined) {
  if (columns === 2) return "sm:grid-cols-2";
  if (columns === 3) return "sm:grid-cols-2 md:grid-cols-3";
  if (columns === 4) return "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  return undefined;
}

function getLayoutClass({
  variant = "default",
  direction = "vertical",
  columns,
}: {
  variant?: OptionGroupVariant;
  direction?: OptionGroupDirection;
  columns?: OptionGroupColumns;
}) {
  const isCard = variant === "card";
  const isHorizontal = direction === "horizontal";

  if (isHorizontal && !columns)
    return "!flex flex-row flex-wrap gap-x-4 gap-y-2";

  const effectiveColumns =
    isCard || isHorizontal ? (columns ?? (isCard ? 2 : undefined)) : undefined;

  if (!effectiveColumns || effectiveColumns === 1) return "flex flex-col gap-2";

  return cn("grid gap-2", getGridColumnsClass(effectiveColumns));
}

export function CheckboxGroupField() {
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
    handleBlur,
  } = useDataField<CheckboxGroupFieldDef>();

  const { options } = useFieldOptions(field.options);
  const ui = field.ui as CheckboxGroupUi | undefined;

  const selected = Array.isArray(fieldApi.state.value)
    ? (fieldApi.state.value as string[])
    : [];

  const variant = ui?.variant ?? "default";
  const direction = ui?.direction ?? "vertical";
  const columns = ui?.columns;
  const cardSize = ui?.card?.size ?? "md";
  const cardBordered = ui?.card?.bordered ?? true;
  const isCardVariant = variant === "card";
  const isHorizontal = direction === "horizontal";
  const layoutClass = getLayoutClass({ variant, direction, columns });

  const width = ui?.width;
  const widthStyle = width
    ? {
        width: typeof width === "number" ? `${width}px` : width,
        flex: "0 1 auto",
      }
    : undefined;

  const handleToggle = (val: string, checked: boolean) => {
    if (isReadOnly) return;
    const maxSelected = field.maxSelected;
    const hasMax = typeof maxSelected === "number";
    if (checked && hasMax && selected.length >= maxSelected) return;

    const next = checked
      ? [...selected, val]
      : selected.filter((v) => v !== val);

    fieldApi.handleChange(next);
    handleBlur();
  };

  return (
    <FieldGroup
      data-field={fieldApi.name}
      className={ui?.className}
      style={widthStyle}
    >
      <div
        className="flex flex-col gap-2"
        data-invalid={isInvalid}
        data-disabled={isDisabled}
      >
        {label && (
          <FieldLabel className="gap-1 items-baseline">
            {isRequired && <span className="text-destructive">*</span>}
            {label}
          </FieldLabel>
        )}

        {description && !isInvalid && (
          <FieldDescription id={descriptionId} className="-mt-1 mb-1">
            {description}
          </FieldDescription>
        )}

        <div
          className={layoutClass}
          role="group"
          aria-describedby={ariaDescribedBy}
        >
          {options.map((opt, i) => {
            const {
              value: val,
              label: optLabel,
              disabled: optDisabled,
              ui: optUi,
            } = opt;
            const optDesc = (optUi as OptionUi | undefined)?.description;
            const checked = selected.includes(val);
            const hasMax = typeof field.maxSelected === "number";
            const atMax = hasMax && selected.length >= field.maxSelected!;
            const isOptDisabled =
              optDisabled || isDisabled || (atMax && !checked);
            const id = `${fieldApi.name}-${i}`;

            if (isCardVariant) {
              const showDescription = optDesc && cardSize !== "sm";
              return (
                <label
                  key={`${val}-${i}`}
                  htmlFor={id}
                  className={cn(
                    "cursor-pointer transition-all duration-150 rounded-lg flex items-start gap-3",
                    cardSizeClasses[cardSize],
                    cardBordered && "border",
                    cardBordered &&
                      checked &&
                      "border-primary ring-1 ring-primary/20 bg-primary/5 dark:bg-primary/10",
                    cardBordered &&
                      !checked &&
                      "border-border hover:border-foreground/20 hover:bg-accent/30",
                    !cardBordered && "hover:bg-accent/50",
                    !cardBordered && checked && "bg-accent",
                    isOptDisabled &&
                      "opacity-50 cursor-not-allowed pointer-events-none",
                  )}
                  data-checked={checked}
                  data-disabled={isOptDisabled}
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(next) => handleToggle(val, next === true)}
                    disabled={isOptDisabled}
                    className="shrink-0 mt-0.5"
                    autoFocus={ui?.autoFocus && i === 0}
                  />
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-medium",
                          cardSize === "lg" ? "text-base" : "text-sm",
                        )}
                      >
                        {optLabel}
                      </span>
                    </div>
                    {showDescription && (
                      <span
                        className={cn(
                          "text-muted-foreground line-clamp-2",
                          cardSize === "lg" ? "text-sm" : "text-xs",
                        )}
                      >
                        {optDesc}
                      </span>
                    )}
                  </div>
                </label>
              );
            }

            return (
              <Field
                key={`${val}-${i}`}
                orientation="horizontal"
                className={cn(
                  "items-center gap-2.5 space-y-0",
                  isHorizontal && !columns && "w-auto",
                  isOptDisabled && "opacity-50 cursor-not-allowed",
                )}
              >
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(next) => handleToggle(val, next === true)}
                  disabled={isOptDisabled}
                  autoFocus={ui?.autoFocus && i === 0}
                />
                <FieldLabel
                  htmlFor={id}
                  className={cn(
                    "font-normal cursor-pointer m-0 flex items-center gap-2 text-sm",
                    isOptDisabled && "cursor-not-allowed",
                  )}
                >
                  {optLabel}
                </FieldLabel>
              </Field>
            );
          })}
        </div>

        {isInvalid && <FieldError id={errorId} errors={errors} />}
      </div>
    </FieldGroup>
  );
}
