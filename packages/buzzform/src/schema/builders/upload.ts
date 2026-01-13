import { z } from 'zod';
import type { UploadField } from '../../types';

function matchesMimePattern(fileType: string, pattern: string): boolean {
    const normalizedPattern = pattern.toLowerCase().trim();
    const normalizedType = fileType.toLowerCase();

    if (normalizedPattern.endsWith('/*')) {
        const category = normalizedPattern.replace('/*', '');
        return normalizedType.startsWith(category + '/');
    }

    if (normalizedPattern.startsWith('.')) {
        return true;
    }

    return normalizedType === normalizedPattern;
}

function isFileTypeAccepted(file: File, acceptPatterns: string[]): boolean {
    if (!file.type) return true;
    return acceptPatterns.some(pattern => matchesMimePattern(file.type, pattern));
}

export function createUploadFieldSchema(field: UploadField): z.ZodTypeAny {
    let fileSchema: z.ZodTypeAny = z.file({ error: 'Please select a file' });

    if (field.maxSize) {
        const sizeMB = (field.maxSize / 1024 / 1024).toFixed(1);
        fileSchema = (fileSchema as z.ZodFile).max(field.maxSize, {
            error: `File must be smaller than ${sizeMB}MB`,
        });
    }

    const accept = field.ui?.accept;
    if (accept && accept !== '*') {
        const acceptPatterns = accept.split(',').map(t => t.trim());
        const hasWildcard = acceptPatterns.some(p => p.includes('*') || p.startsWith('.'));

        if (hasWildcard) {
            fileSchema = fileSchema.refine(
                (file) => isFileTypeAccepted(file as File, acceptPatterns),
                `File type not allowed. Accepted: ${accept}`
            );
        } else {
            fileSchema = (fileSchema as z.ZodFile).mime(acceptPatterns, {
                error: `File type not allowed. Accepted: ${accept}`,
            });
        }
    }

    const fileOrUrl = z.union([
        fileSchema,
        z.string({ error: 'Invalid file' }),
    ], { error: 'Please select a file' });

    if (field.hasMany) {
        let arraySchema = z.array(fileOrUrl, { error: 'Invalid files' });

        if (field.minFiles !== undefined && field.minFiles > 0) {
            arraySchema = arraySchema.min(field.minFiles, {
                error: `At least ${field.minFiles} file(s) required`,
            });
        }

        if (field.maxFiles !== undefined) {
            arraySchema = arraySchema.max(field.maxFiles, {
                error: `Maximum ${field.maxFiles} file(s) allowed`,
            });
        }

        if (field.required) {
            arraySchema = arraySchema.min(1, {
                error: 'At least one file is required',
            });
            return arraySchema;
        }

        return arraySchema.optional().default([]);
    }

    if (field.required) {
        return fileOrUrl;
    }

    return fileOrUrl.optional().nullable();
}
