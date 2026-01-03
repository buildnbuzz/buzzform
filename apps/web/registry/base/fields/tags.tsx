"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  KeyboardEvent,
} from "react";
import type {
  TagsField as TagsFieldType,
  FormAdapter,
} from "@buildnbuzz/buzzform";
import { generateFieldId } from "@buildnbuzz/buzzform";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/buzzform/copy";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

export interface TagsFieldProps {
  field: TagsFieldType;
  path: string;
  form: FormAdapter;
  autoFocus?: boolean;
  formValues: Record<string, unknown>;
  siblingData: Record<string, unknown>;
}

// X icon for removing tags
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function TagsField({
  field,
  path,
  form,
  autoFocus,
  formValues,
  siblingData,
}: TagsFieldProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const tags = useMemo(() => {
    const value = form.watch<string[]>(path) ?? [];
    return Array.isArray(value) ? value : [];
  }, [form, path]);

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

  // Get delimiters from field config - memoized
  const delimiters = useMemo(
    () => field.ui?.delimiters ?? ["enter"],
    [field.ui?.delimiters]
  );
  const variant = field.ui?.variant ?? "chips";
  const allowDuplicates = field.allowDuplicates ?? false;
  const maxTags = field.maxTags;
  const maxTagLength = field.maxTagLength;

  const canAddMore = maxTags === undefined || tags.length < maxTags;

  const updateTags = useCallback(
    (newTags: string[]) => {
      form.setValue(path, newTags, { shouldDirty: true });
    },
    [form, path]
  );

  const addTag = useCallback(
    (tagValue: string) => {
      const trimmed = tagValue.trim();
      if (!trimmed) return false;

      // Check max tag length
      if (maxTagLength && trimmed.length > maxTagLength) return false;

      // Check for duplicates
      if (!allowDuplicates && tags.includes(trimmed)) return false;

      // Check max tags limit
      if (maxTags !== undefined && tags.length >= maxTags) return false;

      updateTags([...tags, trimmed]);
      return true;
    },
    [tags, updateTags, allowDuplicates, maxTags, maxTagLength]
  );

  const removeTag = useCallback(
    (index: number) => {
      if (isDisabled || isReadOnly) return;
      const newTags = tags.filter((_, i) => i !== index);
      updateTags(newTags);
    },
    [tags, updateTags, isDisabled, isReadOnly]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const currentValue = inputValue.trim();

      // Handle backspace to remove last tag
      if (e.key === "Backspace" && !inputValue && tags.length > 0) {
        removeTag(tags.length - 1);
        return;
      }

      // Check delimiter keys
      const shouldAdd =
        (delimiters.includes("enter") && e.key === "Enter") ||
        (delimiters.includes("comma") && e.key === ",") ||
        (delimiters.includes("space") && e.key === " ") ||
        (delimiters.includes("tab") && e.key === "Tab");

      if (shouldAdd && currentValue) {
        e.preventDefault();
        if (addTag(currentValue)) {
          setInputValue("");
        }
      }
    },
    [inputValue, tags, delimiters, addTag, removeTag]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Handle comma/space delimiter if they're active
      if (
        delimiters.includes("comma") &&
        newValue.includes(",") &&
        !newValue.endsWith(",")
      ) {
        const parts = newValue.split(",");
        const lastPart = parts.pop() ?? "";
        parts.forEach((part) => addTag(part));
        setInputValue(lastPart);
        return;
      }

      setInputValue(newValue);
    },
    [delimiters, addTag]
  );

  const handleBlur = useCallback(() => {
    // Optionally add pending tag on blur
    const trimmed = inputValue.trim();
    if (trimmed) {
      if (addTag(trimmed)) {
        setInputValue("");
      }
    }
    form.onBlur(path);
  }, [inputValue, addTag, form, path]);

  const handleContainerClick = useCallback(() => {
    if (!isDisabled && !isReadOnly) {
      inputRef.current?.focus();
    }
  }, [isDisabled, isReadOnly]);

  // Get variant-specific styles
  const getTagStyles = () => {
    switch (variant) {
      case "pills":
        return "rounded-full px-3 py-0.5";
      case "inline":
        return "rounded-none border-0 border-b-2 px-1 py-0 bg-transparent";
      case "chips":
      default:
        return "rounded-md px-2 py-0.5";
    }
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
        <FieldLabel htmlFor={fieldId} className="gap-1 items-baseline">
          {label}
          {field.required && <span className="text-destructive">*</span>}
        </FieldLabel>
      )}

      <FieldContent>
        <div className="relative">
          <div
            ref={containerRef}
            onClick={handleContainerClick}
            className={cn(
              "flex flex-wrap items-center gap-1.5 min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
              hasError && "border-destructive focus-within:ring-destructive",
              isDisabled && "cursor-not-allowed opacity-50",
              isReadOnly && "cursor-default bg-muted",
              field.ui?.copyable && "pr-10"
            )}
          >
            {tags.map((tag, index) => (
              <Badge
                key={`${tag}-${index}`}
                variant="secondary"
                className={cn(
                  "gap-1 h-6 text-xs font-normal shrink-0",
                  getTagStyles(),
                  !isDisabled && !isReadOnly && "pr-1"
                )}
              >
                <span className="truncate max-w-37.5">{tag}</span>
                {!isDisabled && !isReadOnly && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(index);
                    }}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 focus:outline-none focus:ring-1 focus:ring-ring"
                    aria-label={`Remove ${tag}`}
                  >
                    <XIcon className="size-3" />
                  </button>
                )}
              </Badge>
            ))}

            {!isReadOnly && canAddMore && (
              <input
                ref={inputRef}
                id={fieldId}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder={
                  tags.length === 0 ? (field.placeholder ?? "Add tags...") : ""
                }
                disabled={isDisabled}
                autoFocus={autoFocus}
                autoComplete={field.autoComplete ?? "off"}
                aria-invalid={hasError}
                aria-describedby={
                  field.description ? `${fieldId}-description` : undefined
                }
                className={cn(
                  "flex-1 min-w-20 bg-transparent outline-none text-sm placeholder:text-muted-foreground",
                  "disabled:cursor-not-allowed"
                )}
              />
            )}

            {isReadOnly && tags.length === 0 && (
              <span className="text-muted-foreground text-sm">No tags</span>
            )}
          </div>

          {field.ui?.copyable && tags.length > 0 && (
            <CopyButton
              value={tags.join(", ")}
              disabled={isDisabled}
              className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
            />
          )}
        </div>

        {/* Tag count indicator */}
        {maxTags !== undefined && (
          <div className="mt-1 text-xs text-muted-foreground">
            {tags.length} / {maxTags} tags
          </div>
        )}
      </FieldContent>

      {field.description && (
        <FieldDescription id={`${fieldId}-description`}>
          {field.description}
        </FieldDescription>
      )}

      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </Field>
  );
}

export function TagsFieldSkeleton({ field }: { field: TagsFieldType }) {
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
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
      </FieldContent>
      {field.description && (
        <div className="h-3 w-48 animate-pulse rounded bg-muted" />
      )}
    </Field>
  );
}
