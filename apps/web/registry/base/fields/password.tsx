"use client";

import React, { useState } from "react";
import type {
  PasswordField as PasswordFieldType,
  FormAdapter,
} from "@buildnbuzz/buzzform";
import { getFieldWidthStyle } from "@buildnbuzz/buzzform";
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
import { IconPlaceholder } from "@/components/icon-placeholder";

interface PasswordCriteria {
  minLength?: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecial?: boolean;
}

interface PasswordStrengthResult {
  score: number;
  label: "none" | "weak" | "fair" | "strong" | "excellent";
  allMet: boolean;
  checks: {
    minLength: boolean;
    maxLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

function calculatePasswordStrength(
  password: string,
  criteria: PasswordCriteria = {}
): PasswordStrengthResult {
  const {
    minLength = 8,
    maxLength,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecial = false,
  } = criteria;

  const checks = {
    minLength: password.length >= minLength,
    maxLength: maxLength ? password.length <= maxLength : true,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const requiredChecks = [
    { met: checks.minLength, isRequired: true },
    { met: checks.maxLength, isRequired: maxLength !== undefined },
    { met: checks.hasUppercase, isRequired: requireUppercase },
    { met: checks.hasLowercase, isRequired: requireLowercase },
    { met: checks.hasNumber, isRequired: requireNumber },
    { met: checks.hasSpecial, isRequired: requireSpecial },
  ].filter((c) => c.isRequired);

  const metRequiredCount = requiredChecks.filter((c) => c.met).length;
  const allMet = metRequiredCount === requiredChecks.length;

  if (!password) {
    return { score: 0, label: "none", allMet: false, checks };
  }

  const varietyCount = [
    checks.hasUppercase,
    checks.hasLowercase,
    checks.hasNumber,
    checks.hasSpecial,
  ].filter(Boolean).length;

  let score = 0;

  if (password.length < 4) {
    score = 0;
  } else if (password.length < minLength) {
    score = 1;
  } else {
    score = Math.min(varietyCount, 4);
    if (password.length >= 16) score = Math.min(score + 1, 4);
  }

  if (!allMet) {
    score = Math.min(score, 2);
  }

  const labels: Record<number, PasswordStrengthResult["label"]> = {
    0: "none",
    1: "weak",
    2: "fair",
    3: "strong",
    4: "excellent",
  };

  return { score, label: labels[score] || "none", allMet, checks };
}

function generateStrongPassword(criteria: PasswordCriteria = {}): string {
  const {
    minLength = 16,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = true,
  } = criteria;

  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numberChars = "0123456789";
  const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let allChars = "";
  let password = "";

  if (requireUppercase) {
    allChars += uppercaseChars;
    password +=
      uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
  }
  if (requireLowercase) {
    allChars += lowercaseChars;
    password +=
      lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
  }
  if (requireNumber) {
    allChars += numberChars;
    password += numberChars[Math.floor(Math.random() * numberChars.length)];
  }
  if (requireSpecial) {
    allChars += specialChars;
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
  }

  if (!allChars) {
    allChars = lowercaseChars + uppercaseChars + numberChars;
  }

  const targetLength = Math.max(minLength, 12);
  const remainingLength = Math.max(0, targetLength - password.length);

  for (let i = 0; i < remainingLength; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}

const strengthLabels: Record<PasswordStrengthResult["label"], string> = {
  none: "",
  weak: "Weak",
  fair: "Fair",
  strong: "Strong",
  excellent: "Excellent",
};

function getStrengthColor(score: number, allMet: boolean): string {
  if (allMet && score >= 3) return "bg-green-500";
  if (score >= 3) return "bg-emerald-500";
  if (score === 2) return "bg-orange-500";
  if (score === 1) return "bg-red-500";
  return "bg-muted";
}

function getStrengthTextColor(score: number, allMet: boolean): string {
  if (allMet && score >= 3) return "text-green-600 dark:text-green-400";
  if (score >= 3) return "text-emerald-600 dark:text-emerald-400";
  if (score === 2) return "text-orange-600 dark:text-orange-400";
  if (score === 1) return "text-red-600 dark:text-red-400";
  return "text-muted-foreground";
}

export interface PasswordFieldProps {
  field: PasswordFieldType;
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

export function PasswordField({
  field,
  path,
  form,
  autoFocus,
  fieldId,
  label,
  isDisabled,
  isReadOnly,
  error,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const value = form.watch<string>(path) ?? "";
  const hasError = !!error;

  // Password criteria from field config
  const criteria = field.criteria ?? {};

  // Calculate strength once
  const strength = calculatePasswordStrength(value, {
    minLength: field.minLength ?? 8,
    maxLength: field.maxLength,
    ...criteria,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue(path, e.target.value, {
      shouldDirty: true,
    });
  };

  const handleBlur = () => {
    form.onBlur?.(path);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

  // Build requirements list based on calculated strength
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
                  <IconPlaceholder
                    lucide="Sparkles"
                    hugeicons="MagicWand01Icon"
                    tabler="IconWand"
                    phosphor="MagicWand"
                    remixicon="RiMagicLine"
                    className="size-3.5"
                  />
                </Button>
              )}
              {/* Show/hide button */}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={togglePasswordVisibility}
                disabled={isDisabled}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <IconPlaceholder
                    lucide="EyeOff"
                    hugeicons="ViewOffSlashIcon"
                    tabler="IconEyeOff"
                    phosphor="EyeSlash"
                    remixicon="RiEyeOffLine"
                    className="size-3.5"
                  />
                ) : (
                  <IconPlaceholder
                    lucide="Eye"
                    hugeicons="ViewIcon"
                    tabler="IconEye"
                    phosphor="Eye"
                    remixicon="RiEyeLine"
                    className="size-3.5"
                  />
                )}
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
                      <IconPlaceholder
                        lucide="Check"
                        hugeicons="Tick01Icon"
                        tabler="IconCheck"
                        phosphor="Check"
                        remixicon="RiCheckLine"
                        className="size-3 text-green-500"
                      />
                    ) : (
                      <IconPlaceholder
                        lucide="X"
                        hugeicons="Cancel01Icon"
                        tabler="IconX"
                        phosphor="X"
                        remixicon="RiCloseLine"
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

      {error && <FieldError>{error}</FieldError>}
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
