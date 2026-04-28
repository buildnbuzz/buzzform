import { describe, it, expect } from "vitest";
import { migrateLegacyField } from "./migrate-legacy";

describe("migrateLegacyField", () => {
  it("converts datetime to date with withTime", () => {
    const { field, warnings } = migrateLegacyField({ type: "datetime", name: "date1" });
    expect(field.type).toBe("date");
    expect(field).toHaveProperty("withTime", true);
    expect(warnings).toHaveLength(0);
  });

  it("adds warning for upload type", () => {
    const { field, warnings } = migrateLegacyField({ type: "upload", name: "file1" });
    expect(field.type).toBe("upload");
    expect(warnings[0]).toContain('unsupported type "upload"');
  });

  it("strips component and inputComponent with warnings", () => {
    const { field, warnings } = migrateLegacyField({ 
      type: "text", 
      name: "t1", 
      component: "Input", 
      inputComponent: "MyInput" 
    });
    expect(field).not.toHaveProperty("component");
    expect(field).not.toHaveProperty("inputComponent");
    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toContain('Stripped "component"');
    expect(warnings[1]).toContain('Stripped "inputComponent"');
  });

  it("strips function validate and condition with warnings", () => {
    const { field, warnings } = migrateLegacyField({ 
      type: "text", 
      name: "t1", 
      validate: () => false, 
      condition: () => true 
    });
    expect(field).not.toHaveProperty("validate");
    expect(field).not.toHaveProperty("condition");
    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toContain('Stripped non-serializable "validate" function');
    expect(warnings[1]).toContain('Stripped non-serializable "condition" function');
  });

  it("hoists admin properties without warnings", () => {
    const { field, warnings } = migrateLegacyField({ 
      type: "text", 
      name: "t1", 
      admin: { readOnly: true, disabled: false } 
    });
    expect(field).toHaveProperty("readOnly", true);
    expect(field).toHaveProperty("disabled", false);
    expect(field).not.toHaveProperty("admin");
    expect(warnings).toHaveLength(0);
  });

  it("normalizes options correctly", () => {
    const { field } = migrateLegacyField({ 
      type: "select", 
      name: "s1", 
      options: ["A", "B", { label: "C", value: "C" }] 
    });
    expect(field).toHaveProperty("options", [
      { label: "A", value: "A" },
      { label: "B", value: "B" },
      { label: "C", value: "C" }
    ]);
  });

  it("recursively processes nested fields", () => {
    const { field, warnings } = migrateLegacyField({ 
      type: "group", 
      name: "g1", 
      fields: [
        { type: "datetime", name: "d1" },
        { type: "text", name: "t1", component: "X" }
      ]
    });
    expect(field).toHaveProperty("fields");
    const fields = (field as { fields?: Record<string, unknown>[] }).fields!;
    expect(fields[0]?.type).toBe("date");
    expect(fields[1]).not.toHaveProperty("component");
    expect(warnings).toHaveLength(1); // One warning for component strip in subfield
  });

  it("recursively processes tabs", () => {
    const { field, warnings } = migrateLegacyField({ 
      type: "tabs", 
      name: "tabs1", 
      tabs: [
        { 
          name: "tab1", 
          fields: [
            { type: "datetime", name: "d1" }
          ] 
        }
      ]
    });
    expect(field).toHaveProperty("tabs");
    const tabs = (field as { tabs?: { fields: Record<string, unknown>[] }[] }).tabs!;
    expect(tabs[0]?.fields?.[0]?.type).toBe("date");
    expect(warnings).toHaveLength(0);
  });
});
