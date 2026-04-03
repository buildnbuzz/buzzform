import type {
  Field,
  DataField,
  FormSchema,
  ValidationCheck,
  ValidationConfig,
  ValidationGroup,
  ValidatorArgsMap,
} from "../types";
import { resolveDynamicValue } from "../dynamic";
import { evaluateVisibility } from "../conditions";
import { escapePointer, getByPath, splitPointer } from "../utils/path";
import { walkFields } from "../utils/walk";

// ============================================================================
// 1. VALIDATOR REGISTRY
// ============================================================================

type ValidatorReturn = boolean | Promise<boolean>;

/** Validator function signature. */
export type ValidationFunction<
  TValue = unknown,
  TArgs = Record<string, unknown>,
> = (value: TValue, args?: TArgs, ctx?: ValidationContext) => ValidatorReturn;

/** Validator registry shape used by adapters. */
export type ValidationRegistry = Record<
  string,
  (...args: never[]) => ValidatorReturn
>;

/** Preserve validator map literal types. */
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
  if (value === null || value === undefined || value === false) return false;
  if (typeof value === "string") return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/** Built-in validators shipped with form-core. */
export const builtInValidators = {
  required: requiredValidator,

  email: (value: unknown) => {
    if (typeof value !== "string") return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

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
    return numberRange(
      value,
      args as Record<string, unknown> | undefined,
      "min",
    );
  },

  max: (value: unknown, args?: ValidatorArgsMap["max"]) => {
    return numberRange(
      value,
      args as Record<string, unknown> | undefined,
      "max",
    );
  },

  precision: (value: unknown, args?: ValidatorArgsMap["precision"]) => {
    if (typeof value !== "number" || Number.isNaN(value)) return false;
    const precision = getNumberArg(
      args as Record<string, unknown> | undefined,
      ["precision"],
    );
    if (precision === undefined) return true;
    if (precision === 0) return Number.isInteger(value);

    const factor = 10 ** precision;
    if (!Number.isFinite(factor)) return false;
    const scaled = value * factor;
    if (!Number.isFinite(scaled)) return false;
    const rounded = Math.round(scaled);
    const epsilon = Number.EPSILON * Math.max(1, Math.abs(scaled));
    return Math.abs(rounded - scaled) <= epsilon;
  },

  step: (value: unknown, args?: ValidatorArgsMap["step"]) => {
    if (typeof value !== "number" || Number.isNaN(value)) return false;
    const step = getNumberArg(args as Record<string, unknown> | undefined, [
      "step",
    ]);
    if (step === undefined) return true;
    if (step === 0) return false;

    const ratio = value / step;
    if (!Number.isFinite(ratio)) return false;
    const rounded = Math.round(ratio);
    const epsilon = Number.EPSILON * Math.max(1, Math.abs(ratio));
    return Math.abs(rounded - ratio) <= epsilon;
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

  matches: (value: unknown, args?: ValidatorArgsMap["matches"]) => {
    return value === args?.other;
  },

  minDate: (value: unknown, args?: ValidatorArgsMap["minDate"]) => {
    if (typeof value !== "string" || !value) return true;
    const min = args?.min;
    if (!min) return true;
    return new Date(value) >= new Date(min);
  },

  maxDate: (value: unknown, args?: ValidatorArgsMap["maxDate"]) => {
    if (typeof value !== "string" || !value) return true;
    const max = args?.max;
    if (!max) return true;
    return new Date(value) <= new Date(max);
  },

  minTags: (value: unknown, args?: ValidatorArgsMap["minTags"]) => {
    return minLengthLike(value, args as Record<string, unknown> | undefined, [
      "min",
      "minTags",
    ]);
  },

  maxTags: (value: unknown, args?: ValidatorArgsMap["maxTags"]) => {
    return maxLengthLike(value, args as Record<string, unknown> | undefined, [
      "max",
      "maxTags",
    ]);
  },

  passwordCriteria: (
    value: unknown,
    args?: ValidatorArgsMap["passwordCriteria"],
  ) => {
    if (typeof value !== "string") return false;
    if (args?.requireUppercase && !/[A-Z]/.test(value)) return false;
    if (args?.requireLowercase && !/[a-z]/.test(value)) return false;
    if (args?.requireNumber && !/[0-9]/.test(value)) return false;
    if (args?.requireSpecial && !/[^A-Za-z0-9]/.test(value)) return false;
    return true;
  },
};

// ============================================================================
// 3. VALIDATION RUNNER
// ============================================================================

/** Runtime context passed to validators. */
export interface ValidationContext {
  formData: Record<string, unknown>;
  contextData?: Record<string, unknown>;
}

/** Validation run trigger. */
export type ValidationRun = "change" | "blur" | "submit";

/** Result of a schema validation run. */
export interface ValidationResult {
  /** True when no errors were found. */
  valid: boolean;
  /** Error messages keyed by JSON Pointer path. */
  errorsByPath: Record<string, string>;
}

/** JSON Pointer key for form-level errors. */
export const FORM_ERROR_PATH = "";

/** Result of a single-field validation run. */
export interface FieldValidationResult {
  /** True when no error was found. */
  valid: boolean;
  /** Error message for the field, when invalid. */
  error?: string;
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

/** Determine if a check should be skipped for the provided value. */
export function shouldSkipCheck(
  check: ValidationCheck,
  value: unknown,
): boolean {
  const isEmpty = value === undefined || value === null || value === "";
  if (!isEmpty) return false;
  return check.type !== "required";
}

/** Select the validation group for a trigger. */
export function getValidationGroup(
  config: ValidationConfig | undefined,
  run: ValidationRun,
): ValidationGroup | undefined {
  if (!config) return undefined;
  if (run === "change") return config.onChange;
  if (run === "blur") return config.onBlur;
  return config.onSubmit;
}

/** Collect checks for all validation groups. */
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

/** Collect checks for a field and run group. */
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

/**
 * Validate a single field against form data.
 */
/** Validate a single field against form data. */
export async function validateField(
  field: Field,
  path: string,
  formData: Record<string, unknown>,
  options?: ValidateFieldsOptions,
): Promise<FieldValidationResult> {
  const run = options?.run ?? "submit";
  const derivedRun = options?.derivedRun ?? "submit";
  const includeDerived = options?.includeDerived ?? derivedRun === run;
  const ctx: ValidationContext = {
    formData,
    contextData: options?.contextData,
  };

  if (!evaluateVisibility(field.condition, ctx)) {
    return { valid: true };
  }

  if (!hasFieldName(field)) {
    return { valid: true };
  }

  const checks = collectFieldValidationChecks(field, run, {
    includeDerived,
  });

  if (checks.length === 0) return { valid: true };

  const value = getByPath(formData, path);
  const message = await runChecks(checks, value, ctx, options?.validators);

  if (message) return { valid: false, error: message };
  return { valid: true };
}

function joinPointer(base: string, name: string): string {
  const segment = escapePointer(name);
  return base ? `${base}/${segment}` : `/${segment}`;
}

function isRuntimeArrayIndex(segment: string): boolean {
  if (segment.trim() === "") return false;
  const index = Number(segment);
  return Number.isInteger(index) && index >= 0;
}

function matchesSchemaPath(schemaPath: string, runtimePath: string): boolean {
  const schemaSegments = splitPointer(schemaPath);
  const runtimeSegments = splitPointer(runtimePath);

  if (schemaSegments.length !== runtimeSegments.length) return false;

  return schemaSegments.every((segment, index) => {
    if (segment === "*") {
      return isRuntimeArrayIndex(runtimeSegments[index] ?? "");
    }
    return segment === runtimeSegments[index];
  });
}

function findFieldByPath(
  fields: readonly Field[],
  path: string,
  ctx: ValidationContext,
): Field | undefined {
  let match: Field | undefined;

  walkFields(fields, (field, walkCtx) => {
    if (match || !hasFieldName(field)) return;

    const allConditionsPass = [...walkCtx.parents, field].every((candidate) =>
      evaluateVisibility(candidate.condition, ctx),
    );
    if (!allConditionsPass) return;

    if (matchesSchemaPath(joinPointer(walkCtx.path, field.name), path)) {
      match = field;
    }
  });

  return match;
}

/**
 * Validate a single field located by JSON Pointer path.
 */
export async function validatePath(
  fields: readonly Field[],
  path: string,
  formData: Record<string, unknown>,
  options?: ValidateFieldsOptions,
): Promise<FieldValidationResult> {
  const ctx: ValidationContext = {
    formData,
    contextData: options?.contextData,
  };
  if (path === "" || !path.startsWith("/")) return { valid: true };

  const field = findFieldByPath(fields, path, ctx);
  if (!field) return { valid: true };

  return validateField(field, path, formData, options);
}

/**
 * Validate a full schema, including form-level checks.
 */
export async function validateSchema(
  schema: FormSchema,
  formData: Record<string, unknown>,
  options?: ValidateFieldsOptions,
): Promise<ValidationResult> {
  const result = await validateFields(schema.fields, formData, options);

  const run = options?.run ?? "submit";
  const ctx: ValidationContext = {
    formData,
    contextData: options?.contextData,
  };

  const group = getValidationGroup(schema.validate, run);
  const checks = group?.checks ?? [];
  if (checks.length > 0) {
    const message = await runChecks(checks, formData, ctx, options?.validators);
    if (message) result.errorsByPath[FORM_ERROR_PATH] = message;
  }

  return {
    valid: Object.keys(result.errorsByPath).length === 0,
    errorsByPath: result.errorsByPath,
  };
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
  const derivedRun = options?.derivedRun ?? "submit";
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

/** Run a list of checks and return the first error message. */
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

/** Run a single validation check and return its result. */
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

/** Derive built-in checks from field configuration. */
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
    if (field.pattern !== undefined) {
      checks.push({
        type: "pattern",
        message: "Invalid format.",
        args: { pattern: field.pattern },
      });
    }
  }

  if (field.type === "email") {
    checks.push({
      type: "email",
      message: "Must be a valid email address.",
    });
  }

  if (field.type === "password" && field.criteria) {
    checks.push({
      type: "passwordCriteria",
      message: "Password does not meet the requirements.",
      args: field.criteria,
    });
  }

  if ("minLength" in field && typeof field.minLength === "number") {
    checks.push({
      type: "minLength",
      message: `Must be at least ${field.minLength} characters.`,
      args: { min: field.minLength },
    });
  }
  if ("maxLength" in field && typeof field.maxLength === "number") {
    checks.push({
      type: "maxLength",
      message: `Must be at most ${field.maxLength} characters.`,
      args: { max: field.maxLength },
    });
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
    if (typeof field.precision === "number") {
      checks.push({
        type: "precision",
        message:
          field.precision === 0
            ? "Must be an integer."
            : `Must have at most ${field.precision} decimal places.`,
        args: { precision: field.precision },
      });
    }
    if (typeof field.step === "number") {
      checks.push({
        type: "step",
        message: `Must be a multiple of ${field.step}.`,
        args: { step: field.step },
      });
    }
  }

  if (field.type === "tags") {
    if (typeof field.minTags === "number") {
      checks.push({
        type: "minTags",
        message: `Add at least ${field.minTags} tag${field.minTags === 1 ? "" : "s"}.`,
        args: { min: field.minTags },
      });
    }
    if (typeof field.maxTags === "number") {
      checks.push({
        type: "maxTags",
        message: `Add at most ${field.maxTags} tag${field.maxTags === 1 ? "" : "s"}.`,
        args: { max: field.maxTags },
      });
    }
  }

  if (field.type === "date") {
    if (field.minDate) {
      checks.push({
        type: "minDate",
        message: `Date must be on or after ${field.minDate}.`,
        args: { min: field.minDate },
      });
    }
    if (field.maxDate) {
      checks.push({
        type: "maxDate",
        message: `Date must be on or before ${field.maxDate}.`,
        args: { max: field.maxDate },
      });
    }
  }

  if (field.type === "array") {
    if (typeof field.minItems === "number") {
      checks.push({
        type: "minItems",
        message: `Add at least ${field.minItems} ${field.minItems === 1 ? "item" : "items"}.`,
        args: { min: field.minItems },
      });
    }
    if (typeof field.maxItems === "number") {
      checks.push({
        type: "maxItems",
        message: `Cannot exceed ${field.maxItems} ${field.maxItems === 1 ? "item" : "items"}.`,
        args: { max: field.maxItems },
      });
    }
  }

  return checks;
}

function hasFieldName(field: Field): field is DataField {
  return "name" in field && typeof field.name === "string";
}
