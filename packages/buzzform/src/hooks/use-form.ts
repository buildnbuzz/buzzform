'use client';

import { useContext, useMemo } from 'react';
import { FormConfigContext } from '../context/form-context';
import type { UseFormOptions, FormAdapter, AdapterOptions, Field, FormSettings } from '../types';

/**
 * Extract default values from field definitions.
 */
function extractDefaultsFromFields(fields?: Field[]): Record<string, unknown> | undefined {
    if (!fields || fields.length === 0) return undefined;

    const defaults: Record<string, unknown> = {};
    let hasDefaults = false;

    for (const field of fields) {
        if ('name' in field && 'defaultValue' in field && field.defaultValue !== undefined) {
            defaults[field.name] = field.defaultValue;
            hasDefaults = true;
        }
        // Handle nested fields
        if ('fields' in field && Array.isArray(field.fields)) {
            const nestedDefaults = extractDefaultsFromFields(field.fields);
            if (nestedDefaults) {
                Object.assign(defaults, nestedDefaults);
                hasDefaults = true;
            }
        }
    }

    return hasDefaults ? defaults : undefined;
}

// Apply FormSettings to a FormAdapter
function applySettings<TData>(
    form: FormAdapter<TData>,
    settings?: FormSettings
): FormAdapter<TData> {
    if (!settings) return form;

    if (settings.submitOnlyWhenDirty) {
        const originalHandleSubmit = form.handleSubmit;

        form.handleSubmit = (e?: React.FormEvent) => {
            if (!form.formState.isDirty) {
                e?.preventDefault?.();
                return;
            }
            return originalHandleSubmit(e);
        };
    }

    if (settings) {
        form.settings = settings;
    }

    return form;
}

/**
 * Create a form instance with the specified options.
 * Uses adapter and resolver from FormProvider context unless overridden.
 * 
 * @example
 * const loginSchema = createSchema([
 *   { type: 'email', name: 'email', required: true },
 *   { type: 'password', name: 'password', required: true },
 * ]);
 * 
 * const form = useForm({
 *   schema: loginSchema,
 *   onSubmit: async (data) => {
 *     await auth.login(data);
 *   },
 *   settings: {
 *     submitOnlyWhenDirty: true,
 *   },
 * });
 * 
 * return (
 *   <form onSubmit={form.handleSubmit}>
 *     ...
 *   </form>
 * );
 */
export function useForm<TData extends Record<string, unknown> = Record<string, unknown>>(
    options: UseFormOptions<TData>
): FormAdapter<TData> {
    const globalConfig = useContext(FormConfigContext);

    // Merge global config with overrides
    const adapter = options.adapter ?? globalConfig?.adapter;
    const resolverFn = globalConfig?.resolver;
    const mode = options.mode ?? globalConfig?.mode ?? 'onChange';
    const reValidateMode = options.reValidateMode ?? globalConfig?.reValidateMode ?? 'onChange';

    const resolver = options.schema && resolverFn ? resolverFn(options.schema) : undefined;

    // Extract default values (useMemo must be unconditional)
    const schemaWithFields = options.schema as (typeof options.schema & { fields?: Field[] }) | undefined;
    const fieldDefaults = useMemo(
        () => extractDefaultsFromFields(schemaWithFields?.fields),
        [schemaWithFields?.fields]
    );
    const defaultValues = options.defaultValues ?? fieldDefaults;

    // Call adapter unconditionally to maintain hook order
    const effectiveAdapter = adapter ?? ((_opts: AdapterOptions) => {
        throw new Error('useForm: No adapter configured.');
    });

    const form = effectiveAdapter({
        defaultValues,
        resolver,
        mode,
        reValidateMode,
        onSubmit: options.onSubmit,
    } as AdapterOptions) as FormAdapter<TData>;

    // Validation must happen after hooks
    if (!options.schema) {
        throw new Error(
            'useForm: schema is required. ' +
            'Use createSchema([...]) to create a schema from fields, or pass a Zod schema directly.'
        );
    }

    if (!adapter) {
        throw new Error(
            'useForm: No adapter configured. ' +
            'Either wrap your app in <FormProvider adapter={...}> or pass adapter in options.'
        );
    }

    return applySettings(form, options.settings);
}
