"use client";

import * as React from "react";
import type { SelectField as SelectFieldDef } from "@buildnbuzz/form-core";
import { useDataField, useFieldOptions } from "@buildnbuzz/form-react";
import type { NormalizedOption } from "@buildnbuzz/form-core";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxValue,
} from "@/components/ui/combobox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// UI options
// ---------------------------------------------------------------------------

interface SelectUi {
  /** Enable search input inside the dropdown. Defaults to `true`. */
  isSearchable?: boolean;
  /** Show a clear button when a value is selected. Defaults to `true` when not required. */
  isClearable?: boolean;
  /** Message shown when no options match the search query. */
  emptyMessage?: string;
  /** className applied to `<FieldGroup>`. */
  className?: string;
  /** Inline width applied to `<FieldGroup>`. */
  width?: string | number;
}

// ---------------------------------------------------------------------------
// Option item renderer
// ---------------------------------------------------------------------------

function OptionContent({
  opt,
  hideDescription,
}: {
  opt: NormalizedOption;
  hideDescription?: boolean;
}) {
  const optDescription = opt.ui?.description as string | undefined;
  const showDescription = optDescription && !hideDescription;

  return (
    <span
      className={cn(
        "flex items-center gap-2 flex-1 min-w-0",
        showDescription && "py-0.5",
      )}
    >
      <span className="flex-1 min-w-0">
        <span className="truncate block">{opt.label}</span>
        {showDescription && (
          <span className="text-xs text-muted-foreground truncate block mt-0.5">
            {optDescription}
          </span>
        )}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SelectField
// ---------------------------------------------------------------------------

export function SelectField() {
  const {
    fieldApi,
    field,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    placeholder,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
    ariaDescribedBy,
  } = useDataField<SelectFieldDef>();

  const { options } = useFieldOptions(field.options);

  const ui = field.ui as SelectUi | undefined;
  const isClearable = ui?.isClearable ?? !isRequired;
  const hasMany = !!field.hasMany;

  const widthStyle = ui?.width
    ? {
        width: typeof ui.width === "number" ? `${ui.width}px` : ui.width,
        flex: "0 1 auto",
      }
    : undefined;

  const value = fieldApi.state.value;

  const selectedValues = React.useMemo(() => {
    if (hasMany) {
      const vals = (Array.isArray(value) ? value : []) as string[];
      return vals
        .map((v) => options.find((o) => o.value === v))
        .filter(Boolean) as NormalizedOption[];
    }
    return value
      ? (options.find((o) => o.value === (value as string)) ?? null)
      : null;
  }, [value, options, hasMany]);

  const handleValueChange = (
    val: NormalizedOption[] | NormalizedOption | null,
  ) => {
    if (isReadOnly) return;
    if (hasMany && Array.isArray(val)) {
      if (field.maxSelected !== undefined && val.length > field.maxSelected)
        return;
      fieldApi.handleChange(val.map((o) => o.value));
    } else {
      fieldApi.handleChange(
        ((val as NormalizedOption | null)?.value ?? undefined) as string,
      );
    }
  };

  return (
    <FieldGroup
      data-field={fieldApi.name}
      className={ui?.className}
      style={widthStyle}
    >
      <Field data-invalid={isInvalid} data-disabled={isDisabled}>
        {label && (
          <FieldLabel htmlFor={fieldApi.name} className="gap-1 items-baseline">
            {label}
            {isRequired && <span className="text-destructive">*</span>}
          </FieldLabel>
        )}

        <FieldContent>
          <Combobox
            items={options}
            multiple={hasMany}
            value={selectedValues}
            onValueChange={handleValueChange}
            disabled={isDisabled || isReadOnly}
            itemToStringValue={(opt) => opt.label}
          >
            {hasMany ? (
              <ComboboxChips
                aria-invalid={isInvalid}
                aria-describedby={ariaDescribedBy}
              >
                <ComboboxValue>
                  {(values: NormalizedOption[]) => (
                    <React.Fragment>
                      {values.map((opt) => (
                        <ComboboxChip key={opt.value}>{opt.label}</ComboboxChip>
                      ))}
                      <ComboboxChipsInput
                        placeholder={values.length === 0 ? placeholder : ""}
                      />
                    </React.Fragment>
                  )}
                </ComboboxValue>
              </ComboboxChips>
            ) : (
              <ComboboxInput
                id={fieldApi.name}
                placeholder={placeholder}
                aria-invalid={isInvalid}
                aria-describedby={ariaDescribedBy}
                showClear={isClearable && !!selectedValues}
                className="w-full"
              />
            )}

            <ComboboxContent>
              <ComboboxEmpty>
                {ui?.emptyMessage ?? "No results found."}
              </ComboboxEmpty>
              <ComboboxList>
                {(opt: NormalizedOption) => (
                  <ComboboxItem
                    key={opt.value}
                    value={opt}
                    disabled={opt.disabled}
                  >
                    <OptionContent opt={opt} />
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </FieldContent>

        {description && !isInvalid && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}
        {isInvalid && <FieldError id={errorId} errors={errors} />}
      </Field>
    </FieldGroup>
  );
}
