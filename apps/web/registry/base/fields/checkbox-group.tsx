"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CheckboxGroupField as CheckboxGroupFieldType,
  SelectOption,
  ValidationContext,
  FormAdapter,
} from "@buildnbuzz/buzzform";
import {
  normalizeSelectOption,
  getSelectOptionValue,
  getSelectOptionLabel,
  isSelectOptionDisabled,
  getFieldWidthStyle,
  getNestedValue,
} from "@buildnbuzz/buzzform";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

type OptionValue = string | number | boolean;

export interface CheckboxGroupFieldProps {
  field: CheckboxGroupFieldType;
  path: string;
  form: FormAdapter;
  autoFocus?: boolean;
  formValues: Record<string, unknown>;
  siblingData: Record<string, unknown>;
  // Computed props
  fieldId: string;
  label: React.ReactNode | null;
  isDisabled: boolean;
  isReadOnly: boolean;
  error?: string;
}

function valueToString(value: OptionValue): string {
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function stringToValue(
  str: string,
  options: SelectOption[],
): OptionValue | undefined {
  const option = options.find((opt) => valueToString(opt.value) === str);
  return option?.value;
}

function isAsyncOptions(
  options: CheckboxGroupFieldType["options"],
): options is (context: ValidationContext) => Promise<SelectOption[]> {
  return typeof options === "function";
}

function useAsyncOptions(
  options: CheckboxGroupFieldType["options"],
  dependencies: string[] | undefined,
  formValues: Record<string, unknown>,
  siblingData: Record<string, unknown>,
  path: string,
): {
  resolvedOptions: SelectOption[];
  isLoading: boolean;
} {
  const isAsync = isAsyncOptions(options);
  const cacheRef = useRef<Map<string, SelectOption[]>>(new Map());

  const [resolvedOptions, setResolvedOptions] = useState<SelectOption[]>(
    !isAsync
      ? Array.isArray(options)
        ? options.map(normalizeSelectOption)
        : []
      : [],
  );
  const [isLoading, setIsLoading] = useState(isAsync);

  const dependencyKey = (() => {
    if (!dependencies || dependencies.length === 0) return "static";
    const values = dependencies.map((dep) => getNestedValue(formValues, dep));
    return JSON.stringify(values);
  })();

  useEffect(() => {
    if (!isAsync) {
      if (Array.isArray(options)) {
        setResolvedOptions(options.map(normalizeSelectOption));
      }
      setIsLoading(false);
      return;
    }

    if (cacheRef.current.has(dependencyKey)) {
      setResolvedOptions(cacheRef.current.get(dependencyKey)!);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchOptions() {
      setIsLoading(true);

      try {
        const context: ValidationContext = {
          data: formValues,
          siblingData,
          path: path.split("."),
        };

        const result = await (
          options as (context: ValidationContext) => Promise<SelectOption[]>
        )(context);

        const normalized = result.map(normalizeSelectOption);

        if (isMounted) {
          cacheRef.current.set(dependencyKey, normalized);
          setResolvedOptions(normalized);
        }
      } catch (err) {
        console.error("Failed to fetch checkbox-group options:", err);
        if (isMounted) {
          setResolvedOptions([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchOptions();

    return () => {
      isMounted = false;
    };
  }, [isAsync, options, dependencyKey, formValues, siblingData, path]);

  return { resolvedOptions, isLoading };
}

const cardSizeClasses = {
  sm: "p-2.5 sm:p-3",
  md: "p-3 sm:p-4",
  lg: "p-4 sm:p-5",
} as const;

export function CheckboxGroupField({
  field,
  path,
  form,
  autoFocus,
  formValues,
  siblingData,
  fieldId,
  label,
  isDisabled,
  isReadOnly,
  error,
}: CheckboxGroupFieldProps) {
  const rawValue = form.watch(path);
  const hasError = !!error;

  const selectedValues = Array.isArray(rawValue)
    ? (rawValue as OptionValue[]).map(valueToString)
    : [];

  const { resolvedOptions, isLoading } = useAsyncOptions(
    field.options,
    field.dependencies,
    formValues,
    siblingData,
    path,
  );

  const variant = field.ui?.variant ?? "default";
  const direction = field.ui?.direction ?? "vertical";
  const columns = field.ui?.columns ?? 1;
  const cardSize = field.ui?.card?.size ?? "md";
  const cardBordered = field.ui?.card?.bordered ?? true;
  const maxSelected = field.maxSelected;

  const isCardVariant = variant === "card";

  const gridClasses = cn(
    "grid gap-2",
    direction === "horizontal" && columns === 1
      ? "grid-flow-col auto-cols-fr"
      : undefined,
    columns === 2 && "sm:grid-cols-2",
    columns === 3 && "sm:grid-cols-2 md:grid-cols-3",
    columns === 4 && "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  );

  const handleToggle = (stringValue: string, checked: boolean) => {
    if (isReadOnly) return;

    const hasMaxLimit = typeof maxSelected === "number" && maxSelected >= 0;
    if (checked && hasMaxLimit && selectedValues.length >= maxSelected) {
      return;
    }

    const currentSet = new Set(selectedValues);
    if (checked) {
      currentSet.add(stringValue);
    } else {
      currentSet.delete(stringValue);
    }

    const nextValues = Array.from(currentSet)
      .map((value) => stringToValue(value, resolvedOptions))
      .filter((value): value is OptionValue => value !== undefined);

    form.setValue(path, nextValues, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div
      className={cn("flex flex-col gap-2", field.style?.className)}
      data-invalid={hasError}
      data-readonly={isReadOnly}
      style={getFieldWidthStyle(field.style)}
    >
      {label && (
        <FieldLabel className="gap-1 items-baseline">
          {field.required && <span className="text-destructive">*</span>}
          {label}
        </FieldLabel>
      )}

      {field.description && (
        <FieldDescription className="-mt-1 mb-1" id={`${fieldId}-description`}>
          {field.description}
        </FieldDescription>
      )}

      <div
        className={gridClasses}
        role="group"
        aria-describedby={
          field.description ? `${fieldId}-description` : undefined
        }
      >
        {!isLoading &&
          resolvedOptions.map((opt, i) => {
            const value = getSelectOptionValue(opt);
            const optionLabel = getSelectOptionLabel(opt);
            const normalized = normalizeSelectOption(opt);
            const checked = selectedValues.includes(value);
            const hasMaxLimit =
              typeof maxSelected === "number" && maxSelected >= 0;
            const isAtMaxSelection =
              hasMaxLimit && selectedValues.length >= maxSelected;
            const optDisabled =
              isSelectOptionDisabled(opt) ||
              isDisabled ||
              (isAtMaxSelection && !checked);
            const id = `${fieldId}-${i}`;

            if (isCardVariant) {
              const showDescription =
                normalized.description && cardSize !== "sm";
              const optionKey = `${value}-${i}`;

              return (
                <label
                  key={optionKey}
                  htmlFor={id}
                  className={cn(
                    "cursor-pointer transition-all duration-150 rounded-lg",
                    "flex items-start gap-3",
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
                    optDisabled &&
                      "opacity-50 cursor-not-allowed pointer-events-none",
                  )}
                  data-checked={checked}
                  data-disabled={optDisabled}
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(next) =>
                      handleToggle(value, next === true)
                    }
                    disabled={optDisabled}
                    className="shrink-0 mt-0.5"
                    autoFocus={autoFocus && i === 0}
                  />
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {normalized.icon && (
                        <span className="shrink-0 text-muted-foreground">
                          {normalized.icon}
                        </span>
                      )}
                      <span
                        className={cn(
                          "font-medium",
                          cardSize === "lg" ? "text-base" : "text-sm",
                        )}
                      >
                        {optionLabel}
                      </span>
                    </div>
                    {showDescription && (
                      <span
                        className={cn(
                          "text-muted-foreground line-clamp-2",
                          cardSize === "lg" ? "text-sm" : "text-xs",
                        )}
                      >
                        {normalized.description}
                      </span>
                    )}
                  </div>
                </label>
              );
            }

            return (
              <Field
                key={`${value}-${i}`}
                orientation="horizontal"
                className={cn(
                  "items-center gap-2.5 space-y-0",
                  optDisabled && "opacity-50 cursor-not-allowed",
                )}
              >
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(next) => handleToggle(value, next === true)}
                  disabled={optDisabled}
                  autoFocus={autoFocus && i === 0}
                />
                <FieldLabel
                  htmlFor={id}
                  className={cn(
                    "font-normal cursor-pointer m-0 flex items-center gap-2 text-sm",
                    optDisabled && "cursor-not-allowed",
                  )}
                >
                  {normalized.icon && (
                    <span className="shrink-0 text-muted-foreground">
                      {normalized.icon}
                    </span>
                  )}
                  <span>{optionLabel}</span>
                </FieldLabel>
              </Field>
            );
          })}
      </div>

      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

export function CheckboxGroupFieldSkeleton({
  field,
}: {
  field: CheckboxGroupFieldType;
}) {
  const label = field.label !== false ? (field.label ?? field.name) : null;
  const variant = field.ui?.variant ?? "default";
  const direction = field.ui?.direction ?? "vertical";
  const columns = field.ui?.columns ?? 1;
  const cardSize = field.ui?.card?.size ?? "md";
  const cardBordered = field.ui?.card?.bordered ?? true;

  const isCardVariant = variant === "card";
  const optionCount = Math.min(
    Array.isArray(field.options) ? field.options.length : 3,
    6,
  );

  const gridClasses = cn(
    "grid gap-2",
    direction === "horizontal" && columns === 1
      ? "grid-flow-col auto-cols-fr"
      : undefined,
    columns === 2 && "sm:grid-cols-2",
    columns === 3 && "sm:grid-cols-2 md:grid-cols-3",
    columns === 4 && "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  );

  return (
    <div className={cn("flex flex-col gap-2", field.style?.className)}>
      {label && <div className="h-4 w-32 animate-pulse rounded bg-muted" />}
      <div className={gridClasses}>
        {Array.from({ length: optionCount }).map((_, i) =>
          isCardVariant ? (
            <div
              key={i}
              className={cn(
                "rounded-lg border animate-pulse",
                cardBordered && "border-border",
                cardSizeClasses[cardSize],
              )}
            >
              <div className="h-4 w-3/4 rounded bg-muted" />
            </div>
          ) : (
            <div key={i} className="flex items-center gap-2.5">
              <div className="size-4 rounded bg-muted animate-pulse" />
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            </div>
          ),
        )}
      </div>
      {field.description && (
        <div className="h-3 w-48 animate-pulse rounded bg-muted" />
      )}
    </div>
  );
}
