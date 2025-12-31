import { z } from 'zod';
import type { Field, FieldType, ValidationContext } from '../types';

// =============================================================================
// VALIDATION CONFIG EXTRACTION
// =============================================================================

/**
 * A validation function that can be extracted from a field.
 */
type ExtractableValidationFn = (
    value: unknown,
    context: ValidationContext
) => true | string | Promise<true | string>;

export interface ExtractedValidationConfig {
    /** The validation function (if any) */
    fn?: ExtractableValidationFn;
    /** Whether this is a live validation */
    isLive: boolean;
    /** Debounce milliseconds for live validation */
    debounceMs?: number;
}

/**
 * Extracts validation function and config from the unified validate property.
 */
export function extractValidationConfig(
    validate?: unknown
): ExtractedValidationConfig {
    if (!validate) {
        return { fn: undefined, isLive: false };
    }

    // Simple function case
    if (typeof validate === 'function') {
        return { fn: validate as ExtractableValidationFn, isLive: false };
    }

    // Object case with potential live config
    if (typeof validate === 'object' && 'fn' in validate) {
        const obj = validate as { fn?: unknown; live?: boolean | { debounceMs?: number } };
        const fn = typeof obj.fn === 'function' ? obj.fn as ExtractableValidationFn : undefined;

        if (!obj.live) {
            return { fn, isLive: false };
        }

        const debounceMs = typeof obj.live === 'object' ? obj.live.debounceMs : undefined;
        return { fn, isLive: true, debounceMs };
    }

    return { fn: undefined, isLive: false };
}

// =============================================================================
// CUSTOM VALIDATION WRAPPER
// =============================================================================

/**
 * Applies custom validation from field.validate to a Zod schema.
 * Standardizes the pattern across all field types.
 */
export function applyCustomValidation(
    schema: z.ZodTypeAny,
    field: Field,
    fieldPath: string = ''
): z.ZodTypeAny {
    // Only data fields have validate
    if (!('validate' in field)) {
        return schema;
    }

    const fieldWithValidate = field as { validate?: unknown };
    if (!fieldWithValidate.validate) {
        return schema;
    }

    const config = extractValidationConfig(fieldWithValidate.validate);
    if (!config.fn) {
        return schema;
    }

    return schema.superRefine(async (val, ctx) => {
        const result = await config.fn!(val, {
            data: {},
            siblingData: {},
            path: fieldPath.split('.'),
        });

        if (result !== true) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: typeof result === 'string' ? result : 'Validation failed',
            });
        }
    });
}

// =============================================================================
// OPTIONAL HANDLING
// =============================================================================

/**
 * Makes a schema optional based on field type.
 * Different field types have different "empty" representations.
 */
export function makeOptional(
    schema: z.ZodTypeAny,
    fieldType: FieldType
): z.ZodTypeAny {
    switch (fieldType) {
        // String types: allow empty string
        case 'text':
        case 'textarea':
        case 'email':
        case 'password':
            return schema.optional().or(z.literal(''));

        // Nullable types
        case 'number':
        case 'date':
        case 'select':
        case 'radio':
            return schema.optional().nullable();

        // Boolean types: always have a value
        case 'checkbox':
        case 'switch':
            return schema; // Booleans are never "optional" in the traditional sense

        // Array types
        case 'tags':
        case 'array':
            return schema.optional().default([]);

        // Upload
        case 'upload':
            return schema.optional().nullable();

        // Default
        default:
            return schema.optional();
    }
}

// =============================================================================
// COERCION HELPERS
// =============================================================================

/**
 * Coerces a value to a number.
 * Empty/null/undefined → undefined, otherwise Number().
 */
export function coerceToNumber(val: unknown): number | undefined {
    if (val === '' || val === null || val === undefined) {
        return undefined;
    }
    const num = Number(val);
    return isNaN(num) ? undefined : num;
}

/**
 * Coerces a value to a Date.
 * Handles strings, numbers, and Date objects.
 */
export function coerceToDate(val: unknown): Date | undefined {
    if (val === '' || val === null || val === undefined) {
        return undefined;
    }
    if (val instanceof Date) {
        return isNaN(val.getTime()) ? undefined : val;
    }
    if (typeof val === 'string' || typeof val === 'number') {
        const d = new Date(val);
        return isNaN(d.getTime()) ? undefined : d;
    }
    return undefined;
}

// =============================================================================
// PATTERN VALIDATION
// =============================================================================

/**
 * Common regex patterns with their error messages.
 */
const PATTERN_MESSAGES: Record<string, string> = {
    '^[a-zA-Z0-9_]+$': 'Only letters, numbers, and underscores allowed',
    '^[a-z0-9-]+$': 'Only lowercase letters, numbers, and hyphens allowed',
    '^\\S+@\\S+\\.\\S+$': 'Invalid email format',
    '^https?://': 'Must start with http:// or https://',
};

/**
 * Gets a human-readable error message for a regex pattern.
 */
export function getPatternErrorMessage(pattern: string | RegExp): string {
    const patternStr = typeof pattern === 'string' ? pattern : pattern.source;
    return PATTERN_MESSAGES[patternStr] || `Must match pattern: ${patternStr}`;
}

// =============================================================================
// FILE VALIDATION HELPERS
// =============================================================================

/**
 * Checks if a value is a File-like object.
 */
export function isFileLike(value: unknown): value is File {
    return (
        typeof value === 'object' &&
        value !== null &&
        'name' in value &&
        'size' in value &&
        'type' in value
    );
}

/**
 * Validates file type against accept pattern.
 */
export function isFileTypeAccepted(
    file: File,
    accept: string
): boolean {
    if (accept === '*' || !accept) return true;

    const acceptTypes = accept.split(',').map(t => t.trim().toLowerCase());
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    return acceptTypes.some(acceptType => {
        // Wildcard: "image/*"
        if (acceptType.endsWith('/*')) {
            const category = acceptType.replace('/*', '');
            return fileType.startsWith(category + '/');
        }
        // Extension: ".pdf"
        if (acceptType.startsWith('.')) {
            return fileName.endsWith(acceptType);
        }
        // Exact MIME type
        return fileType === acceptType;
    });
}
