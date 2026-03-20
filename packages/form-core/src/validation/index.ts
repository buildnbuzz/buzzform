import type {
  Field,
  DataField,
  ValidationCheck,
  ValidationConfig,
  ValidationGroup,
  ValidatorArgsMap,
} from "../types";
import { resolveDynamicValue } from "../dynamic";
import { evaluateVisibility } from "../conditions";
import { escapePointer, getByPath } from "../utils/path";

// ============================================================================
// 1. VALIDATOR REGISTRY
// ============================================================================

type ValidatorReturn = boolean | Promise<boolean>;

export type ValidationFunction<
  TValue = unknown,
  TArgs = Record<string, unknown>,
> = (value: TValue, args?: TArgs, ctx?: ValidationContext) => ValidatorReturn;

export type ValidationRegistry = Record<
  string,
  (...args: never[]) => ValidatorReturn
>;

export function defineValidators<const T extends ValidationRegistry>(
  validators: T,
): T {
  return validators;
}

// ============================================================================
// 2. BUILT-IN VALIDATORS (v0.1)
// ============================================================================

const getNumberArg = (
  args: Record<string, unknown> | undefined,
  keys: string[],
): number | undefined => {
  for (const key of keys) {
    const value = args?.[key];
    if (typeof value === "number") return value;
  }
  return undefined;
};

const lengthOf = (value: unknown): number | null => {
  if (typeof value === "string") return value.length;
  if (Array.isArray(value)) return value.length;
  return null;
};

const minLengthLike = (
  value: unknown,
  args: Record<string, unknown> | undefined,
  keys: string[],
): boolean => {
  const min = getNumberArg(args, keys);
  if (min === undefined) return true;
  const len = lengthOf(value);
  if (len === null) return false;
  return len >= min;
};

const maxLengthLike = (
  value: unknown,
  args: Record<string, unknown> | undefined,
  keys: string[],
): boolean => {
  const max = getNumberArg(args, keys);
  if (max === undefined) return true;
  const len = lengthOf(value);
  if (len === null) return false;
  return len <= max;
};

const numberRange = (
  value: unknown,
  args: Record<string, unknown> | undefined,
  key: "min" | "max",
): boolean => {
  if (typeof value !== "number" || Number.isNaN(value)) return false;
  const bound = getNumberArg(args, [key]);
  if (bound === undefined) return true;
  return key === "min" ? value >= bound : value <= bound;
};

const requiredValidator: ValidationFunction = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const builtInValidators = {
  required: requiredValidator,

  minLength: (value: unknown, args?: ValidatorArgsMap["minLength"]) => {
    return minLengthLike(value, args as Record<string, unknown> | undefined, [
      "min",
      "minLength",
    ]);
  },

  maxLength: (value: unknown, args?: ValidatorArgsMap["maxLength"]) => {
    return maxLengthLike(value, args as Record<string, unknown> | undefined, [
      "max",
      "maxLength",
    ]);
  },

  pattern: (value: unknown, args?: ValidatorArgsMap["pattern"]) => {
    if (typeof value !== "string") return false;
    const pattern = args?.pattern;
    if (pattern === undefined) return true;

    const regex = new RegExp(pattern);

    return regex.test(value);
  },

  min: (value: unknown, args?: ValidatorArgsMap["min"]) => {
    return numberRange(value, args as Record<string, unknown> | undefined, "min");
  },

  max: (value: unknown, args?: ValidatorArgsMap["max"]) => {
    return numberRange(value, args as Record<string, unknown> | undefined, "max");
  },

  minItems: (value: unknown, args?: ValidatorArgsMap["minItems"]) => {
    return minLengthLike(value, args as Record<string, unknown> | undefined, [
      "min",
      "minItems",
    ]);
  },

  maxItems: (value: unknown, args?: ValidatorArgsMap["maxItems"]) => {
    return maxLengthLike(value, args as Record<string, unknown> | undefined, [
      "max",
      "maxItems",
    ]);
  },

  minSelected: (value: unknown, args?: ValidatorArgsMap["minSelected"]) => {
    return minLengthLike(value, args as Record<string, unknown> | undefined, [
      "min",
      "minSelected",
    ]);
  },

  maxSelected: (value: unknown, args?: ValidatorArgsMap["maxSelected"]) => {
    return maxLengthLike(value, args as Record<string, unknown> | undefined, [
      "max",
      "maxSelected",
    ]);
  },
};

// ============================================================================
// 3. VALIDATION RUNNER
// ============================================================================

export interface ValidationContext {
  formData: Record<string, unknown>;
  contextData?: Record<string, unknown>;
}

export type ValidationRun = "change" | "blur" | "submit";

/** Result of a schema validation run. */
export interface ValidationResult {
  /** True when no errors were found. */
  valid: boolean;
  /** Error messages keyed by JSON Pointer path. */
  errorsByPath: Record<string, string>;
}

/** Options for validating a field schema. */
export interface ValidateFieldsOptions {
  /** Which validation group to run (defaults to submit). */
  run?: ValidationRun;
  /** When to include derived checks (defaults to blur). */
  derivedRun?: ValidationRun;
  /** Optional external context data. */
  contextData?: Record<string, unknown>;
  /** Custom validators registry. */
  validators?: ValidationRegistry;
  /** Whether to include built-in derived checks. */
  includeDerived?: boolean;
}

export function shouldSkipCheck(check: ValidationCheck, value: unknown): boolean {
  const isEmpty = value === undefined || value === null || value === "";
  if (!isEmpty) return false;
  return check.type !== "required";
}

export function getValidationGroup(
  config: ValidationConfig | undefined,
  run: ValidationRun,
): ValidationGroup | undefined {
  if (!config) return undefined;
  if (run === "change") return config.onChange;
  if (run === "blur") return config.onBlur;
  return config.onSubmit;
}

export function collectValidationChecks(
  config: ValidationConfig | undefined,
): ValidationCheck[] {
  if (!config) return [];
  return [
    ...(config.onChange?.checks ?? []),
    ...(config.onBlur?.checks ?? []),
    ...(config.onSubmit?.checks ?? []),
  ];
}

export function collectFieldValidationChecks(
  field: Field,
  run: ValidationRun,
  options?: { includeDerived?: boolean },
): ValidationCheck[] {
  if (!hasFieldName(field)) return [];
  const group = getValidationGroup(field.validate, run);
  const userChecks = group?.checks ?? [];

  if (!options?.includeDerived) return userChecks;

  const derived = deriveFieldChecks(field);
  const userTypes = new Set(userChecks.map((check) => check.type));
  const merged = [...userChecks];
  for (const check of derived) {
    if (!userTypes.has(check.type)) merged.push(check);
  }

  return merged;
}

function joinPointer(base: string, name: string): string {
  const segment = escapePointer(name);
  return base ? `${base}/${segment}` : `/${segment}`;
}

/**
 * Validate a field schema against form data.
 */
export async function validateFields(
  fields: readonly Field[],
  formData: Record<string, unknown>,
  options?: ValidateFieldsOptions,
): Promise<ValidationResult> {
  const errorsByPath: Record<string, string> = {};
  const run = options?.run ?? "submit";
  const derivedRun = options?.derivedRun ?? "blur";
  const includeDerived = options?.includeDerived ?? derivedRun === run;
  const ctx: ValidationContext = {
    formData,
    contextData: options?.contextData,
  };

  const visit = async (field: Field, basePath: string): Promise<void> => {
    if (!evaluateVisibility(field.condition, ctx)) return;

    if (hasFieldName(field)) {
      const fieldPath = joinPointer(basePath, field.name);
      const checks = collectFieldValidationChecks(field, run, {
        includeDerived,
      });

      if (checks.length > 0) {
        const value = getByPath(formData, fieldPath);
        const message = await runChecks(
          checks,
          value,
          ctx,
          options?.validators,
        );
        if (message) errorsByPath[fieldPath] = message;
      }

      if (field.type === "group") {
        for (const child of field.fields) {
          await visit(child, fieldPath);
        }
        return;
      }

      if (field.type === "array") {
        const value = getByPath(formData, fieldPath);
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i += 1) {
            const itemPath = `${fieldPath}/${i}`;
            for (const child of field.fields) {
              await visit(child, itemPath);
            }
          }
        }
        return;
      }

      return;
    }

    switch (field.type) {
      case "row":
      case "collapsible": {
        for (const child of field.fields) {
          await visit(child, basePath);
        }
        break;
      }

      case "tabs": {
        for (const tab of field.tabs) {
          for (const child of tab.fields) {
            await visit(child, basePath);
          }
        }
        break;
      }

      default:
        break;
    }
  };

  for (const field of fields) {
    await visit(field, "");
  }

  return {
    valid: Object.keys(errorsByPath).length === 0,
    errorsByPath,
  };
}

export async function runChecks(
  checks: ValidationCheck[],
  value: unknown,
  ctx: ValidationContext,
  customValidators?: ValidationRegistry,
): Promise<string | undefined> {
  for (const check of checks) {
    if (shouldSkipCheck(check, value)) continue;

    const result = await runValidationCheck(
      check,
      value,
      ctx,
      customValidators,
    );

    if (!result.isValid) return result.message;
  }

  return undefined;
}

export function runValidationCheck(
  check: ValidationCheck,
  value: unknown,
  ctx: ValidationContext,
  customValidators?: ValidationRegistry,
):
  | { isValid: boolean; message: string }
  | Promise<{ isValid: boolean; message: string }> {
  const builtInRegistry = builtInValidators as ValidationRegistry;
  const validatorFn =
    (customValidators?.[check.type] as ValidationFunction | undefined) ||
    (builtInRegistry[check.type] as ValidationFunction | undefined);

  if (!validatorFn) {
    console.warn(`Warning: Unknown validation rule '${check.type}'`);
    return { isValid: true, message: "" };
  }

  const resolvedArgs: Record<string, unknown> = {};
  if (check.args) {
    for (const [key, argValue] of Object.entries(check.args)) {
      resolvedArgs[key] = resolveDynamicValue(
        argValue,
        ctx.formData,
        ctx.contextData,
      );
    }
  }

  const result = validatorFn(value, resolvedArgs, ctx);
  if (result instanceof Promise) {
    return result.then((isValid) => ({
      isValid,
      message: isValid ? "" : check.message,
    }));
  }

  return {
    isValid: result,
    message: result ? "" : check.message,
  };
}

// ============================================================================
// 4. DERIVED CHECKS
// ============================================================================

export function deriveFieldChecks(field: Field): ValidationCheck[] {
  if (!hasFieldName(field)) return [];
  const checks: ValidationCheck[] = [];

  if (field.required === true) {
    checks.push({
      type: "required",
      message: "This field is required.",
    });
  }

  if (field.type === "text" || field.type === "textarea") {
    if (typeof field.minLength === "number") {
      checks.push({
        type: "minLength",
        message: `Must be at least ${field.minLength} characters.`,
        args: { min: field.minLength },
      });
    }
    if (typeof field.maxLength === "number") {
      checks.push({
        type: "maxLength",
        message: `Must be at most ${field.maxLength} characters.`,
        args: { max: field.maxLength },
      });
    }
    if (field.pattern !== undefined) {
      checks.push({
        type: "pattern",
        message: "Invalid format.",
        args: { pattern: field.pattern },
      });
    }
  }

  if (field.type === "number") {
    if (typeof field.min === "number") {
      checks.push({
        type: "min",
        message: `Must be at least ${field.min}.`,
        args: { min: field.min },
      });
    }
    if (typeof field.max === "number") {
      checks.push({
        type: "max",
        message: `Must be at most ${field.max}.`,
        args: { max: field.max },
      });
    }
  }

  if (field.type === "array") {
    if (typeof field.minItems === "number") {
      checks.push({
        type: "minItems",
        message: `Select at least ${field.minItems}.`,
        args: { min: field.minItems },
      });
    }
    if (typeof field.maxItems === "number") {
      checks.push({
        type: "maxItems",
        message: `Select at most ${field.maxItems}.`,
        args: { max: field.maxItems },
      });
    }
  }

  return checks;
}

function hasFieldName(field: Field): field is DataField {
  return "name" in field && typeof field.name === "string";
}
