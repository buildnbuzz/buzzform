"use client";

import { useState } from "react";
import type { PasswordField as PasswordFieldDef } from "@buildnbuzz/form-react";
import { useDataField } from "@buildnbuzz/form-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CopyButton } from "../components/copy-button";
import { IconPlaceholder } from "@/components/icon-placeholder";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface PasswordUi {
  /** Show a password strength indicator bar. */
  strengthIndicator?: boolean;
  /** Show a checklist of password requirements. */
  showRequirements?: boolean;
  /** Show a generate strong password button. */
  allowGenerate?: boolean;
  /** Show a copy button. */
  copyable?: boolean;
  autoFocus?: boolean;
  className?: string;
  width?: string | number;
  asterisk?: boolean;
  /** Text and label overrides. */
  labels?: {
    /** Labels for different strength levels. */
    strength?: Partial<Record<StrengthResult["label"], React.ReactNode>>;
    /** Labels for individual requirements. */
    requirements?: {
      minLength?: React.ReactNode | ((min: number) => React.ReactNode);
      maxLength?: React.ReactNode | ((max: number) => React.ReactNode);
      uppercase?: React.ReactNode;
      lowercase?: React.ReactNode;
      number?: React.ReactNode;
      special?: React.ReactNode;
    };
    /** A11y and tooltip strings (must be strings for HTML attributes). */
    aria?: {
      generate?: string;
      showPassword?: string;
      hidePassword?: string;
      requirementsList?: string;
    };
  };
}

interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
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

const STRENGTH_LABELS: Record<StrengthResult["label"], string> = {
  none: "",
  weak: "Weak",
  fair: "Fair",
  strong: "Strong",
  excellent: "Excellent",
};

function calculateStrength(
  value: string,
  field: PasswordFieldDef,
): StrengthResult {
  const minLength = field.minLength ?? 8;
  const criteria = field.criteria ?? {};

  const checks = {
    minLength: value.length >= minLength,
    maxLength: field.maxLength ? value.length <= field.maxLength : true,
    hasUppercase: /[A-Z]/.test(value),
    hasLowercase: /[a-z]/.test(value),
    hasNumber: /[0-9]/.test(value),
    hasSpecial: /[^A-Za-z0-9]/.test(value),
  };

  const required = [
    { met: checks.minLength },
    ...(field.maxLength ? [{ met: checks.maxLength }] : []),
    ...(criteria.requireUppercase ? [{ met: checks.hasUppercase }] : []),
    ...(criteria.requireLowercase ? [{ met: checks.hasLowercase }] : []),
    ...(criteria.requireNumber ? [{ met: checks.hasNumber }] : []),
    ...(criteria.requireSpecial ? [{ met: checks.hasSpecial }] : []),
  ];

  const allMet = required.every((r) => r.met);

  if (!value) return { score: 0, label: "none", allMet: false, checks };

  const variety = [
    checks.hasUppercase,
    checks.hasLowercase,
    checks.hasNumber,
    checks.hasSpecial,
  ].filter(Boolean).length;

  let score: number;
  if (value.length < 4) score = 0;
  else if (value.length < minLength) score = 1;
  else {
    score = Math.min(variety, 4);
    if (value.length >= 16) score = Math.min(score + 1, 4);
  }

  if (!allMet) score = Math.min(score, 2);

  const labels: Record<number, StrengthResult["label"]> = {
    0: "none", 1: "weak", 2: "fair", 3: "strong", 4: "excellent",
  };

  return {
    score: score as StrengthResult["score"],
    label: labels[score] ?? "none",
    allMet,
    checks,
  };
}

function generatePassword(field: PasswordFieldDef): string {
  const criteria = field.criteria ?? {};
  const minLength = Math.max(field.minLength ?? 16, 12);
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let pool = lower + upper + numbers;
  let password = "";

  if (criteria.requireUppercase) { pool += upper; password += upper[Math.floor(Math.random() * upper.length)]; }
  if (criteria.requireLowercase) { pool += lower; password += lower[Math.floor(Math.random() * lower.length)]; }
  if (criteria.requireNumber) { pool += numbers; password += numbers[Math.floor(Math.random() * numbers.length)]; }
  if (criteria.requireSpecial) { pool += special; password += special[Math.floor(Math.random() * special.length)]; }

  const remaining = Math.max(0, minLength - password.length);
  for (let i = 0; i < remaining; i++) {
    password += pool[Math.floor(Math.random() * pool.length)];
  }

  return password.split("").sort(() => 0.5 - Math.random()).join("");
}

function getStrengthBarColor(score: number, allMet: boolean): string {
  if (allMet && score >= 3) return "bg-green-500";
  if (score >= 3) return "bg-emerald-500";
  if (score === 2) return "bg-orange-500";
  return "bg-red-500";
}

function getStrengthTextColor(score: number, allMet: boolean): string {
  if (allMet && score >= 3) return "text-green-600 dark:text-green-400";
  if (score >= 3) return "text-emerald-600 dark:text-emerald-400";
  if (score === 2) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

export function PasswordField() {
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
    handleChange,
    handleBlur,
  } = useDataField<PasswordFieldDef>();

  const [visible, setVisible] = useState(false);
  const value = (fieldApi.state.value as string) ?? "";
  const ui = field.ui as PasswordUi | undefined;
  const labels = ui?.labels;
  const criteria = field.criteria;

  const width = ui?.width;
  const widthStyle = width
    ? {
        width: typeof width === "number" ? `${width}px` : width,
        flex: "0 1 auto",
      }
    : undefined;

  const strength =
    ui?.strengthIndicator || ui?.showRequirements
      ? calculateStrength(value, field)
      : null;

  const resolveRequirementLabel = <
    K extends keyof NonNullable<
      NonNullable<PasswordUi["labels"]>["requirements"]
    >,
  >(
    key: K,
    defaultLabel: React.ReactNode,
    arg?: number,
  ): React.ReactNode => {
    const override = labels?.requirements?.[key];
    if (typeof override === "function" && arg !== undefined) {
      // We know arg is a number and the only functions here take a number
      return (override as (v: number) => React.ReactNode)(arg);
    }
    return (override as React.ReactNode) ?? defaultLabel;
  };

  const requirements = ui?.showRequirements
    ? [
        {
          key: "minLength",
          label: resolveRequirementLabel(
            "minLength",
            `At least ${field.minLength ?? 8} characters`,
            field.minLength ?? 8,
          ),
          met: strength?.checks.minLength ?? false,
        },
        ...(field.maxLength
          ? [
              {
                key: "maxLength",
                label: resolveRequirementLabel(
                  "maxLength",
                  `At most ${field.maxLength} characters`,
                  field.maxLength,
                ),
                met: strength?.checks.maxLength ?? false,
              },
            ]
          : []),
        ...(criteria?.requireUppercase
          ? [
              {
                key: "uppercase",
                label: resolveRequirementLabel("uppercase", "One uppercase letter"),
                met: strength?.checks.hasUppercase ?? false,
              },
            ]
          : []),
        ...(criteria?.requireLowercase
          ? [
              {
                key: "lowercase",
                label: resolveRequirementLabel("lowercase", "One lowercase letter"),
                met: strength?.checks.hasLowercase ?? false,
              },
            ]
          : []),
        ...(criteria?.requireNumber
          ? [
              {
                key: "number",
                label: resolveRequirementLabel("number", "One number"),
                met: strength?.checks.hasNumber ?? false,
              },
            ]
          : []),
        ...(criteria?.requireSpecial
          ? [
              {
                key: "special",
                label: resolveRequirementLabel("special", "One special character"),
                met: strength?.checks.hasSpecial ?? false,
              },
            ]
          : []),
      ]
    : [];

  // pr class based on visible action buttons
  const inputPrClass = cn(
    "pr-9",
    ui?.allowGenerate && "pr-16",
    ui?.allowGenerate && ui?.copyable && "pr-24",
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
            {isRequired && ui?.asterisk !== false ? (
              <span className="text-destructive">*</span>
            ) : null}
          </FieldLabel>
        )}

        <FieldContent>
          <div className="space-y-2">
            <div className="relative flex items-center">
              <Input
                id={fieldApi.name}
                name={fieldApi.name}
                type={visible ? "text" : "password"}
                autoComplete={field.autoComplete ?? "current-password"}
                autoFocus={ui?.autoFocus}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={isDisabled}
                readOnly={isReadOnly}
                aria-invalid={isInvalid}
                aria-describedby={ariaDescribedBy}
                minLength={field.minLength}
                maxLength={field.maxLength}
                required={isRequired}
                className={inputPrClass}
              />
              <div className="absolute right-0 top-0 h-full flex items-center gap-0.5 pr-1">
                {ui?.copyable && value && (
                  <CopyButton
                    value={value}
                    disabled={isDisabled}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  />
                )}
                {ui?.allowGenerate && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      handleChange(generatePassword(field));
                    }}
                    disabled={isDisabled || isReadOnly}
                    aria-label={labels?.aria?.generate ?? "Generate password"}
                    tabIndex={-1}
                  >
                    <IconPlaceholder
                      hugeicons="MagicWand01Icon"
                      lucide="Sparkles"
                      tabler="IconWand"
                      phosphor="MagicWand"
                      remixicon="RiMagicLine"
                      className="size-3.5"
                    />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setVisible((v) => !v)}
                  disabled={isDisabled}
                  aria-label={
                    visible
                      ? (labels?.aria?.hidePassword ?? "Hide password")
                      : (labels?.aria?.showPassword ?? "Show password")
                  }
                  tabIndex={-1}
                >
                  {visible ? (
                    <IconPlaceholder
                      hugeicons="ViewOffIcon"
                      lucide="EyeOff"
                      tabler="IconEyeOff"
                      phosphor="EyeSlash"
                      remixicon="RiEyeOffLine"
                      className="size-4"
                    />
                  ) : (
                    <IconPlaceholder
                      hugeicons="ViewIcon"
                      lucide="Eye"
                      tabler="IconEye"
                      phosphor="Eye"
                      remixicon="RiEyeLine"
                      className="size-4"
                    />
                  )}
                </Button>
              </div>
            </div>

            {ui?.strengthIndicator && value && strength && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1 h-1 flex-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-full flex-1 rounded-full transition-colors",
                        i < strength.score
                          ? getStrengthBarColor(strength.score, strength.allMet)
                          : "bg-muted",
                      )}
                    />
                  ))}
                </div>
                {strength.label !== "none" && (
                  <span
                    className={cn(
                      "text-xs font-medium transition-colors",
                      getStrengthTextColor(strength.score, strength.allMet),
                    )}
                  >
                    {labels?.strength?.[strength.label] ??
                      STRENGTH_LABELS[strength.label]}
                  </span>
                )}
              </div>
            )}

            {requirements.length > 0 && (
              <div
                id={`${fieldApi.name}-requirements`}
                className="text-xs space-y-1"
                role="list"
                aria-label={
                  labels?.aria?.requirementsList ?? "Password requirements"
                }
              >
                {requirements.map((req) => (
                  <div
                    key={req.key}
                    role="listitem"
                    className={cn(
                      "flex items-center gap-1.5 transition-colors",
                      value
                        ? req.met
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {value ? (
                      req.met ? (
                        <IconPlaceholder
                          hugeicons="Tick02Icon"
                          lucide="Check"
                          tabler="IconCheck"
                          phosphor="Check"
                          remixicon="RiCheckLine"
                          className="size-3 shrink-0 text-green-500"
                        />
                      ) : (
                        <IconPlaceholder
                          hugeicons="Cancel01Icon"
                          lucide="X"
                          tabler="IconX"
                          phosphor="X"
                          remixicon="RiCloseLine"
                          className="size-3 shrink-0"
                        />
                      )
                    ) : (
                      <span className="size-3 rounded-full border border-muted-foreground/50 shrink-0" />
                    )}
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FieldContent>

        {description && !isInvalid && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {isInvalid && <FieldError id={errorId} errors={errors} />}
      </Field>
    </FieldGroup>
  );
}
