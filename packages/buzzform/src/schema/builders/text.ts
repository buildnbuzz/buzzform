import { z } from 'zod';
import type { TextField, EmailField, TextareaField, PasswordField } from '../../types';
import { makeOptional, getPatternErrorMessage } from '../helpers';

export function createTextFieldSchema(field: TextField | TextareaField): z.ZodTypeAny {
    let schema = z.string({ error: 'This field is required' });

    if ('pattern' in field && field.pattern) {
        const pattern = typeof field.pattern === 'string'
            ? new RegExp(field.pattern)
            : field.pattern;

        schema = schema.regex(pattern, {
            error: getPatternErrorMessage(field.pattern),
        });
    }

    if (field.minLength) {
        schema = schema.min(field.minLength, {
            error: `Must be at least ${field.minLength} characters`,
        });
    }
    if (field.maxLength) {
        schema = schema.max(field.maxLength, {
            error: `Must be no more than ${field.maxLength} characters`,
        });
    }

    if (field.required) {
        schema = schema.min(1, { error: 'This field is required' });
    }

    let finalSchema: z.ZodTypeAny = schema;
    if ('trim' in field && field.trim) {
        finalSchema = z.preprocess((val) => {
            return typeof val === 'string' ? val.trim() : val;
        }, schema);
    }

    if (!field.required) {
        return makeOptional(finalSchema, field.type);
    }

    return finalSchema;
}

export function createEmailFieldSchema(field: EmailField): z.ZodTypeAny {
    // Zod v4: z.email() for email validation with custom error
    let schema = z.email({ error: 'Invalid email address' });

    if (field.minLength) {
        schema = schema.min(field.minLength, {
            error: `Must be at least ${field.minLength} characters`,
        });
    }
    if (field.maxLength) {
        schema = schema.max(field.maxLength, {
            error: `Must be no more than ${field.maxLength} characters`,
        });
    }

    if (field.required) {
        schema = schema.min(1, { error: 'Email is required' });
    }

    if (!field.required) {
        return makeOptional(schema, 'email');
    }

    return schema;
}

export function createPasswordFieldSchema(field: PasswordField): z.ZodTypeAny {
    // Zod v4: provide error message for invalid_type
    let schema = z.string({ error: 'Password is required' });

    if (field.minLength) {
        schema = schema.min(field.minLength, {
            error: `Password must be at least ${field.minLength} characters`,
        });
    }
    if (field.maxLength) {
        schema = schema.max(field.maxLength, {
            error: `Password must be no more than ${field.maxLength} characters`,
        });
    }
    if (field.required) {
        schema = schema.min(1, { error: 'Password is required' });
    }

    if (!field.required) {
        return makeOptional(schema, 'password');
    }

    return schema;
}
