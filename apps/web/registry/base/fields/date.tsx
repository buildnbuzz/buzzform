"use client";

import React, { useState } from "react";
import type {
  DateField as DateFieldType,
  DatetimeField as DatetimeFieldType,
  FormAdapter,
} from "@buildnbuzz/buzzform";
import { parseToDate, getFieldWidthStyle } from "@buildnbuzz/buzzform";
import {
  format,
  parse,
  setHours,
  setMinutes,
  setSeconds,
  getHours,
  getMinutes,
  getSeconds,
  startOfDay,
  addDays,
  startOfWeek,
  addWeeks,
  isValid,
} from "date-fns";
import { IconPlaceholder } from "@/components/icon-placeholder";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

type Matcher =
  | { before: Date }
  | { after: Date }
  | Date
  | ((date: Date) => boolean);

const DEFAULT_PRESETS = [
  { label: "Today", value: () => startOfDay(new Date()) },
  { label: "Tomorrow", value: () => startOfDay(addDays(new Date(), 1)) },
  {
    label: "Next Week",
    value: () => startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }),
  },
];

export interface DateFieldProps {
  field: DateFieldType | DatetimeFieldType;
  path: string;
  form: FormAdapter;
  autoFocus?: boolean;
  // Computed props
  fieldId: string;
  label: React.ReactNode | null;
  isDisabled: boolean;
  isReadOnly: boolean;
  error?: string;
}

export function DateField({
  field,
  path,
  form,
  autoFocus,
  fieldId,
  label,
  isDisabled,
  isReadOnly,
  error,
}: DateFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const value = form.watch(path);
  const dateValue = parseToDate(value);
  const hasError = !!error;

  const timePickerConfig =
    field.type === "datetime"
      ? (field as DatetimeFieldType).ui?.timePicker
      : undefined;
  const hasTimePicker = field.type === "datetime";
  const includeSeconds =
    typeof timePickerConfig === "object"
      ? timePickerConfig.includeSeconds === true
      : false;
  const use24hr =
    typeof timePickerConfig === "object"
      ? timePickerConfig.use24hr !== false
      : true;

  const dateInputFormat =
    field.ui?.inputFormat || field.ui?.format || "MM/dd/yyyy";

  const [inputText, setInputText] = useState(() =>
    dateValue ? format(dateValue, dateInputFormat) : ""
  );

  const [lastSyncedValue, setLastSyncedValue] = useState<Date | undefined>(
    dateValue
  );

  const isSameDate = (d1?: Date, d2?: Date) => {
    if (!d1 && !d2) return true;
    if (!d1 || !d2) return false;
    return d1.getTime() === d2.getTime();
  };

  if (!isSameDate(dateValue, lastSyncedValue)) {
    setLastSyncedValue(dateValue);
    const formatted = dateValue ? format(dateValue, dateInputFormat) : "";
    if (formatted !== inputText) {
      setInputText(formatted);
    }
  }

  const placeholder = field.placeholder || dateInputFormat.toLowerCase();

  const presetsConfig = field.ui?.presets;
  const presets =
    presetsConfig === true
      ? DEFAULT_PRESETS
      : Array.isArray(presetsConfig)
        ? presetsConfig
        : null;

  const minDate = parseToDate(field.minDate);
  const maxDate = parseToDate(field.maxDate);
  const disabledMatchers: Matcher[] = [];
  if (minDate) disabledMatchers.push({ before: startOfDay(minDate) });
  if (maxDate) disabledMatchers.push({ after: startOfDay(maxDate) });

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      form.setValue(path, undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    // Preserve existing time if switching dates
    let nextDate = date;
    if (dateValue && hasTimePicker) {
      nextDate = setHours(nextDate, getHours(dateValue));
      nextDate = setMinutes(nextDate, getMinutes(dateValue));
      nextDate = setSeconds(nextDate, getSeconds(dateValue));
    }

    // Validate against min/max
    if (minDate && nextDate < startOfDay(minDate)) nextDate = minDate;
    if (maxDate && nextDate > startOfDay(maxDate)) nextDate = maxDate;

    form.setValue(path, nextDate, {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (!hasTimePicker) setIsOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeVal = e.target.value;
    if (!timeVal) return;

    const [hours, minutes, seconds] = timeVal.split(":").map(Number);
    const current = dateValue || new Date();
    let next = setHours(current, hours || 0);
    next = setMinutes(next, minutes || 0);
    next = setSeconds(next, seconds || 0);

    // Validate against min/max (optional, but good practice)
    if (minDate && next < minDate) next = minDate;
    if (maxDate && next > maxDate) next = maxDate;

    form.setValue(path, next, { shouldDirty: true, shouldValidate: true });
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    form.setValue(path, undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handlePresetClick = (preset: {
    label: string;
    value: Date | (() => Date);
  }) => {
    const date =
      typeof preset.value === "function" ? preset.value() : preset.value;

    // Preserve existing time
    let nextDate = date;
    if (dateValue && hasTimePicker) {
      nextDate = setHours(nextDate, getHours(dateValue));
      nextDate = setMinutes(nextDate, getMinutes(dateValue));
      nextDate = setSeconds(nextDate, getSeconds(dateValue));
    }

    // Validate
    if (minDate && nextDate < startOfDay(minDate)) nextDate = minDate;
    if (maxDate && nextDate > startOfDay(maxDate)) nextDate = maxDate;

    form.setValue(path, nextDate, {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (!hasTimePicker) setIsOpen(false);
  };

  // Handle manual text input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  // Parse and validate typed date on blur
  const handleInputBlur = () => {
    form.onBlur?.(path);

    if (!inputText.trim()) {
      // Empty input - clear the date if not required
      if (!field.required) {
        form.setValue(path, undefined, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      return;
    }

    // Try to parse the input using the configured format
    const parsedDate = parse(inputText, dateInputFormat, new Date());

    if (isValid(parsedDate)) {
      // Preserve existing time when updating date
      let nextDate = parsedDate;
      if (dateValue && hasTimePicker) {
        nextDate = setHours(nextDate, getHours(dateValue));
        nextDate = setMinutes(nextDate, getMinutes(dateValue));
        nextDate = setSeconds(nextDate, getSeconds(dateValue));
      }

      // Check Min/Max
      if (minDate && nextDate < startOfDay(minDate)) {
        setInputText(dateValue ? format(dateValue, dateInputFormat) : "");
        return;
      }
      if (maxDate && nextDate > startOfDay(maxDate)) {
        setInputText(dateValue ? format(dateValue, dateInputFormat) : "");
        return;
      }

      form.setValue(path, nextDate, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else {
      // Invalid input - revert to previous value
      setInputText(dateValue ? format(dateValue, dateInputFormat) : "");
    }
  };

  const timeFormat = includeSeconds
    ? use24hr
      ? "HH:mm:ss"
      : "hh:mm:ss a"
    : use24hr
      ? "HH:mm"
      : "hh:mm a";

  const timeValue = dateValue
    ? includeSeconds
      ? format(dateValue, "HH:mm:ss")
      : format(dateValue, "HH:mm")
    : "";

  void timeFormat;

  const timeInterval =
    typeof timePickerConfig === "object" && timePickerConfig.interval
      ? timePickerConfig.interval
      : 1;
  const timeStep = includeSeconds ? 1 : timeInterval * 60;

  const renderInputContent = () => {
    const calendarContent = (
      <div className="flex flex-col">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleDateSelect}
          disabled={disabledMatchers.length ? disabledMatchers : undefined}
          autoFocus={autoFocus}
          className="w-full"
        />

        {presets && presets.length > 0 && (
          <div className="border-t px-3 py-2 flex flex-wrap gap-1.5">
            {presets.map((preset, i) => (
              <InputGroupButton
                key={i}
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2.5 rounded-full"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </InputGroupButton>
            ))}
          </div>
        )}
      </div>
    );

    const triggerContent = (
      <InputGroup
        className={cn(
          hasError && "border-destructive focus-within:ring-destructive"
        )}
      >
        <InputGroupAddon align="inline-start" className="pl-3">
          <Popover open={isOpen} onOpenChange={setIsOpen} modal>
            <PopoverTrigger
              className="h-6 w-6 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground"
              onClick={() => setIsOpen(true)}
              title="Open calendar"
              disabled={isDisabled || isReadOnly}
            >
              <IconPlaceholder
                lucide="Calendar"
                hugeicons="Calendar02Icon"
                tabler="IconCalendar"
                phosphor="Calendar"
                remixicon="RiCalendarLine"
                className="size-4"
              />
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto" align="start">
              {calendarContent}
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
        <InputGroupInput
          id={fieldId}
          value={inputText}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={isDisabled}
          readOnly={isReadOnly}
          autoComplete={field.autoComplete}
          className="px-2"
          autoFocus={autoFocus}
        />
        {!field.required && !isDisabled && !isReadOnly && dateValue && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              variant="ghost"
              size="icon-xs"
              onClick={handleClear}
              className="h-8 w-8 rounded-full hover:bg-muted"
              title="Clear date"
            >
              <IconPlaceholder
                lucide="X"
                hugeicons="Cancel01Icon"
                tabler="IconX"
                phosphor="X"
                remixicon="RiCloseLine"
                className="size-3.5 text-muted-foreground"
              />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    );

    if (!hasTimePicker) {
      return triggerContent;
    }

    return (
      <FieldGroup className="flex-col sm:flex-row gap-3 items-stretch">
        <div className="flex flex-col gap-1.5 flex-1">
          <FieldLabel
            htmlFor={fieldId}
            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-0.5 mb-0"
          >
            Date
          </FieldLabel>
          <div className="relative">{triggerContent}</div>
        </div>

        <div className="flex flex-col gap-1.5 w-full sm:w-40">
          <FieldLabel
            htmlFor={`${fieldId}-time`}
            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-0.5 mb-0"
          >
            Time
          </FieldLabel>
          <InputGroup
            className={cn(
              hasError && "border-destructive focus-within:ring-destructive",
              !dateValue &&
                "opacity-50 cursor-not-allowed text-muted-foreground"
            )}
          >
            <InputGroupAddon
              align="inline-start"
              className="pl-3 pointer-events-none"
            >
              <IconPlaceholder
                lucide="Clock"
                hugeicons="Clock01Icon"
                tabler="IconClock"
                phosphor="Clock"
                remixicon="RiTimeLine"
                className="size-4 shrink-0"
              />
            </InputGroupAddon>
            <InputGroupInput
              id={`${fieldId}-time`}
              type="time"
              step={timeStep}
              value={timeValue}
              onChange={handleTimeChange}
              disabled={isDisabled || !dateValue}
              className="px-2 focus-visible:ring-0 focus:ring-0 outline-none ring-0 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              placeholder="--:--"
            />
          </InputGroup>
        </div>
      </FieldGroup>
    );
  };

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

      <FieldContent>{renderInputContent()}</FieldContent>

      {field.description && (
        <FieldDescription id={`${fieldId}-description`}>
          {field.description}
        </FieldDescription>
      )}

      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}

const InputSkeleton = ({ className = "" }: { className?: string }) => (
  <div
    className={cn(
      "h-8 w-full border border-input rounded-lg flex items-center gap-2 px-3 bg-muted/40",
      className
    )}
  >
    <div className="size-4 rounded bg-muted-foreground/20 shrink-0" />
    <div className="h-4 flex-1 bg-muted-foreground/20 rounded" />
  </div>
);

export function DateFieldSkeleton({
  field,
}: {
  field: DateFieldType | DatetimeFieldType;
}) {
  const label = field.label !== false ? (field.label ?? field.name) : null;
  const timePickerConfig =
    field.type === "datetime"
      ? (field as DatetimeFieldType).ui?.timePicker
      : undefined;
  const hasTimePicker = field.type === "datetime";
  void timePickerConfig;

  if (hasTimePicker) {
    return (
      <Field className={field.style?.className}>
        {label && <div className="h-4 w-24 animate-pulse rounded bg-muted" />}
        <FieldContent>
          <FieldGroup className="flex-col sm:flex-row gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-2.5 w-8 bg-muted rounded" />
              <InputSkeleton />
            </div>
            <div className="flex flex-col gap-1.5 w-full sm:w-40">
              <div className="h-2.5 w-8 bg-muted rounded" />
              <InputSkeleton />
            </div>
          </FieldGroup>
        </FieldContent>
        {field.description && (
          <div className="h-3 w-48 animate-pulse rounded bg-muted" />
        )}
      </Field>
    );
  }

  return (
    <Field className={field.style?.className}>
      {label && <div className="h-4 w-24 animate-pulse rounded bg-muted" />}
      <FieldContent>
        <InputSkeleton />
      </FieldContent>
      {field.description && (
        <div className="h-3 w-48 animate-pulse rounded bg-muted" />
      )}
    </Field>
  );
}
