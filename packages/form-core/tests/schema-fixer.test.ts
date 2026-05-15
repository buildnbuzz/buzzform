import { describe, it, expect } from "vitest";
import { autoFixSchema } from "../src/schema-fixer";
import { validateSchema } from "../src/schema-validator";
import type { SerializableFormSchema, SerializableField } from "../src/serializable";

type TestField = {
  name?: string;
  type?: string;
  fields?: unknown[];
  tabs?: { fields?: unknown[] }[];
};

describe("schema-fixer", () => {
  it("normalizes known field type casing", () => {
    const schema: SerializableFormSchema = {
      fields: [
        { type: "Text", name: "foo" } as unknown as SerializableField,
        { type: "CHECKBOX", name: "bar", hasMany: true, options: [{ label: "1", value: "1" }] } as unknown as SerializableField,
        { type: "UnknownType", name: "baz" } as unknown as SerializableField
      ]
    };
    const fixed = autoFixSchema(schema);
    expect(fixed.fields[0].type).toBe("text");
    expect(fixed.fields[1].type).toBe("checkbox");
    expect(fixed.fields[2].type).toBe("UnknownType");
  });

  it("generates name from label when missing", () => {
    const schema: SerializableFormSchema = {
      fields: [
        { type: "text", label: "First Name*" } as unknown as SerializableField,
        { type: "text", label: "Email Address" } as unknown as SerializableField,
        { type: "text", name: "customName", label: "Custom" } as unknown as SerializableField
      ]
    };
    const fixed = autoFixSchema(schema);
    expect((fixed.fields[0] as TestField).name).toBe("firstName");
    expect((fixed.fields[1] as TestField).name).toBe("emailAddress");
    expect((fixed.fields[2] as TestField).name).toBe("customName");
  });

  it("removes name from layout fields", () => {
    const schema: SerializableFormSchema = {
      fields: [
        { type: "row", name: "layoutRow", fields: [] } as unknown as SerializableField
      ]
    };
    const fixed = autoFixSchema(schema);
    expect((fixed.fields[0] as TestField).name).toBeUndefined();
  });

  it("adds missing fields arrays to containers", () => {
    const schema: SerializableFormSchema = {
      fields: [
        { type: "group", name: "grp" } as unknown as SerializableField,
        { type: "array", name: "arr" } as unknown as SerializableField
      ]
    };
    const fixed = autoFixSchema(schema);
    expect((fixed.fields[0] as TestField).fields).toEqual([]);
    expect((fixed.fields[1] as TestField).fields).toEqual([]);
  });

  it("adds missing tabs arrays to tabs", () => {
    const schema: SerializableFormSchema = {
      fields: [
        { type: "tabs" } as unknown as SerializableField,
        { type: "tabs", tabs: [{ label: "A" }] } as unknown as SerializableField
      ]
    };
    const fixed = autoFixSchema(schema);
    expect((fixed.fields[0] as TestField).tabs).toEqual([]);
    expect((fixed.fields[1] as TestField).tabs![0].fields).toEqual([]);
  });

  it("produces a schema that passes validation after fixing", () => {
    const fixableSchema: SerializableFormSchema = {
      fields: [
        { 
          type: "Group", 
          label: "Personal Info"
        } as unknown as SerializableField,
        { 
          type: "Tabs",
          tabs: [
            { label: "Settings" }
          ]
        } as unknown as SerializableField,
        { 
          type: "Row", 
          name: "layout"
        } as unknown as SerializableField
      ]
    };

    const initialValidation = validateSchema(fixableSchema);
    expect(initialValidation.valid).toBe(false);

    const fixed = autoFixSchema(fixableSchema);
    const fixedValidation = validateSchema(fixed);
    expect(fixedValidation.valid).toBe(true);
    expect(fixedValidation.issues).toHaveLength(0);
  });

  it("returns equivalent schema if already valid", () => {
    const validSchema: SerializableFormSchema = {
      fields: [
        { type: "text", name: "firstName", label: "First Name" }
      ]
    };
    const fixed = autoFixSchema(validSchema);
    expect(fixed).toEqual(validSchema);
  });
});
