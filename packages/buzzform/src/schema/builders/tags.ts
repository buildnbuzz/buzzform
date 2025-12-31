import { z } from 'zod';
import type { TagsField } from '../../types';
import { applyCustomValidation } from '../helpers';

/**
 * Creates Zod schema for tags fields.
 * Tags are always arrays of strings.
 */
export function createTagsFieldSchema(field: TagsField): z.ZodTypeAny {
    const tagSchema = z.string();
    let schema = z.array(tagSchema);

    // Min/max constraints (TagsField uses minTags/maxTags)
    if (field.minTags !== undefined) {
        schema = schema.min(field.minTags, `At least ${field.minTags} tag(s) required`);
    }
    if (field.maxTags !== undefined) {
        schema = schema.max(field.maxTags, `Maximum ${field.maxTags} tag(s) allowed`);
    }

    // Apply custom validation
    let finalSchema: z.ZodTypeAny = applyCustomValidation(schema, field, field.name);

    // Required: must have at least one tag
    if (field.required) {
        finalSchema = finalSchema.refine(
            (arr) => Array.isArray(arr) && arr.length > 0,
            'At least one tag is required'
        );
        return finalSchema;
    }

    // Optional: default to empty array
    return finalSchema.optional().default([]);
}
