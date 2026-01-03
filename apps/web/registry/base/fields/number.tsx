"use client";

import * as React from "react";
import type {
  NumberField as NumberFieldType,
  FormAdapter,
} from "@buildnbuzz/buzzform";
import { generateFieldId } from "@buildnbuzz/buzzform";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { CopyButton } from "@/components/buzzform/copy";
import { cn } from "@/lib/utils";
import { IconPlaceholder } from "@/components/icon-placeholder";

export interface NumberFieldProps {
  field: NumberFieldType;
  path: string;
  form: FormAdapter;
  autoFocus?: boolean;
  formValues: Record<string, unknown>;
  siblingData: Record<string, unknown>;
}

/** Format number with thousand separators */
function formatWithSeparator(val: number | undefined, sep: string): string {
  if (val === undefined || val === null || isNaN(val)) return "";
  const [intPart, decPart] = val.toString().split(".");
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}

/** Parse formatted string back to number */
function parseFormattedNumber(str: string, sep: string): number | undefined {
  if (!str || str === "") return undefined;
  const cleaned = str.split(sep).join("");
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

export function NumberField({
  field,
  path,
  form,
  autoFocus,
  formValues,
  siblingData,
}: NumberFieldProps) {
  const value = form.watch<number>(path);

  const error = form.formState.errors[path];
  const errorMessage =
    typeof error === "string"
      ? error
      : Array.isArray(error)
        ? error[0]
        : undefined;
  const hasError = !!errorMessage;

  const isDisabled =
    (typeof field.disabled === "function"
      ? field.disabled(formValues, siblingData)
      : (field.disabled ?? false)) || form.formState.isSubmitting;

  const isReadOnly =
    typeof field.readOnly === "function"
      ? field.readOnly(formValues, siblingData)
      : (field.readOnly ?? false);

  const label = field.label !== false ? (field.label ?? field.name) : null;
  const fieldId = field.id ?? generateFieldId(path);

  // UI options
  const step = field.ui?.step ?? 1;
  const variant = field.ui?.variant ?? "default";
  const prefix = field.ui?.prefix;
  const suffix = field.ui?.suffix;
  const hideSteppers = field.ui?.hideSteppers || variant === "plain";
  const thousandSeparator = field.ui?.thousandSeparator;
  const copyable = field.ui?.copyable;
  const sep = typeof thousandSeparator === "string" ? thousandSeparator : ",";

  // Display value for thousand separator mode
  const [displayValue, setDisplayValue] = React.useState<string>(() =>
    thousandSeparator && typeof value === "number"
      ? formatWithSeparator(value, sep)
      : ""
  );

  // Sync display value when external value changes
  React.useEffect(() => {
    if (thousandSeparator && typeof value === "number") {
      setDisplayValue(formatWithSeparator(value, sep));
    } else if (thousandSeparator && value === undefined) {
      setDisplayValue("");
    }
  }, [value, thousandSeparator, sep]);

  const handleChange = (val: number | undefined) => {
    if (isReadOnly) return;
    // Apply precision if specified
    let finalVal = val;
    if (finalVal !== undefined && field.precision !== undefined) {
      finalVal = parseFloat(finalVal.toFixed(field.precision));
    }
    form.setValue(path, finalVal, { shouldDirty: true });
  };

  const handleAdjust = (delta: number) => {
    if (isReadOnly || isDisabled) return;
    const current = typeof value === "number" ? value : (field.min ?? 0);
    let next = current + delta;
    if (field.min !== undefined && next < field.min) next = field.min;
    if (field.max !== undefined && next > field.max) next = field.max;
    handleChange(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isDisabled || isReadOnly) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleAdjust(step);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleAdjust(-step);
    }
  };

  const handleFormattedInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputVal = e.target.value;
    setDisplayValue(inputVal);
    const parsed = parseFormattedNumber(inputVal, sep);
    handleChange(parsed);
  };

  const handleFormattedInputBlur = () => {
    if (typeof value === "number") {
      setDisplayValue(formatWithSeparator(value, sep));
    }
  };

  const renderInput = (className?: string) => {
    // When thousandSeparator is enabled, use text input
    if (thousandSeparator) {
      return (
        <InputGroupInput
          id={fieldId}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleFormattedInputChange}
          onBlur={handleFormattedInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={field.placeholder}
          className={cn(
            hideSteppers ? "" : "text-center",
            "tabular-nums",
            className
          )}
          disabled={isDisabled}
          readOnly={isReadOnly}
          aria-invalid={hasError}
          autoFocus={autoFocus}
        />
      );
    }

    // Standard number input
    return (
      <InputGroupInput
        id={fieldId}
        name={path}
        type="number"
        value={value ?? ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange(
            e.target.value === "" ? undefined : Number(e.target.value)
          )
        }
        onKeyDown={handleKeyDown}
        placeholder={field.placeholder}
        className={cn(
          hideSteppers
            ? ""
            : "text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]",
          className
        )}
        disabled={isDisabled}
        readOnly={isReadOnly}
        min={field.min}
        max={field.max}
        step={step}
        aria-invalid={hasError}
        autoFocus={autoFocus}
      />
    );
  };

  const renderInputContent = () => {
    // Plain variant - no steppers
    if (hideSteppers) {
      if (prefix || suffix || copyable) {
        return (
          <InputGroup className="h-9">
            {prefix && (
              <InputGroupAddon
                align="inline-start"
                className="px-3 text-muted-foreground text-sm"
              >
                {prefix}
              </InputGroupAddon>
            )}
            {renderInput()}
            {suffix && (
              <InputGroupAddon className="px-3 text-muted-foreground text-sm">
                {suffix}
              </InputGroupAddon>
            )}
            {copyable && (
              <InputGroupAddon align="inline-end">
                <CopyButton value={value?.toString() ?? ""} />
              </InputGroupAddon>
            )}
          </InputGroup>
        );
      }
      return (
        <Input
          id={fieldId}
          type="number"
          value={value ?? ""}
          onChange={(e) =>
            handleChange(
              e.target.value === "" ? undefined : Number(e.target.value)
            )
          }
          onKeyDown={handleKeyDown}
          placeholder={field.placeholder}
          disabled={isDisabled}
          readOnly={isReadOnly}
          min={field.min}
          max={field.max}
          step={step}
          aria-invalid={hasError}
          autoFocus={autoFocus}
          className="tabular-nums"
        />
      );
    }

    // Stacked variant - vertical buttons on right
    if (variant === "stacked") {
      return (
        <InputGroup className="h-9">
          {prefix && (
            <InputGroupAddon
              align="inline-start"
              className="px-3 text-muted-foreground text-sm"
            >
              {prefix}
            </InputGroupAddon>
          )}
          {renderInput("tabular-nums")}
          {suffix && (
            <InputGroupAddon className="px-2 text-muted-foreground text-sm">
              {suffix}
            </InputGroupAddon>
          )}
          <InputGroupAddon
            align="inline-end"
            className="p-0 pr-0 h-full self-stretch"
          >
            <div className="flex flex-col h-full border-l border-input -mr-px overflow-hidden rounded-r-lg">
              <button
                type="button"
                onClick={() => handleAdjust(step)}
                disabled={isDisabled || isReadOnly}
                className="flex-1 w-7 flex items-center justify-center border-b border-input text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:pointer-events-none disabled:opacity-50"
                aria-label="Increment"
              >
                <IconPlaceholder
                  lucide="Plus"
                  hugeicons="Add01Icon"
                  tabler="IconPlus"
                  phosphor="Plus"
                  className="size-3"
                />
              </button>
              <button
                type="button"
                onClick={() => handleAdjust(-step)}
                disabled={isDisabled || isReadOnly}
                className="flex-1 w-7 flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:pointer-events-none disabled:opacity-50"
                aria-label="Decrement"
              >
                <IconPlaceholder
                  lucide="Minus"
                  hugeicons="MinusSignIcon"
                  tabler="IconMinus"
                  phosphor="Minus"
                  className="size-3"
                />
              </button>
            </div>
          </InputGroupAddon>
        </InputGroup>
      );
    }

    // Pill variant - rounded with buttons on sides
    if (variant === "pill") {
      return (
        <InputGroup className="h-9 rounded-full px-1.5">
          <InputGroupAddon align="inline-start">
            <InputGroupButton
              variant="ghost"
              size="icon-xs"
              onClick={() => handleAdjust(-step)}
              className="rounded-full"
              disabled={isDisabled || isReadOnly}
              aria-label="Decrement"
            >
              <IconPlaceholder
                lucide="Minus"
                hugeicons="MinusSignIcon"
                tabler="IconMinus"
                phosphor="Minus"
                className="size-4"
              />
            </InputGroupButton>
          </InputGroupAddon>
          {prefix && (
            <span className="text-muted-foreground text-sm">{prefix}</span>
          )}
          {renderInput()}
          {suffix && (
            <span className="text-muted-foreground text-sm">{suffix}</span>
          )}
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              variant="ghost"
              size="icon-xs"
              onClick={() => handleAdjust(step)}
              className="rounded-full"
              disabled={isDisabled || isReadOnly}
              aria-label="Increment"
            >
              <IconPlaceholder
                lucide="Plus"
                hugeicons="Add01Icon"
                tabler="IconPlus"
                phosphor="Plus"
                className="size-4"
              />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      );
    }

    // Default variant - inline buttons on sides
    return (
      <InputGroup className="h-9">
        <InputGroupAddon align="inline-start">
          <InputGroupButton
            variant="ghost"
            size="icon-xs"
            onClick={() => handleAdjust(-step)}
            disabled={isDisabled || isReadOnly}
            aria-label="Decrement"
          >
            <IconPlaceholder
              lucide="Minus"
              hugeicons="MinusSignIcon"
              tabler="IconMinus"
              phosphor="Minus"
              className="size-3.5"
            />
          </InputGroupButton>
        </InputGroupAddon>
        {prefix && (
          <span className="text-muted-foreground text-sm pl-1">{prefix}</span>
        )}
        {renderInput()}
        {suffix && (
          <span className="text-muted-foreground text-sm pr-1">{suffix}</span>
        )}
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            variant="ghost"
            size="icon-xs"
            onClick={() => handleAdjust(step)}
            disabled={isDisabled || isReadOnly}
            aria-label="Increment"
          >
            <IconPlaceholder
              lucide="Plus"
              hugeicons="Add01Icon"
              tabler="IconPlus"
              phosphor="Plus"
              className="size-3.5"
            />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    );
  };

  return (
    <Field
      className={field.style?.className}
      data-invalid={hasError}
      data-disabled={isDisabled}
      style={
        field.style?.width
          ? {
              width:
                typeof field.style.width === "number"
                  ? `${field.style.width}px`
                  : field.style.width,
            }
          : undefined
      }
    >
      {label && (
        <FieldLabel htmlFor={fieldId}>
          {field.required && <span className="text-destructive mr-0.5">*</span>}
          {label}
        </FieldLabel>
      )}

      <FieldContent>{renderInputContent()}</FieldContent>

      {field.description && (
        <FieldDescription id={`${fieldId}-description`}>
          {field.description}
        </FieldDescription>
      )}

      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </Field>
  );
}

export function NumberFieldSkeleton({ field }: { field: NumberFieldType }) {
  const label = field.label !== false ? (field.label ?? field.name) : null;
  const variant = field.ui?.variant ?? "default";
  const hideSteppers = field.ui?.hideSteppers || variant === "plain";
  const hasPrefix = Boolean(field.ui?.prefix);
  const hasSuffix = Boolean(field.ui?.suffix);

  const stepperSkeleton = (
    <div className="size-6 rounded animate-pulse bg-muted" />
  );

  const renderInputSkeleton = () => {
    if (hideSteppers) {
      return (
        <div className="flex items-center h-9 border rounded-lg px-3 gap-2">
          {hasPrefix && (
            <div className="h-4 w-6 animate-pulse bg-muted rounded" />
          )}
          <div className="h-4 flex-1 animate-pulse bg-muted rounded" />
          {hasSuffix && (
            <div className="h-4 w-8 animate-pulse bg-muted rounded" />
          )}
        </div>
      );
    }

    if (variant === "stacked") {
      return (
        <div className="flex items-center h-9 border rounded-lg">
          {hasPrefix && (
            <div className="h-4 w-6 ml-3 animate-pulse bg-muted rounded" />
          )}
          <div className="h-4 flex-1 mx-3 animate-pulse bg-muted rounded" />
          {hasSuffix && (
            <div className="h-4 w-8 mr-2 animate-pulse bg-muted rounded" />
          )}
          <div className="flex flex-col w-7 border-l h-full">
            <div className="h-1/2 w-full animate-pulse bg-muted" />
            <div className="h-1/2 w-full animate-pulse bg-muted" />
          </div>
        </div>
      );
    }

    if (variant === "pill") {
      return (
        <div className="flex items-center h-9 border rounded-full px-2 gap-2">
          {stepperSkeleton}
          {hasPrefix && (
            <div className="h-4 w-6 animate-pulse bg-muted rounded" />
          )}
          <div className="h-4 flex-1 animate-pulse bg-muted rounded" />
          {hasSuffix && (
            <div className="h-4 w-8 animate-pulse bg-muted rounded" />
          )}
          {stepperSkeleton}
        </div>
      );
    }

    // Default variant
    return (
      <div className="flex items-center h-9 border rounded-lg px-2 gap-2">
        {stepperSkeleton}
        {hasPrefix && (
          <div className="h-4 w-6 animate-pulse bg-muted rounded" />
        )}
        <div className="h-4 flex-1 animate-pulse bg-muted rounded" />
        {hasSuffix && (
          <div className="h-4 w-8 animate-pulse bg-muted rounded" />
        )}
        {stepperSkeleton}
      </div>
    );
  };

  return (
    <Field
      className={field.style?.className}
      style={
        field.style?.width
          ? {
              width:
                typeof field.style.width === "number"
                  ? `${field.style.width}px`
                  : field.style.width,
            }
          : undefined
      }
    >
      {label && <div className="h-4 w-20 animate-pulse rounded bg-muted" />}
      <FieldContent>{renderInputSkeleton()}</FieldContent>
      {field.description && (
        <div className="h-3 w-48 animate-pulse rounded bg-muted" />
      )}
    </Field>
  );
}
