import { z } from 'zod';
import type { CheckboxField, SwitchField } from '../../types';
import { applyCustomValidation } from '../helpers';

/**
 * Creates Zod schema for checkbox fields.
 */
export function createCheckboxFieldSchema(field: CheckboxField): z.ZodTypeAny {
    let schema: z.ZodTypeAny = z.boolean();

    // Required checkbox must be checked
    if (field.required) {
        schema = z.boolean().refine(val => val === true, {
            message: 'This field is required',
        });
    }

    return applyCustomValidation(schema, field, field.name);
}

/**
 * Creates Zod schema for switch fields.
 */
export function createSwitchFieldSchema(field: SwitchField): z.ZodTypeAny {
    let schema: z.ZodTypeAny = z.boolean();

    // Required switch must be on
    if (field.required) {
        schema = z.boolean().refine(val => val === true, {
            message: 'This field is required',
        });
    }

    return applyCustomValidation(schema, field, field.name);
}
