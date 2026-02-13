import { nanoid } from 'nanoid';
import type { ArrayHelpers } from '../types';

/**
 * Creates a standardized set of array field manipulation methods.
 * Abstracts the difference between getting/setting values in different form libraries.
 * 
 * @param getArray - Function to get current array value at a path
 * @param setArray - Function to set array value at a path
 */
export function createArrayHelpers(
    getArray: (path: string) => unknown,
    setArray: (path: string, value: unknown[]) => void
): ArrayHelpers {
    const readArray = (path: string): unknown[] => {
        const value = getArray(path);
        return Array.isArray(value) ? value : [];
    };

    return {
        fields: <T = unknown>(path: string): Array<T & { id: string }> => {
            const arr = readArray(path);
            return arr.map((item, index) => {
                const itemObject =
                    typeof item === 'object' && item !== null
                        ? (item as Record<string, unknown>)
                        : ({ value: item } as Record<string, unknown>);

                return {
                    id: (itemObject.id as string) || `${path}-${index}`,
                    ...(itemObject as T),
                };
            });
        },

        append: (path: string, value: unknown) => {
            const current = readArray(path);
            const itemWithId = ensureId(value);
            setArray(path, [...current, itemWithId]);
        },

        prepend: (path: string, value: unknown) => {
            const current = readArray(path);
            const itemWithId = ensureId(value);
            setArray(path, [itemWithId, ...current]);
        },

        insert: (path: string, index: number, value: unknown) => {
            const current = [...readArray(path)];
            const itemWithId = ensureId(value);
            current.splice(index, 0, itemWithId);
            setArray(path, current);
        },

        remove: (path: string, index: number) => {
            const current = [...readArray(path)];
            current.splice(index, 1);
            setArray(path, current);
        },

        move: (path: string, from: number, to: number) => {
            const current = [...readArray(path)];
            const [item] = current.splice(from, 1);
            current.splice(to, 0, item);
            setArray(path, current);
        },

        swap: (path: string, indexA: number, indexB: number) => {
            const current = [...readArray(path)];
            const temp = current[indexA];
            current[indexA] = current[indexB];
            current[indexB] = temp;
            setArray(path, current);
        },

        replace: (path: string, values: unknown[]) => {
            const itemsWithIds = values.map(ensureId);
            setArray(path, itemsWithIds);
        },

        update: (path: string, index: number, value: unknown) => {
            const current = [...readArray(path)];
            // Preserve existing ID if present
            const existingId = (current[index] as Record<string, unknown>)?.id;
            current[index] = {
                ...(typeof value === 'object' && value !== null ? value : {}),
                id: existingId || nanoid(),
            };
            setArray(path, current);
        },
    };
}

/**
 * Ensures an item has a unique ID for React keys.
 */
function ensureId(value: unknown): unknown {
    if (typeof value === 'object' && value !== null) {
        const obj = value as Record<string, unknown>;
        if (!obj.id) {
            return { ...obj, id: nanoid() };
        }
        return obj;
    }
    return { value, id: nanoid() };
}
