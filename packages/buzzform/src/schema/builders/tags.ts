import { z } from 'zod';
import type { TagsField } from '../../types';

export function createTagsFieldSchema(field: TagsField): z.ZodTypeAny {
    const tagSchema = z.string({ error: 'Invalid tag' });
    let schema = z.array(tagSchema, { error: 'Invalid tags' });

    if (field.minTags !== undefined) {
        schema = schema.min(field.minTags, `At least ${field.minTags} tag(s) required`);
    }
    if (field.maxTags !== undefined) {
        schema = schema.max(field.maxTags, `Maximum ${field.maxTags} tag(s) allowed`);
    }

    if (field.required) {
        return schema.refine(
            (arr) => Array.isArray(arr) && arr.length > 0,
            'At least one tag is required'
        );
    }

    return schema.optional().default([]);
}
