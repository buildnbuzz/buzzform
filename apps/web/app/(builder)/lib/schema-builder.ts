import type { Field } from '@buildnbuzz/buzzform';
import type { Node } from './types';
import { isContainerType, isDataField } from './types';
import { sanitizeFieldConstraints } from './properties';

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

    const { field, children } = node;

    // Reorder properties for better readability
    const { type, name, label, ...rest } = field as unknown as Record<string, unknown>;

    // Sanitize constraints to prevent invalid combinations (e.g., minLength > maxLength)
    const sanitizedRest = sanitizeFieldConstraints(rest);

    const orderedField = {
        type,
        ...(name ? { name } : {}),
        ...(label ? { label } : {}),
        ...sanitizedRest,
    };

    // For container fields, recursively convert children
    if (isContainerType(field.type) && children.length > 0) {
        const nestedFields = children
            .map((childId) => nodeToField(nodes, childId))
            .filter(Boolean) as Field[];

        // Attach nested fields to the container
        if ('fields' in field) {
            return {
                ...orderedField,
                fields: nestedFields,
            } as Field;
        }
    }

    return orderedField as Field;
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

            traverse(node.children);
        }
    }

    traverse(rootIds);
    return names;
}
