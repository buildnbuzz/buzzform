"use client";

import * as React from "react";
import type { TagsField as TagsFieldDef } from "@buildnbuzz/form-core";
import { useDataField } from "@buildnbuzz/form-react";
import { CopyButton } from "../components/copy-button";
import {
  TagInput,
  TagInputList,
  TagInputItem,
  TagInputControl,
  type TagInputDelimiter,
} from "../components/tag-input";
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

interface TagsUi {
  /** Keys that create a new tag. Defaults to `["enter"]`. */
  delimiters?: ("enter" | "comma" | "space" | "tab")[];
  /** Visual variant for tag chips. Defaults to `"chips"`. */
  variant?: "chips" | "pills" | "inline";
  /** Show a copy button that copies all tags as a comma-separated string. */
  copyable?: boolean;
  /** className applied to `<FieldGroup>`. */
  className?: string;
  /** Inline width applied to `<FieldGroup>`. */
  width?: string | number;
}

// ---------------------------------------------------------------------------
// TagsField
// ---------------------------------------------------------------------------

export function TagsField() {
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
  } = useDataField<TagsFieldDef>();

  const ui = field.ui as TagsUi | undefined;

  const delimiters = (ui?.delimiters ?? ["enter"]).map((d) =>
    d.charAt(0).toUpperCase() + d.slice(1)
  ) as TagInputDelimiter[];

  const variant = ui?.variant ?? "chips";
  const copyable = ui?.copyable ?? false;

  const width = ui?.width;
  const widthStyle = width
    ? {
        width: typeof width === "number" ? `${width}px` : width,
        flex: "0 1 auto",
      }
    : undefined;

  const value = Array.isArray(fieldApi.state.value)
    ? (fieldApi.state.value as string[])
    : [];

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

        <FieldContent>
          <div className="relative">
            <TagInput
              value={value}
              onValueChange={fieldApi.handleChange}
              variant={variant}
              disabled={isDisabled}
              readOnly={isReadOnly}
              maxTags={field.maxTags}
              allowDuplicates={field.allowDuplicates}
              maxTagLength={field.maxTagLength}
            >
              <TagInputList className={cn(copyable && "pr-10")}>
                {value.map((tag, i) => (
                  <TagInputItem key={`${tag}-${i}`} index={i} />
                ))}
                <TagInputControl
                  id={fieldApi.name}
                  delimiters={delimiters}
                  placeholder={placeholder || "Add tags..."}
                  onBlur={handleBlur}
                  autoComplete={field.autoComplete}
                  aria-invalid={isInvalid}
                  aria-describedby={ariaDescribedBy}
                />
              </TagInputList>
            </TagInput>

            {copyable && value.length > 0 && (
              <CopyButton
                value={value.join(", ")}
                disabled={isDisabled}
                className="absolute right-0 top-0 h-full px-2.5 text-muted-foreground hover:text-foreground"
              />
            )}
          </div>

          {field.maxTags !== undefined && (
            <p className="mt-1 text-xs text-muted-foreground">
              {value.length} / {field.maxTags} tags
            </p>
          )}
        </FieldContent>

        {description && !isInvalid && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}
        {isInvalid && <FieldError id={errorId} errors={errors} />}
      </Field>
    </FieldGroup>
  );
}
