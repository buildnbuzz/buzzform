import { z } from 'zod';
import type { UploadField } from '../../types';
import { isFileLike, isFileTypeAccepted } from '../helpers';

/**
 * Validates a single file against field constraints.
 */
function validateSingleFile(
    value: unknown,
    field: UploadField
): { valid: boolean; message?: string } {
    // Allow null/undefined for non-required fields
    if (value === null || value === undefined || value === '') {
        return { valid: true };
    }

    // Allow string URLs (for existing uploads)
    if (typeof value === 'string') {
        return { valid: true };
    }

    // Must be a File-like object
    if (!isFileLike(value)) {
        return { valid: false, message: 'Invalid file' };
    }

    // Validate max size
    if (field.maxSize && value.size > field.maxSize) {
        const sizeMB = (field.maxSize / 1024 / 1024).toFixed(1);
        return {
            valid: false,
            message: `File must be smaller than ${sizeMB}MB`,
        };
    }

    // Validate file type (accept attribute)
    const accept = field.ui?.accept;
    if (accept && accept !== '*') {
        if (!isFileTypeAccepted(value, accept)) {
            return {
                valid: false,
                message: `File type not allowed. Accepted: ${accept}`,
            };
        }
    }

    return { valid: true };
}

/**
 * Creates Zod schema for upload fields.
 * Supports both single file and hasMany (array) modes.
 */
export function createUploadFieldSchema(field: UploadField): z.ZodTypeAny {
    if (field.hasMany) {
        // Array mode
        const schema = z.array(z.any()).superRefine((files, ctx) => {
            // Validate each file
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const result = validateSingleFile(file, field);
                if (!result.valid) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: result.message || 'Invalid file',
                        path: [i],
                    });
                }
            }

            // Validate required
            if (field.required) {
                const validFiles = files.filter(f => f !== null && f !== undefined);
                if (validFiles.length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'At least one file is required',
                    });
                }
            }

            // Validate minFiles
            if (field.minFiles !== undefined && field.minFiles > 0) {
                const validFiles = files.filter(f => f !== null && f !== undefined);
                if (validFiles.length < field.minFiles) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `At least ${field.minFiles} file(s) required`,
                    });
                }
            }

            // Validate maxFiles
            if (field.maxFiles !== undefined) {
                const validFiles = files.filter(f => f !== null && f !== undefined);
                if (validFiles.length > field.maxFiles) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Maximum ${field.maxFiles} file(s) allowed`,
                    });
                }
            }
        });

        if (!field.required) {
            return schema.optional().default([]);
        }
        return schema;
    }

    // Single file mode
    const schema = z.any().superRefine((value, ctx) => {
        // Handle required
        if (field.required && (value === null || value === undefined || value === '')) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'File is required',
            });
            return;
        }

        // Skip further validation for empty non-required values
        if (value === null || value === undefined || value === '') {
            return;
        }

        const result = validateSingleFile(value, field);
        if (!result.valid) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: result.message || 'Invalid file',
            });
        }
    });

    if (!field.required) {
        return schema.optional().nullable();
    }

    return schema;
}
