"use client";

import type { RadioField as RadioFieldDef } from "@buildnbuzz/form-core";
import { useDataField, useFieldOptions } from "@buildnbuzz/form-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface OptionUi {
  description?: string;
}

type OptionGroupVariant = "default" | "card";
type OptionGroupDirection = "vertical" | "horizontal";
type OptionGroupColumns = 1 | 2 | 3 | 4 | string | number | undefined;

interface RadioUi {
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

function getGridColumnsClass(columns: OptionGroupColumns | undefined) {
  if (columns === 2) return "sm:grid-cols-2";
  if (columns === 3) return "sm:grid-cols-2 md:grid-cols-3";
  if (columns === 4) return "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  return undefined;
}

function getOptionGroupLayoutClassName({
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

  // If horizontal and NO columns chosen, use fluid flex-row layout
  if (isHorizontal && !columns) {
    return "!flex flex-row flex-wrap gap-x-4 gap-y-2";
  }

  const effectiveColumns =
    isCard || isHorizontal ? (columns ?? (isCard ? 2 : undefined)) : undefined;

  if (!effectiveColumns || effectiveColumns === 1) {
    return "flex flex-col gap-2";
  }

  return cn("grid gap-2", getGridColumnsClass(effectiveColumns));
}

/** Card size classes */
const cardSizeClasses = {
  sm: "p-2.5 sm:p-3",
  md: "p-3 sm:p-4",
  lg: "p-4 sm:p-5",
} as const;

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

  const width = ui?.width;
  const widthStyle = width
    ? {
        width: typeof width === "number" ? `${width}px` : width,
        flex: "0 1 auto",
      }
    : undefined;

  // UI options with defaults
  const variant = ui?.variant ?? "default";
  const direction = ui?.direction ?? "vertical";
  const columns = ui?.columns;
  const cardSize = ui?.card?.size ?? "md";
  const cardBordered = ui?.card?.bordered ?? true;

  const isCardVariant = variant === "card";
  const isHorizontal = direction === "horizontal";

  const layoutClasses = getOptionGroupLayoutClassName({
    variant,
    direction,
    columns,
  });

  // Get options
  const { options } = useFieldOptions(field.options);

  return (
    <FieldGroup
      data-field={fieldApi.name}
      className={ui?.className}
      style={widthStyle}
    >
      <Field data-invalid={isInvalid} data-disabled={isDisabled}>
        {label && (
          <FieldLabel htmlFor={`${fieldApi.name}-0`}>
            {label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
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
              fieldApi.handleBlur();
            }}
            disabled={isDisabled}
            className={layoutClasses}
            aria-describedby={ariaDescribedBy}
          >
            {options.map((opt, i) => {
              const { value: val, label: optLabel, disabled: optDisabled, ui: optUi } = opt;
              const optDesc = (optUi as OptionUi | undefined)?.description;
              const isOptDisabled = optDisabled || isDisabled;
              const isSelected = value === val;
              const id = `${fieldApi.name}-${i}`;

              // Card variant
              if (isCardVariant) {
                const showDescription = optDesc && cardSize !== "sm";

                return (
                  <label
                    key={`${val}-${i}`}
                    htmlFor={id}
                    className={cn(
                      // Base styles
                      "cursor-pointer transition-all duration-150 rounded-lg",
                      "flex items-start gap-3",
                      cardSizeClasses[cardSize],
                      // Border styles
                      cardBordered && "border",
                      cardBordered &&
                        isSelected &&
                        "border-primary ring-1 ring-primary/20 bg-primary/5 dark:bg-primary/10",
                      cardBordered &&
                        !isSelected &&
                        "border-border hover:border-foreground/20 hover:bg-accent/30",
                      // Non-bordered styles
                      !cardBordered && "hover:bg-accent/50",
                      !cardBordered && isSelected && "bg-accent",
                      // Disabled styles
                      isOptDisabled &&
                        "opacity-50 cursor-not-allowed pointer-events-none",
                    )}
                    data-checked={isSelected}
                    data-disabled={isOptDisabled}
                  >
                    <RadioGroupItem
                      value={val}
                      id={id}
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

              // Default variant
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
                  <RadioGroupItem
                    value={val}
                    id={id}
                    disabled={isOptDisabled}
                    autoFocus={ui?.autoFocus && i === 0}
                  />
                  <FieldLabel
                    htmlFor={id}
                    className={cn(
                      "font-normal cursor-pointer m-0 text-sm",
                      isOptDisabled && "cursor-not-allowed",
                    )}
                  >
                    <span>{optLabel}</span>
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
