import { z } from "zod";
import type {
  Field,
  FieldType,
  ValidationContext,
  ValidationFn,
} from "../types";

// =============================================================================
// VALIDATION CONFIG EXTRACTION
// =============================================================================

type ExtractableValidationFn = (
  value: unknown,
  context: ValidationContext,
) => true | string | Promise<true | string>;

export interface ExtractedValidationConfig {
  fn?: ExtractableValidationFn;
  isLive: boolean;
  debounceMs?: number;
}

export function extractValidationConfig(
  validate?: unknown,
): ExtractedValidationConfig {
  if (!validate) {
    return { fn: undefined, isLive: false };
  }

  if (typeof validate === "function") {
    return { fn: validate as ExtractableValidationFn, isLive: false };
  }

  if (typeof validate === "object" && "fn" in validate) {
    const obj = validate as {
      fn?: unknown;
      live?: boolean | { debounceMs?: number };
    };
    const fn =
      typeof obj.fn === "function"
        ? (obj.fn as ExtractableValidationFn)
        : undefined;

    if (!obj.live) {
      return { fn, isLive: false };
    }

    const debounceMs =
      typeof obj.live === "object" ? obj.live.debounceMs : undefined;
    return { fn, isLive: true, debounceMs };
  }

  return { fn: undefined, isLive: false };
}

// =============================================================================
// FIELD VALIDATOR COLLECTION
// =============================================================================

export interface FieldValidator {
  path: string;
  fn: ValidationFn;
}

/**
 * Recursively collects all field validators from a field array.
 */
export function collectFieldValidators(
  fields: readonly Field[],
  basePath: string = "",
): FieldValidator[] {
  const validators: FieldValidator[] = [];

  for (const field of fields) {
    if ("name" in field && field.name) {
      const fieldPath = basePath ? `${basePath}.${field.name}` : field.name;

      if ("validate" in field && field.validate) {
        const config = extractValidationConfig(field.validate);
        if (config.fn) {
          validators.push({
            path: fieldPath,
            fn: config.fn as ValidationFn,
          });
        }
      }

      if (field.type === "group" && "fields" in field) {
        validators.push(...collectFieldValidators(field.fields, fieldPath));
      }
    }

    // Layout fields pass through without adding to path
    if (field.type === "row" && "fields" in field) {
      validators.push(...collectFieldValidators(field.fields, basePath));
    }
    if (field.type === "collapsible" && "fields" in field) {
      validators.push(...collectFieldValidators(field.fields, basePath));
    }
    if (field.type === "tabs" && "tabs" in field) {
      for (const tab of field.tabs) {
        const tabPath = tab.name
          ? basePath
            ? `${basePath}.${tab.name}`
            : tab.name
          : basePath;
        validators.push(...collectFieldValidators(tab.fields, tabPath));
      }
    }
  }

  return validators;
}

// =============================================================================
// SIBLING DATA EXTRACTION
// =============================================================================

/**
 * Gets the parent object containing the field at the given path.
 */
export function getSiblingData(
  data: Record<string, unknown>,
  path: string,
): Record<string, unknown> {
  const parts = path.split(".");

  if (parts.length <= 1) {
    return data;
  }

  const parentParts = parts.slice(0, -1);
  let current: unknown = data;

  for (const part of parentParts) {
    if (current && typeof current === "object" && current !== null) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return {};
    }
  }

  if (current && typeof current === "object" && current !== null) {
    return current as Record<string, unknown>;
  }

  return {};
}

/**
 * Gets a value at a dot-notation path.
 */
export function getValueByPath(
  data: Record<string, unknown>,
  path: string,
): unknown {
  const parts = path.split(".");
  let current: unknown = data;

  for (const part of parts) {
    if (current && typeof current === "object" && current !== null) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Creates a superRefine that runs all field validators with full form context.
 */
export function createRootValidationRefinement(
  validators: FieldValidator[],
): (data: Record<string, unknown>, ctx: z.RefinementCtx) => Promise<void> {
  return async (data, ctx) => {
    const validationPromises = validators.map(async ({ path, fn }) => {
      const value = getValueByPath(data, path);
      const siblingData = getSiblingData(data, path);

      try {
        const result = await fn(value, {
          data,
          siblingData,
          path: path.split("."),
        });

        if (result !== true) {
          ctx.addIssue({
            code: "custom",
            path: path.split("."),
            message: typeof result === "string" ? result : "Validation failed",
          });
        }
      } catch (error) {
        ctx.addIssue({
          code: "custom",
          path: path.split("."),
          message: error instanceof Error ? error.message : "Validation error",
        });
      }
    });

    await Promise.all(validationPromises);
  };
}

// =============================================================================
// OPTIONAL HANDLING
// =============================================================================

export function makeOptional(
  schema: z.ZodTypeAny,
  fieldType: FieldType,
): z.ZodTypeAny {
  switch (fieldType) {
    case "text":
    case "textarea":
    case "email":
    case "password":
      return schema.optional().or(z.literal(""));

    case "number":
    case "date":
    case "select":
    case "radio":
      return schema.optional().nullable();

    case "checkbox":
    case "switch":
      return schema;

    case "checkbox-group":
      return schema.optional().default([]);

    case "tags":
    case "array":
      return schema.optional().default([]);

    case "upload":
      return schema.optional().nullable();

    default:
      return schema.optional();
  }
}

// =============================================================================
// COERCION HELPERS
// =============================================================================

export function coerceToNumber(val: unknown): number | undefined {
  if (val === "" || val === null || val === undefined) {
    return undefined;
  }
  const num = Number(val);
  return isNaN(num) ? undefined : num;
}

export function coerceToDate(val: unknown): Date | undefined {
  if (val === "" || val === null || val === undefined) {
    return undefined;
  }
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? undefined : val;
  }
  if (typeof val === "string" || typeof val === "number") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

// =============================================================================
// PATTERN VALIDATION
// =============================================================================

const PATTERN_MESSAGES: Record<string, string> = {
  "^[a-zA-Z0-9_]+$": "Only letters, numbers, and underscores allowed",
  "^[a-z0-9-]+$": "Only lowercase letters, numbers, and hyphens allowed",
  "^\\S+@\\S+\\.\\S+$": "Invalid email format",
  "^https?://": "Must start with http:// or https://",
};

export function getPatternErrorMessage(pattern: string | RegExp): string {
  const patternStr = typeof pattern === "string" ? pattern : pattern.source;
  return PATTERN_MESSAGES[patternStr] || `Must match pattern: ${patternStr}`;
}

// =============================================================================
// FILE VALIDATION HELPERS
// =============================================================================

export function isFileLike(value: unknown): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "size" in value &&
    "type" in value
  );
}

export function isFileTypeAccepted(file: File, accept: string): boolean {
  if (accept === "*" || !accept) return true;

  const acceptTypes = accept.split(",").map((t) => t.trim().toLowerCase());
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  return acceptTypes.some((acceptType) => {
    if (acceptType.endsWith("/*")) {
      const category = acceptType.replace("/*", "");
      return fileType.startsWith(category + "/");
    }
    if (acceptType.startsWith(".")) {
      return fileName.endsWith(acceptType);
    }
    return fileType === acceptType;
  });
}
