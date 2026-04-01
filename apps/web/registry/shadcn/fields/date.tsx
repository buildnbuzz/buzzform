"use client";

import * as React from "react";
import type { DateField as DateFieldDef } from "@buildnbuzz/form-core";
import { useDataField } from "@buildnbuzz/form-react";
import {
  format,
  parse,
  isValid,
  startOfDay,
  addDays,
  startOfWeek,
  addWeeks,
  setHours,
  setMinutes,
  setSeconds,
  getHours,
  getMinutes,
  getSeconds,
} from "date-fns";
import { IconPlaceholder } from "@/components/icon-placeholder";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// UI options
// ---------------------------------------------------------------------------

interface DatePreset {
  label: string;
  value: string | (() => string);
}

interface DateUi {
  /** date-fns display format for the calendar trigger. Defaults to `"MM/dd/yyyy"`. */
  format?: string;
  /** date-fns format for manual text input. Defaults to `format`. */
  inputFormat?: string;
  /** Quick-select presets. `true` uses built-in Today/Tomorrow/Next Week. */
  presets?: boolean | DatePreset[];
  /** Time picker config (only used when `field.withTime` is true). */
  timePicker?:
    | boolean
    | {
        /** Minute interval for the time input step. Defaults to `1`. */
        interval?: number;
        /** Use 24-hour format. Defaults to `true`. */
        use24hr?: boolean;
        /** Include seconds. Defaults to `false`. */
        includeSeconds?: boolean;
      };
  /** Auto-focus the text input on mount. */
  autoFocus?: boolean;
  /** className applied to `<FieldGroup>`. */
  className?: string;
  /** Inline width applied to `<FieldGroup>`. */
  width?: string | number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_PRESETS: DatePreset[] = [
  { label: "Today", value: () => startOfDay(new Date()).toISOString() },
  {
    label: "Tomorrow",
    value: () => startOfDay(addDays(new Date(), 1)).toISOString(),
  },
  {
    label: "Next Week",
    value: () =>
      startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }).toISOString(),
  },
];

function isoToDate(iso: string | undefined | null): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return isValid(d) ? d : undefined;
}

function dateToIso(date: Date, withTime: boolean): string {
  if (withTime) return date.toISOString();
  return format(date, "yyyy-MM-dd");
}

// ---------------------------------------------------------------------------
// DateField
// ---------------------------------------------------------------------------

export function DateField() {
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
    handleBlur,
  } = useDataField<DateFieldDef>();

  const ui = field.ui as DateUi | undefined;
  const withTime = field.withTime ?? false;
  const displayFormat = ui?.format ?? "MM/dd/yyyy";
  const inputFormat = ui?.inputFormat ?? displayFormat;

  const timePickerConfig = withTime ? (ui?.timePicker ?? true) : undefined;
  const includeSeconds =
    typeof timePickerConfig === "object"
      ? timePickerConfig.includeSeconds === true
      : false;
  const timeInterval =
    typeof timePickerConfig === "object" && timePickerConfig.interval
      ? timePickerConfig.interval
      : 1;
  const timeStep = includeSeconds ? 1 : timeInterval * 60;

  const presetsConfig = ui?.presets;
  const presets: DatePreset[] | null =
    presetsConfig === true
      ? DEFAULT_PRESETS
      : Array.isArray(presetsConfig)
        ? presetsConfig
        : null;

  const minDate = isoToDate(field.minDate);
  const maxDate = isoToDate(field.maxDate);

  const storedValue = fieldApi.state.value as string | undefined;
  const dateValue = isoToDate(storedValue);

  const [isOpen, setIsOpen] = React.useState(false);
  const [inputText, setInputText] = React.useState(() =>
    dateValue ? format(dateValue, inputFormat) : "",
  );
  const [lastSynced, setLastSynced] = React.useState<Date | undefined>(
    dateValue,
  );

  // Keep inputText in sync when value changes externally
  if (dateValue?.getTime() !== lastSynced?.getTime()) {
    setLastSynced(dateValue);
    const formatted = dateValue ? format(dateValue, inputFormat) : "";
    if (formatted !== inputText) setInputText(formatted);
  }

  const width = ui?.width;
  const widthStyle = width
    ? {
        width: typeof width === "number" ? `${width}px` : width,
        flex: "0 1 auto",
      }
    : undefined;

  const clampDate = (date: Date): Date => {
    if (minDate && date < startOfDay(minDate)) return minDate;
    if (maxDate && date > startOfDay(maxDate)) return maxDate;
    return date;
  };

  const preserveTime = (next: Date): Date => {
    if (!dateValue || !withTime) return next;
    let d = setHours(next, getHours(dateValue));
    d = setMinutes(d, getMinutes(dateValue));
    d = setSeconds(d, getSeconds(dateValue));
    return d;
  };

  const commit = (date: Date) => {
    fieldApi.handleChange(dateToIso(date, withTime));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      fieldApi.handleChange(undefined as unknown as string);
      return;
    }
    commit(clampDate(preserveTime(date)));
    if (!withTime) setIsOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m, s] = e.target.value.split(":").map(Number);
    const base = dateValue ?? new Date();
    let next = setHours(base, h || 0);
    next = setMinutes(next, m || 0);
    next = setSeconds(next, s || 0);
    commit(clampDate(next));
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    fieldApi.handleChange(undefined as unknown as string);
  };

  const handlePreset = (preset: DatePreset) => {
    const iso =
      typeof preset.value === "function" ? preset.value() : preset.value;
    const date = isoToDate(iso);
    if (!date) return;
    commit(clampDate(preserveTime(date)));
    if (!withTime) setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleInputBlur = () => {
    handleBlur();
    if (!inputText.trim()) {
      if (!isRequired) fieldApi.handleChange(undefined as unknown as string);
      return;
    }
    const parsed = parse(inputText, inputFormat, new Date());
    if (isValid(parsed)) {
      const clamped = clampDate(preserveTime(parsed));
      if (minDate && parsed < startOfDay(minDate)) {
        setInputText(dateValue ? format(dateValue, inputFormat) : "");
        return;
      }
      if (maxDate && parsed > startOfDay(maxDate)) {
        setInputText(dateValue ? format(dateValue, inputFormat) : "");
        return;
      }
      commit(clamped);
    } else {
      setInputText(dateValue ? format(dateValue, inputFormat) : "");
    }
  };

  const timeValue = dateValue
    ? includeSeconds
      ? format(dateValue, "HH:mm:ss")
      : format(dateValue, "HH:mm")
    : "";

  const disabledMatchers = [
    ...(minDate ? [{ before: startOfDay(minDate) }] : []),
    ...(maxDate ? [{ after: startOfDay(maxDate) }] : []),
  ];

  const calendarPopover = (
    <div className="flex flex-col">
      <Calendar
        mode="single"
        selected={dateValue}
        onSelect={handleDateSelect}
        disabled={disabledMatchers.length ? disabledMatchers : undefined}
        autoFocus={ui?.autoFocus}
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
              onClick={() => handlePreset(preset)}
            >
              {preset.label}
            </InputGroupButton>
          ))}
        </div>
      )}
    </div>
  );

  const dateInput = (
    <InputGroup>
      <InputGroupAddon align="inline-start" className="pl-3">
        <Popover open={isOpen} onOpenChange={setIsOpen} modal>
          <PopoverTrigger
            className="h-6 w-6 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground"
            disabled={isDisabled || isReadOnly}
          >
            <IconPlaceholder
              lucide="Calendar"
              hugeicons="Calendar03Icon"
              tabler="IconCalendar"
              phosphor="Calendar"
              remixicon="RiCalendarLine"
              className="size-4"
            />
          </PopoverTrigger>
          <PopoverContent
            className="p-0 w-auto min-w-(--anchor-width)"
            align="start"
          >
            {calendarPopover}
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
      <InputGroupInput
        id={fieldApi.name}
        value={inputText}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder={placeholder || inputFormat.toLowerCase()}
        disabled={isDisabled}
        readOnly={isReadOnly}
        autoComplete={field.autoComplete}
        autoFocus={ui?.autoFocus}
        aria-invalid={isInvalid}
        aria-describedby={ariaDescribedBy}
        className="px-2"
      />
      {!isRequired && !isDisabled && !isReadOnly && dateValue && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            variant="ghost"
            size="icon-xs"
            onClick={handleClear}
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

  const content = withTime ? (
    <FieldGroup className="flex-col sm:flex-row gap-3 items-stretch">
      <div className="flex flex-col gap-1.5 flex-1">
        <FieldLabel
          htmlFor={fieldApi.name}
          className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-0.5 mb-0"
        >
          Date
        </FieldLabel>
        {dateInput}
      </div>
      <div className="flex flex-col gap-1.5 w-full sm:w-40">
        <FieldLabel
          htmlFor={`${fieldApi.name}-time`}
          className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-0.5 mb-0"
        >
          Time
        </FieldLabel>
        <InputGroup
          className={cn(!dateValue && "opacity-50 cursor-not-allowed")}
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
            id={`${fieldApi.name}-time`}
            type="time"
            step={timeStep}
            value={timeValue}
            onChange={handleTimeChange}
            disabled={isDisabled || !dateValue}
            className="px-2 focus-visible:ring-0 outline-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
            placeholder="--:--"
          />
        </InputGroup>
      </div>
    </FieldGroup>
  ) : (
    dateInput
  );

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
            {isRequired ? <span className="text-destructive">*</span> : null}
          </FieldLabel>
        )}
        <FieldContent>{content}</FieldContent>
        {description && !isInvalid && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}
        {isInvalid && <FieldError id={errorId} errors={errors} />}
      </Field>
    </FieldGroup>
  );
}
