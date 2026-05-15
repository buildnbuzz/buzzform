import type { SerializableFormSchema, SerializableField } from "./serializable";
import { FIELD_TYPE_META } from "./field-meta";

/**
 * Applies heuristics to fix common AI generation mistakes in a form schema.
 * Returns a new schema with fixes applied.
 */
export function autoFixSchema(schema: SerializableFormSchema): SerializableFormSchema {
  return {
    ...schema,
    fields: Array.isArray(schema.fields) ? schema.fields.map(fixField) : [],
  };
}

type MutableField = {
  type?: string;
  name?: string;
  label?: string;
  fields?: unknown[];
  tabs?: { fields?: unknown[]; [key: string]: unknown }[];
  [key: string]: unknown;
};

function fixField(field: SerializableField): SerializableField {
  // Deep clone the field object
  const f = JSON.parse(JSON.stringify(field)) as MutableField;

  // 1. Normalize type casing (e.g. "Text" -> "text")
  if (f.type && typeof f.type === "string") {
    const lowerType = f.type.toLowerCase();
    if (lowerType !== f.type && FIELD_TYPE_META[lowerType as keyof typeof FIELD_TYPE_META]) {
      f.type = lowerType;
    }
  }

  const isLayout = ["row", "tabs", "collapsible"].includes(f.type || "");
  const isContainer = ["group", "array", "row", "collapsible"].includes(f.type || "");

  // 2. Remove name from layout fields
  if (isLayout && "name" in f) {
    delete f.name;
  }

  // 3. Generate name from label if missing
  if (!isLayout && (!f.name || typeof f.name !== "string" || f.name.trim() === "")) {
    if (f.label && typeof f.label === "string" && f.label.trim() !== "") {
      f.name = toCamelCase(f.label);
    }
  }

  // 4. Add missing fields array to containers
  if (isContainer) {
    if (!Array.isArray(f.fields)) {
      f.fields = [];
    } else {
      f.fields = f.fields.map((child) => fixField(child as SerializableField));
    }
  }

  // 5. Add missing tabs array to tabs
  if (f.type === "tabs") {
    if (!Array.isArray(f.tabs)) {
      f.tabs = [];
    } else {
      f.tabs = f.tabs.map((tab) => ({
        ...tab,
        fields: Array.isArray(tab.fields) ? tab.fields.map((child) => fixField(child as SerializableField)) : []
      }));
    }
  }

  return f as unknown as SerializableField;
}

/**
 * Converts a string like "First Name*" to "firstName"
 */
function toCamelCase(str: string): string {
  const words = str.match(/[a-zA-Z0-9]+/g) || [];
  if (words.length === 0) return "field";
  
  return words.map((word, index) => {
    if (index === 0) return word.toLowerCase();
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join('');
}
