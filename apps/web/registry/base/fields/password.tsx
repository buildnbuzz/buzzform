"use client";

import React, { useState } from "react";
import type {
  PasswordField as PasswordFieldType,
  FormAdapter,
} from "@buildnbuzz/buzzform";
import { generateFieldId } from "@buildnbuzz/buzzform";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/buzzform/copy";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ViewIcon,
  ViewOffSlashIcon,
  MagicWand01Icon,
  Tick01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import {
  calculatePasswordStrength,
  generateStrongPassword,
  strengthLabels,
  getStrengthColor,
  getStrengthTextColor,
} from "@/components/buzzform/lib/password";

export interface PasswordFieldProps {
  field: PasswordFieldType;
  path: string;
  form: FormAdapter;
  autoFocus?: boolean;
  formValues: Record<string, unknown>;
  siblingData: Record<string, unknown>;
}

export function PasswordField({
  field,
  path,
  form,
  autoFocus,
  formValues,
  siblingData,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const value = form.watch<string>(path) ?? "";

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

  // Password criteria from field config
  const criteria = field.criteria ?? {};
  const strength = calculatePasswordStrength(value, {
    minLength: field.minLength ?? 8,
    maxLength: field.maxLength,
    ...criteria,
  });

  // Build requirements list
  const requirements = [
    {
      key: "minLength",
      label: `At least ${field.minLength ?? 8} characters`,
      met: strength.checks.minLength,
    },
    ...(field.maxLength
      ? [
          {
            key: "maxLength",
            label: `At most ${field.maxLength} characters`,
            met: strength.checks.maxLength,
          },
        ]
      : []),
    ...(criteria.requireUppercase
      ? [
          {
            key: "uppercase",
            label: "One uppercase letter",
            met: strength.checks.hasUppercase,
          },
        ]
      : []),
    ...(criteria.requireLowercase
      ? [
          {
            key: "lowercase",
            label: "One lowercase letter",
            met: strength.checks.hasLowercase,
          },
        ]
      : []),
    ...(criteria.requireNumber
      ? [
          {
            key: "number",
            label: "One number",
            met: strength.checks.hasNumber,
          },
        ]
      : []),
    ...(criteria.requireSpecial
      ? [
          {
            key: "special",
            label: "One special character",
            met: strength.checks.hasSpecial,
          },
        ]
      : []),
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue(path, e.target.value, {
      shouldDirty: true,
    });
  };

  const handleBlur = () => {
    form.onBlur(path);
  };

  const handleGenerate = () => {
    const generated = generateStrongPassword({
      minLength: field.minLength ?? 16,
      maxLength: field.maxLength,
      ...criteria,
    });
    form.setValue(path, generated, { shouldDirty: true });
    setShowPassword(true); // Show password after generating
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
        <div className="space-y-2">
          {/* Input with show/hide and generate buttons */}
          <div className="relative">
            <Input
              id={fieldId}
              name={path}
              type={showPassword ? "text" : "password"}
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={field.placeholder}
              disabled={isDisabled}
              readOnly={isReadOnly}
              autoComplete={field.autoComplete ?? "new-password"}
              aria-invalid={hasError}
              aria-describedby={
                field.ui?.showRequirements
                  ? `${fieldId}-requirements`
                  : field.description
                    ? `${fieldId}-description`
                    : undefined
              }
              minLength={field.minLength}
              maxLength={field.maxLength}
              required={field.required}
              autoFocus={autoFocus}
              className={cn(
                "pr-20",
                field.ui?.allowGenerate && "pr-28",
                field.ui?.copyable && "pr-36"
              )}
            />
            <div className="absolute right-0 top-0 h-full flex items-center gap-0.5 pr-1">
              {/* Copy button */}
              {field.ui?.copyable && value && (
                <CopyButton
                  value={value}
                  disabled={isDisabled}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                />
              )}
              {/* Generate button */}
              {field.ui?.allowGenerate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleGenerate}
                  disabled={isDisabled || isReadOnly}
                  aria-label="Generate password"
                  title="Generate strong password"
                >
                  <HugeiconsIcon icon={MagicWand01Icon} className="size-3.5" />
                </Button>
              )}
              {/* Show/hide button */}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isDisabled}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <HugeiconsIcon
                  icon={showPassword ? ViewOffSlashIcon : ViewIcon}
                  className="size-3.5"
                />
              </Button>
            </div>
          </div>

          {/* Strength indicator bar */}
          {field.ui?.strengthIndicator && value && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1 h-1 flex-1">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "h-full flex-1 rounded-full transition-colors",
                      idx < strength.score
                        ? getStrengthColor(strength.score, strength.allMet)
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
              {strength.label !== "none" && (
                <span
                  className={cn(
                    "text-xs font-medium transition-colors",
                    getStrengthTextColor(strength.score, strength.allMet)
                  )}
                >
                  {strengthLabels[strength.label]}
                </span>
              )}
            </div>
          )}

          {/* Requirements checklist */}
          {field.ui?.showRequirements && requirements.length > 0 && (
            <div
              id={`${fieldId}-requirements`}
              className="text-xs space-y-1"
              role="list"
              aria-label="Password requirements"
            >
              {requirements.map((req) => (
                <div
                  key={req.key}
                  className={cn(
                    "flex items-center gap-1.5 transition-colors",
                    value
                      ? req.met
                        ? "text-green-600 dark:text-green-400"
                        : "text-muted-foreground"
                      : "text-muted-foreground"
                  )}
                  role="listitem"
                >
                  {value ? (
                    req.met ? (
                      <HugeiconsIcon
                        icon={Tick01Icon}
                        className="size-3 text-green-500"
                      />
                    ) : (
                      <HugeiconsIcon
                        icon={Cancel01Icon}
                        className="size-3 text-muted-foreground"
                      />
                    )
                  ) : (
                    <span className="size-3 rounded-full border border-muted-foreground/50" />
                  )}
                  <span>{req.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
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

export function PasswordFieldSkeleton({ field }: { field: PasswordFieldType }) {
  const label = field.label !== false ? (field.label ?? field.name) : null;
  const showStrengthBar = field.ui?.strengthIndicator;
  const showRequirements = field.ui?.showRequirements;

  const requirementCount = [
    true, // minLength always
    !!field.maxLength,
    !!field.criteria?.requireUppercase,
    !!field.criteria?.requireLowercase,
    !!field.criteria?.requireNumber,
    !!field.criteria?.requireSpecial,
  ].filter(Boolean).length;

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
        <div className="space-y-2">
          <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
          {showStrengthBar && (
            <div className="h-1 w-full animate-pulse rounded-full bg-muted" />
          )}
          {showRequirements && (
            <div className="space-y-1">
              {Array.from({ length: requirementCount }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 w-32 animate-pulse rounded bg-muted"
                />
              ))}
            </div>
          )}
        </div>
      </FieldContent>
      {field.description && (
        <div className="h-3 w-48 animate-pulse rounded bg-muted" />
      )}
    </Field>
  );
}
