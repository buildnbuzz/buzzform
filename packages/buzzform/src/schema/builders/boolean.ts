import { z } from 'zod';
import type { CheckboxField, SwitchField } from '../../types';

export function createCheckboxFieldSchema(field: CheckboxField): z.ZodTypeAny {
    let schema: z.ZodTypeAny = z.boolean({ error: 'Invalid value' });

    if (field.required) {
        schema = z.boolean({ error: 'This field is required' }).refine(val => val === true, {
            error: 'This field is required',
        });
    }

    return schema;
}

export function createSwitchFieldSchema(field: SwitchField): z.ZodTypeAny {
    let schema: z.ZodTypeAny = z.boolean({ error: 'Invalid value' });

    if (field.required) {
        schema = z.boolean({ error: 'This field is required' }).refine(val => val === true, {
            error: 'This field is required',
        });
    }

    return schema;
}
