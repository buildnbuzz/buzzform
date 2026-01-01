// =============================================================================
// COMMON UTILITIES
// These are used by both the core package and registry field components.
// =============================================================================

/**
 * Generate a unique field ID from the field path.
 * Converts dot notation to dashes and prefixes with 'field-'.
 * Used for accessibility (htmlFor, id attributes).
 * 
 * @example
 * generateFieldId('user.profile.email') => 'field-user-profile-email'
 * generateFieldId('items[0].name') => 'field-items-0-name'
 */
export function generateFieldId(path: string): string {
    return `field-${path.replace(/\./g, "-").replace(/\[/g, "-").replace(/\]/g, "")}`;
}

/**
 * Safely retrieve a nested value from an object using a dot-notation path.
 * 
 * @example
 * getNestedValue({ user: { name: 'John' } }, 'user.name') => 'John'
 * getNestedValue({ items: [{ id: 1 }] }, 'items.0.id') => 1
 */
export function getNestedValue(obj: unknown, path: string): unknown {
    if (!obj || !path) return undefined;
    return path.split(".").reduce<unknown>((acc: unknown, key: string) => {
        if (acc && typeof acc === "object" && acc !== null) {
            return (acc as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj);
}

/**
 * Set a nested value in an object using a dot-notation path.
 * Creates intermediate objects/arrays as needed.
 * 
 * @example
 * setNestedValue({}, 'user.name', 'John') => { user: { name: 'John' } }
 */
export function setNestedValue<T extends Record<string, unknown>>(
    obj: T,
    path: string,
    value: unknown
): T {
    const keys = path.split(".");
    const result = { ...obj } as Record<string, unknown>;
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== "object") {
            // Check if next key is numeric (array index)
            const nextKey = keys[i + 1];
            current[key] = /^\d+$/.test(nextKey) ? [] : {};
        } else {
            current[key] = Array.isArray(current[key])
                ? [...(current[key] as unknown[])]
                : { ...(current[key] as Record<string, unknown>) };
        }
        current = current[key] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
    return result as T;
}

/**
 * Format bytes into a human-readable string.
 * 
 * @example
 * formatBytes(1024) => '1 KB'
 * formatBytes(1234567) => '1.18 MB'
 */
export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
