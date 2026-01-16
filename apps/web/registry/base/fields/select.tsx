"use client";

import { useState, useEffect, useRef } from "react";
import type {
  SelectField as SelectFieldType,
  SelectOption,
  FormAdapter,
  ValidationContext,
} from "@buildnbuzz/buzzform";

interface ExtendedSelectOption extends SelectOption {
  badge?: string;
}

import {
  getNestedValue,
  normalizeSelectOption,
  getSelectOptionLabel,
  getSelectOptionLabelString,
  getFieldWidthStyle,
} from "@buildnbuzz/buzzform";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";

import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { cn } from "@/lib/utils";
import { IconPlaceholder } from "@/components/icon-placeholder";

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      render={<InputGroupButton variant="ghost" size="icon-xs" />}
      className={cn("cn-combobox-clear", className)}
      {...props}
    >
      <IconPlaceholder
        lucide="XIcon"
        tabler="IconX"
        hugeicons="Cancel01Icon"
        phosphor="XIcon"
        remixicon="RiCloseLine"
        className="cn-combobox-clear-icon pointer-events-none"
      />
    </ComboboxPrimitive.Clear>
  );
}
export interface SelectFieldProps {
  field: SelectFieldType;
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

type OptionValue = string | number | boolean;

/** Convert option values to string for comparison */
function valueToString(value: OptionValue): string {
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function stringToValue(
  str: string,
  options: SelectOption[]
): OptionValue | undefined {
  const option = options.find((opt) => valueToString(opt.value) === str);
  return option?.value;
}

function isAsyncOptions(
  options: SelectFieldType["options"]
): options is (context: ValidationContext) => Promise<SelectOption[]> {
  return typeof options === "function";
}

function useAsyncOptions(
  options: SelectFieldType["options"],
  dependencies: string[] | undefined,
  formValues: Record<string, unknown>,
  siblingData: Record<string, unknown>,
  path: string
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
      : []
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
        console.error("Failed to fetch select options:", err);
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

export function SelectField({
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
}: SelectFieldProps) {
  const [searchValue, setSearchValue] = useState("");
  const rawValue = form.watch(path);
  const anchorRef = useComboboxAnchor();
  const hasError = !!error;

  const { resolvedOptions, isLoading } = useAsyncOptions(
    field.options,
    field.dependencies,
    formValues,
    siblingData,
    path
  );

  const isSearchable = field.ui?.isSearchable !== false;
  const isClearable = field.ui?.isClearable ?? !field.required;
  const maxVisibleChips = field.ui?.maxVisibleChips ?? 3;
  const emptyMessage = field.ui?.emptyMessage ?? "No results found";
  const loadingMessage = field.ui?.loadingMessage ?? "Loading...";
  const placeholder =
    field.placeholder ??
    (field.hasMany ? "Select options..." : "Select an option...");
  const searchPlaceholder = "Search...";

  const filteredOptions = (() => {
    if (!isSearchable || !searchValue.trim()) {
      return resolvedOptions;
    }
    const query = searchValue.toLowerCase();
    return resolvedOptions.filter((opt) =>
      getSelectOptionLabelString(opt).toLowerCase().includes(query)
    );
  })();

  const handleSingleChange = (stringValue: string | null) => {
    if (stringValue === null) {
      form.setValue(path, undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }
    const actualValue = stringToValue(stringValue, resolvedOptions);
    form.setValue(path, actualValue, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setSearchValue("");
  };

  const handleMultiChange = (stringValues: string[]) => {
    const actualValues = stringValues
      .map((sv) => stringToValue(sv, resolvedOptions))
      .filter((v): v is OptionValue => v !== undefined);
    form.setValue(path, actualValues, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const singleValue =
    rawValue === undefined || rawValue === null
      ? null
      : valueToString(rawValue as OptionValue);

  const multiValues = !Array.isArray(rawValue)
    ? []
    : (rawValue as OptionValue[]).map(valueToString);

  const selectedOption = resolvedOptions.find(
    (o) => singleValue !== null && valueToString(o.value) === singleValue
  );

  const renderOptionContent = (option: ExtendedSelectOption) => (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      {option.icon && (
        <span className="shrink-0 text-muted-foreground">{option.icon}</span>
      )}
      <div className="flex-1 min-w-0 py-0.5 text-left">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">
            {getSelectOptionLabel(option)}
          </span>
          {option.badge && (
            <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
              {option.badge}
            </span>
          )}
        </div>
        {option.description && (
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            {option.description}
          </div>
        )}
      </div>
    </div>
  );

  const renderMultiSelect = () => {
    const visibleChips = multiValues.slice(0, maxVisibleChips);
    const hiddenCount = multiValues.length - maxVisibleChips;

    return (
      <Combobox
        multiple
        value={multiValues}
        onValueChange={handleMultiChange}
        inputValue={searchValue}
        onInputValueChange={setSearchValue}
        disabled={isDisabled || isReadOnly}
      >
        <div ref={anchorRef} className="w-full">
          <ComboboxChips className="min-h-8 w-full px-2">
            {visibleChips.map((val, index) => {
              const opt = resolvedOptions.find(
                (o) => valueToString(o.value) === val
              );
              return (
                <ComboboxChip key={`${val}-${index}`}>
                  {opt ? getSelectOptionLabelString(opt) : val}
                </ComboboxChip>
              );
            })}
            {hiddenCount > 0 && (
              <div className="bg-muted/50 text-muted-foreground flex h-6 items-center justify-center rounded-sm px-1.5 text-[10px] font-bold whitespace-nowrap">
                +{hiddenCount}
              </div>
            )}
            {isSearchable && (
              <ComboboxChipsInput
                id={fieldId}
                placeholder={multiValues.length === 0 ? placeholder : ""}
                autoFocus={autoFocus}
                className="py-1"
              />
            )}
            {!isSearchable && multiValues.length === 0 && (
              <ComboboxTrigger className="flex-1 text-left py-1 text-muted-foreground h-8 px-3">
                {placeholder}
              </ComboboxTrigger>
            )}
          </ComboboxChips>
        </div>
        <ComboboxContent anchor={anchorRef} className="w-(--anchor-width)">
          <ComboboxList className="p-1.5">
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {loadingMessage}
              </div>
            ) : (
              <>
                {filteredOptions.length === 0 && (
                  <ComboboxEmpty className="py-6">{emptyMessage}</ComboboxEmpty>
                )}
                {filteredOptions.map((option, i) => (
                  <ComboboxItem
                    key={`${valueToString(option.value)}-${i}`}
                    value={valueToString(option.value)}
                    disabled={option.disabled}
                    className="py-2 px-2.5"
                  >
                    {renderOptionContent(option)}
                  </ComboboxItem>
                ))}
              </>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  };

  const renderSingleSelect = () => (
    <Combobox
      value={singleValue}
      onValueChange={handleSingleChange}
      inputValue={searchValue}
      onInputValueChange={setSearchValue}
      disabled={isDisabled || isReadOnly}
    >
      <div ref={anchorRef} className="w-full">
        <InputGroup className="w-full">
          <InputGroupButton
            id={fieldId}
            render={<ComboboxTrigger />}
            className="flex-1 justify-between font-normal h-8 px-3"
            disabled={isDisabled || isReadOnly}
          >
            {selectedOption ? (
              <span className="flex items-center gap-2 truncate text-left">
                {selectedOption.icon && (
                  <span className="shrink-0 text-muted-foreground">
                    {selectedOption.icon}
                  </span>
                )}
                <span className="truncate">
                  {getSelectOptionLabelString(selectedOption)}
                </span>
              </span>
            ) : (
              <ComboboxValue>
                {(value) =>
                  value ?? (
                    <span className="text-muted-foreground">{placeholder}</span>
                  )
                }
              </ComboboxValue>
            )}
          </InputGroupButton>
          {isClearable && singleValue !== null && (
            <InputGroupAddon align="inline-end">
              <ComboboxClear disabled={isDisabled || isReadOnly} />
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>

      <ComboboxContent anchor={anchorRef} className="w-(--anchor-width)">
        {isSearchable && (
          <div className="p-1 border-b">
            <ComboboxInput
              autoFocus
              placeholder={searchPlaceholder}
              className="w-full border-none shadow-none focus-visible:ring-0 h-8"
              showTrigger={false}
            />
          </div>
        )}
        <ComboboxList className="p-1.5">
          {isLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {loadingMessage}
            </div>
          ) : (
            <>
              {filteredOptions.length === 0 && (
                <ComboboxEmpty className="py-6">{emptyMessage}</ComboboxEmpty>
              )}
              {filteredOptions.map((option, i) => (
                <ComboboxItem
                  key={`${valueToString(option.value)}-${i}`}
                  value={valueToString(option.value)}
                  disabled={option.disabled}
                  className="py-2 px-2.5"
                >
                  {renderOptionContent(option)}
                </ComboboxItem>
              ))}
            </>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );

  return (
    <Field
      className={field.style?.className}
      data-invalid={hasError}
      data-disabled={isDisabled}
      style={getFieldWidthStyle(field.style)}
    >
      {label && (
        <FieldLabel htmlFor={fieldId} className="gap-1 items-baseline">
          {label}
          {field.required && <span className="text-destructive">*</span>}
        </FieldLabel>
      )}

      <FieldContent>
        {field.hasMany ? renderMultiSelect() : renderSingleSelect()}
      </FieldContent>

      {field.description && (
        <FieldDescription id={`${fieldId}-description`}>
          {field.description}
        </FieldDescription>
      )}

      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}

export function SelectFieldSkeleton({ field }: { field: SelectFieldType }) {
  const label = field.label !== false ? (field.label ?? field.name) : null;

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
      {label && <div className="h-4 w-24 animate-pulse rounded bg-muted" />}
      <FieldContent>
        <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
      </FieldContent>
      {field.description && (
        <div className="h-3 w-48 animate-pulse rounded bg-muted" />
      )}
    </Field>
  );
}
