export type SchemaFormat = "form-core" | "buzzform-legacy" | "unknown";

export function detectSchemaFormat(input: unknown): SchemaFormat {
  if (!input || typeof input !== "object") {
    return "unknown";
  }

  const schema = input as Record<string, unknown>;
  if (!Array.isArray(schema.fields)) {
    return "unknown";
  }

  const fields = schema.fields;
  if (fields.length === 0) {
    return "form-core";
  }

  let hasLegacyIndicators = false;
  let hasNewIndicators = false;

  const scanField = (field: unknown) => {
    if (!field || typeof field !== "object") return;
    const f = field as Record<string, unknown>;

    if (
      "admin" in f ||
      "component" in f ||
      "inputComponent" in f ||
      f.type === "datetime" ||
      f.type === "upload" ||
      typeof f.condition === "function" ||
      typeof f.validate === "function"
    ) {
      hasLegacyIndicators = true;
    }

    if (
      f.condition &&
      typeof f.condition === "object" &&
      "$" in f.condition
    ) {
      hasNewIndicators = true;
    }

    if (Array.isArray(f.fields)) {
      f.fields.forEach(scanField);
    }
    if (Array.isArray(f.tabs)) {
      f.tabs.forEach((tab: unknown) => {
        if (tab && typeof tab === "object") {
          const t = tab as Record<string, unknown>;
          if (Array.isArray(t.fields)) {
            t.fields.forEach(scanField);
          }
        }
      });
    }
  };

  for (const field of fields) {
    scanField(field);
  }

  if (hasLegacyIndicators && !hasNewIndicators) {
    return "buzzform-legacy";
  }

  if (hasNewIndicators) {
    return "form-core";
  }

  return "form-core";
}
