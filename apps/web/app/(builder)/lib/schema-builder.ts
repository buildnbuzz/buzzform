import type { Field, TabsField } from '@buildnbuzz/buzzform';
import type { Node } from './types';
import { isContainerType, isDataField } from './types';
import { sanitizeFieldConstraints } from './properties';
import { getNodeChildren, getTabSlotKeys } from './node-children';

/**
 * Recursively removes empty objects, empty arrays, null, and undefined values.
 * This ensures the generated schema only includes properties that are actually set.
 */
function cleanEmptyValues<T>(obj: T): T {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(cleanEmptyValues).filter((item) => item !== undefined) as T;
    }

    if (typeof obj === 'object') {
        const cleaned: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
            const cleanedValue = cleanEmptyValues(value);

            // Skip undefined, null, empty objects, and empty arrays
            if (cleanedValue === undefined || cleanedValue === null) continue;
            if (typeof cleanedValue === 'object' && !Array.isArray(cleanedValue) && Object.keys(cleanedValue).length === 0) continue;
            if (Array.isArray(cleanedValue) && cleanedValue.length === 0) continue;

            cleaned[key] = cleanedValue;
        }
        return cleaned as T;
    }

    return obj;
}

const BASE_FIELD_KEYS = new Set([
    'type',
    'name',
    'id',
    'label',
    'description',
    'placeholder',
    'required',
    'disabled',
    'hidden',
    'readOnly',
    'defaultValue',
    'schema',
    'validate',
    'condition',
    'style',
    'component',
    'input',
    'autoComplete',
    'meta',
]);

const TYPE_KEYS: Record<string, Set<string>> = {
    text: new Set([...BASE_FIELD_KEYS, 'minLength', 'maxLength', 'pattern', 'trim', 'ui']),
    email: new Set([...BASE_FIELD_KEYS, 'minLength', 'maxLength', 'pattern', 'trim', 'ui']),
    password: new Set([...BASE_FIELD_KEYS, 'minLength', 'maxLength', 'criteria', 'ui']),
    textarea: new Set([...BASE_FIELD_KEYS, 'minLength', 'maxLength', 'rows', 'autoResize', 'ui']),
    number: new Set([...BASE_FIELD_KEYS, 'min', 'max', 'precision', 'ui']),
    date: new Set([...BASE_FIELD_KEYS, 'minDate', 'maxDate', 'ui']),
    datetime: new Set([...BASE_FIELD_KEYS, 'minDate', 'maxDate', 'ui']),
    select: new Set([
        ...BASE_FIELD_KEYS,
        'options',
        'dependencies',
        'hasMany',
        'minSelected',
        'maxSelected',
        'ui',
    ]),
    'checkbox-group': new Set([
        ...BASE_FIELD_KEYS,
        'options',
        'dependencies',
        'minSelected',
        'maxSelected',
        'ui',
    ]),
    checkbox: new Set([...BASE_FIELD_KEYS]),
    switch: new Set([...BASE_FIELD_KEYS, 'ui']),
    radio: new Set([...BASE_FIELD_KEYS, 'options', 'dependencies', 'ui']),
    tags: new Set([...BASE_FIELD_KEYS, 'minTags', 'maxTags', 'maxTagLength', 'allowDuplicates', 'ui']),
    upload: new Set([
        ...BASE_FIELD_KEYS,
        'hasMany',
        'minFiles',
        'maxFiles',
        'maxSize',
        'ui',
    ]),
    group: new Set([...BASE_FIELD_KEYS, 'fields', 'ui']),
    array: new Set([...BASE_FIELD_KEYS, 'fields', 'minRows', 'maxRows', 'ui']),
    row: new Set(['type', 'fields', 'ui']),
    tabs: new Set(['type', 'tabs', 'ui']),
    collapsible: new Set(['type', 'label', 'fields', 'collapsed', 'ui', 'style']),
};

const SELECT_OPTION_KEYS = new Set([
    'label',
    'value',
    'description',
    'icon',
    'badge',
    'disabled',
]);

const TAB_KEYS = new Set([
    'name',
    'label',
    'fields',
    'description',
    'icon',
    'disabled',
]);

function pickKeys<T extends Record<string, unknown>>(value: T, allowed: Set<string>): T {
    const next: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
        if (allowed.has(key)) {
            next[key] = val;
        }
    }
    return next as T;
}

function sanitizeSelectOptions(options: unknown): unknown {
    if (!Array.isArray(options)) return options;

    return options.map((option) => {
        if (typeof option === 'string') return option;
        if (option && typeof option === 'object' && !Array.isArray(option)) {
            const picked = pickKeys(option as Record<string, unknown>, SELECT_OPTION_KEYS);
            return picked;
        }
        return option;
    });
}

function sanitizeTabs(tabs: unknown): unknown {
    if (!Array.isArray(tabs)) return tabs;

    return tabs.map((tab) => {
        if (!tab || typeof tab !== 'object' || Array.isArray(tab)) return tab;
        const picked = pickKeys(tab as Record<string, unknown>, TAB_KEYS);
        const fields = Array.isArray((tab as { fields?: unknown }).fields)
            ? (tab as { fields: Field[] }).fields.map(sanitizeFieldForExport)
            : [];
        return {
            ...picked,
            fields,
        };
    });
}

function sanitizeFieldForExport(field: Field): Field {
    const allowedKeys = TYPE_KEYS[field.type];
    if (!allowedKeys) return field;

    const picked = pickKeys(field as unknown as Record<string, unknown>, allowedKeys);

    if ('options' in picked) {
        (picked as { options?: unknown }).options = sanitizeSelectOptions(
            (picked as { options?: unknown }).options,
        );
    }

    if ('fields' in picked) {
        (picked as { fields?: unknown }).fields = Array.isArray(
            (picked as { fields?: unknown }).fields,
        )
            ? ((picked as { fields: Field[] }).fields.map(sanitizeFieldForExport))
            : [];
    }

    if ('tabs' in picked) {
        (picked as { tabs?: unknown }).tabs = sanitizeTabs(
            (picked as { tabs?: unknown }).tabs,
        );
    }

    return picked as unknown as Field;
}

/**
 * Convert builder nodes to a BuzzForm Field array.
 * Recursively processes the node tree and extracts field definitions.
 */
export function nodesToFields(
    nodes: Record<string, Node>,
    rootIds: string[]
): Field[] {
    return rootIds.map((id) => nodeToField(nodes, id)).filter(Boolean) as Field[];
}

export function nodeToField(nodes: Record<string, Node>, id: string): Field | null {
    const node = nodes[id];
    if (!node) return null;

    const { field } = node;

    // Reorder properties for better readability
    const { type, name, label, ...rest } = field as unknown as Record<string, unknown>;

    // Sanitize constraints to prevent invalid combinations (e.g., minLength > maxLength)
    const sanitizedRest = sanitizeFieldConstraints(rest);

    // Clean empty values from the rest of the properties
    const cleanedRest = cleanEmptyValues(sanitizedRest);

    const orderedField = {
        type,
        ...(name ? { name } : {}),
        ...(label ? { label } : {}),
        ...cleanedRest,
    };


    if (field.type === 'tabs') {
        const tabsField = field as TabsField;
        const tabs = Array.isArray(tabsField.tabs) ? tabsField.tabs : [];
        const slots = getTabSlotKeys(tabs);

        const normalizedTabs = tabs.map((tab, tabIndex) => {
            const slot = slots[tabIndex];
            const childIds =
                (node.tabChildren?.[slot] && node.tabChildren[slot].length > 0)
                    ? node.tabChildren[slot]
                    : tabIndex === 0 && node.children.length > 0
                        ? node.children
                        : [];

            const nestedFields = childIds
                .map((childId) => nodeToField(nodes, childId))
                .filter(Boolean) as Field[];

            return {
                ...(cleanEmptyValues(sanitizeFieldForExport({
                    type: 'tabs',
                    tabs: [tab],
                } as Field)) as unknown as { tabs?: Array<Record<string, unknown>> })
                    .tabs?.[0],
                fields: nestedFields,
            };
        });

        const fieldForExport = {
            ...(orderedField as Record<string, unknown>),
            tabs: normalizedTabs,
        } as Field;

        return sanitizeFieldForExport(fieldForExport);
    }

    if (isContainerType(field.type) && 'fields' in field) {
        const nestedFields = node.children.length > 0
            ? node.children
                .map((childId) => nodeToField(nodes, childId))
                .filter(Boolean) as Field[]
            : [];

        const fieldForExport = {
            ...orderedField,
            fields: nestedFields,
        } as Field;

        return sanitizeFieldForExport(fieldForExport);
    }

    return sanitizeFieldForExport(orderedField as Field);
}

/**
 * Extract all field names from the node tree.
 * Useful for generating unique names.
 */
export function getAllFieldNames(
    nodes: Record<string, Node>,
    rootIds: string[]
): Set<string> {
    const names = new Set<string>();

    function traverse(ids: string[]) {
        for (const id of ids) {
            const node = nodes[id];
            if (!node) continue;

            if (isDataField(node.field)) {
                names.add(node.field.name);
            }

            traverse(getNodeChildren(node));
        }
    }

    traverse(rootIds);
    return names;
}
