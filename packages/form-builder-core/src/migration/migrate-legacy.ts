import type { Field } from "@buildnbuzz/form-core";

export function migrateLegacyField(field: unknown): { field: Field; warnings: string[] } {
  const warnings: string[] = [];

  if (!field || typeof field !== "object") {
    warnings.push("Invalid field: not an object");
    return { field: {} as Field, warnings };
  }

  const legacy = field as Record<string, unknown>;
  const migrated: Record<string, unknown> = { ...legacy };

  const fieldName = migrated.name || "unnamed";

  if (migrated.type === "datetime") {
    migrated.type = "date";
    migrated.withTime = true;
  }

  if (migrated.type === "upload") {
    warnings.push(`Field "${fieldName}" has unsupported type "upload".`);
  }

  if ("component" in migrated) {
    delete migrated.component;
    warnings.push(`Stripped "component" from field "${fieldName}".`);
  }

  if ("inputComponent" in migrated) {
    delete migrated.inputComponent;
    warnings.push(`Stripped "inputComponent" from field "${fieldName}".`);
  }

  if (typeof migrated.validate === "function") {
    delete migrated.validate;
    warnings.push(`Stripped non-serializable "validate" function from field "${fieldName}".`);
  }

  if (typeof migrated.condition === "function") {
    delete migrated.condition;
    warnings.push(`Stripped non-serializable "condition" function from field "${fieldName}".`);
  }

  if (migrated.admin && typeof migrated.admin === "object") {
    if ("readOnly" in migrated.admin) {
      migrated.readOnly = migrated.admin.readOnly;
    }
    if ("disabled" in migrated.admin) {
      migrated.disabled = migrated.admin.disabled;
    }
    delete migrated.admin;
  }

  if (Array.isArray(migrated.options)) {
    migrated.options = migrated.options.map((opt: unknown) => {
      if (typeof opt === "string" || typeof opt === "number") {
        return { label: String(opt), value: opt };
      }
      return opt;
    });
  }

  if (Array.isArray(migrated.fields)) {
    const subFields: Field[] = [];
    for (const sub of migrated.fields) {
      const result = migrateLegacyField(sub);
      subFields.push(result.field);
      warnings.push(...result.warnings);
    }
    migrated.fields = subFields;
  }

  if (Array.isArray(migrated.tabs)) {
    const subTabs: Record<string, unknown>[] = [];
    for (const tab of migrated.tabs) {
      if (tab && Array.isArray(tab.fields)) {
        const tabFields: Field[] = [];
        for (const sub of tab.fields) {
          const result = migrateLegacyField(sub);
          tabFields.push(result.field);
          warnings.push(...result.warnings);
        }
        subTabs.push({ ...tab, fields: tabFields });
      } else {
        subTabs.push(tab);
      }
    }
    migrated.tabs = subTabs;
  }

  return { field: migrated as unknown as Field, warnings };
}
