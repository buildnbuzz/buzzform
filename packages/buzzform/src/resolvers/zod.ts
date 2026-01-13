import { type z } from 'zod';
import type { Resolver, FieldError, ResolverResult, Field } from '../types';
import { collectFieldValidators, getSiblingData, getValueByPath, type FieldValidator } from '../schema/helpers';

// =============================================================================
// ZOD RESOLVER
// =============================================================================

type ZodIssue = z.core.$ZodIssue;
type ZodError = z.ZodError;

// Schema with attached fields from createSchema()
type SchemaWithFields = z.ZodType & { fields?: readonly Field[] };

/**
 * Creates a validation resolver from a Zod schema.
 * 
 * Custom field validators (field.validate) are run separately from the base schema
 * to ensure they execute even when other fields have errors.
 */
export function zodResolver<TData>(
    schema: z.ZodType<TData>
): Resolver<TData> {
    // Extract field validators from schema.fields (if present)
    const schemaWithFields = schema as SchemaWithFields;
    const fieldValidators = schemaWithFields.fields
        ? collectFieldValidators(schemaWithFields.fields)
        : [];

    return async (values: TData): Promise<ResolverResult<TData>> => {
        const errors: Record<string, FieldError> = {};
        let parsedValues: TData | undefined;

        // Phase 1: Run base schema validation
        try {
            parsedValues = await schema.parseAsync(values);
        } catch (error) {
            if (isZodError(error)) {
                Object.assign(errors, mapZodErrors(error));
            } else {
                throw error;
            }
        }

        // Phase 2: Run custom field validators (always runs, even if base fails)
        if (fieldValidators.length > 0) {
            const customErrors = await runFieldValidators(
                fieldValidators,
                values as Record<string, unknown>
            );
            // Merge, but don't overwrite existing errors
            for (const [path, error] of Object.entries(customErrors)) {
                if (!errors[path]) {
                    errors[path] = error;
                }
            }
        }

        // Return result
        if (Object.keys(errors).length === 0 && parsedValues !== undefined) {
            return { values: parsedValues, errors: {} };
        }

        return { values: {} as TData, errors };
    };
}

/**
 * Run all field validators and collect errors.
 */
async function runFieldValidators(
    validators: FieldValidator[],
    data: Record<string, unknown>
): Promise<Record<string, FieldError>> {
    const errors: Record<string, FieldError> = {};

    await Promise.all(
        validators.map(async ({ path, fn }) => {
            const value = getValueByPath(data, path);
            const siblingData = getSiblingData(data, path);

            try {
                const result = await fn(value, {
                    data,
                    siblingData,
                    path: path.split('.'),
                });

                if (result !== true) {
                    errors[path] = {
                        type: 'custom',
                        message: typeof result === 'string' ? result : 'Validation failed',
                    };
                }
            } catch (error) {
                errors[path] = {
                    type: 'custom',
                    message: error instanceof Error ? error.message : 'Validation error',
                };
            }
        })
    );

    return errors;
}

// =============================================================================
// ERROR MAPPING
// =============================================================================

function mapZodErrors(error: ZodError): Record<string, FieldError> {
    const errors: Record<string, FieldError> = {};

    for (const issue of error.issues) {
        const path = issuePath(issue);
        if (!errors[path]) {
            errors[path] = {
                type: issueType(issue),
                message: issue.message,
            };
        }
    }

    return errors;
}

function issuePath(issue: ZodIssue): string {
    return issue.path.map(String).join('.');
}

function issueType(issue: ZodIssue): string {
    switch (issue.code) {
        case 'invalid_type':
            if ('received' in issue && issue.received === 'undefined') return 'required';
            return 'type';
        case 'too_small':
            if ('origin' in issue && issue.origin === 'string') return 'minLength';
            return 'min';
        case 'too_big':
            if ('origin' in issue && issue.origin === 'string') return 'maxLength';
            return 'max';
        case 'invalid_format': {
            const formatIssue = issue as { format?: string };
            if (formatIssue.format === 'regex') return 'pattern';
            if (typeof formatIssue.format === 'string') return formatIssue.format;
            return 'pattern';
        }
        case 'custom':
            return 'custom';
        default:
            return issue.code ?? 'validation';
    }
}

function isZodError(error: unknown): error is ZodError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'issues' in error &&
        Array.isArray((error as ZodError).issues)
    );
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

export type { ZodType as ZodSchema } from 'zod';
export { z } from 'zod';