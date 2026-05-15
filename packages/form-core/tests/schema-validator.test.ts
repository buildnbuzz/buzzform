import { describe, it, expect } from "vitest";
import { validateSchema } from "../src/schema-validator";
import type { SerializableFormSchema, SerializableField } from "../src/serializable";

describe("schema-validator", () => {
  describe("field identity checks", () => {
    it("flags missing names on data fields", () => {
      const schema: SerializableFormSchema = {
        fields: [
          { type: "text", name: "" }, // missing
          { type: "number", name: "  " }, // blank
          { type: "email", name: "email" } // valid
        ]
      };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      const missingNameIssues = result.issues.filter(i => i.code === "missing_name");
      expect(missingNameIssues).toHaveLength(2);
      expect(missingNameIssues[0].path).toBe("fields[0]");
      expect(missingNameIssues[1].path).toBe("fields[1]");
    });

    it("flags duplicate names among siblings", () => {
      const schema: SerializableFormSchema = {
        fields: [
          { type: "text", name: "foo" },
          { type: "number", name: "foo" }, // duplicate
          { type: "email", name: "bar" }
        ]
      };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      const duplicates = result.issues.filter(i => i.code === "duplicate_name");
      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].path).toBe("fields[1]");
      expect(duplicates[0].message).toContain("'foo'");
    });

    it("allows same name at different nesting levels", () => {
      const schema: SerializableFormSchema = {
        fields: [
          { type: "text", name: "foo" },
          { 
            type: "group", 
            name: "nested",
            fields: [{ type: "text", name: "foo" }] // valid, different level
          }
        ]
      };
      const result = validateSchema(schema);
      expect(result.issues.filter(i => i.code === "duplicate_name")).toHaveLength(0);
    });

    it("allows missing name on layout fields", () => {
      const schema: SerializableFormSchema = {
        fields: [
          { type: "row", fields: [] }
        ]
      };
      const result = validateSchema(schema);
      expect(result.issues).toHaveLength(0);
      expect(result.valid).toBe(true);
    });

    it("allows missing name on primitive array items", () => {
      const schema: SerializableFormSchema = {
        fields: [
          { 
            type: "array", 
            name: "tags", 
            primitive: true,
            fields: [{ type: "text", name: "" }] // allowed for primitive array item
          }
        ]
      };
      const result = validateSchema(schema);
      expect(result.issues).toHaveLength(0);
      expect(result.valid).toBe(true);
    });
  });

  describe("structure checks", () => {
    it("flags missing options for choice fields", () => {
      const schema: SerializableFormSchema = {
        fields: [
          { type: "select", name: "foo" } as unknown as SerializableField, // missing
          { type: "radio", name: "bar", options: [] }, // empty
          { type: "checkbox", name: "baz", hasMany: true } as unknown as SerializableField // missing (group)
        ]
      };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      const issues = result.issues.filter(i => i.code === "missing_options");
      expect(issues).toHaveLength(3);
    });

    it("allows checkbox without hasMany to not have options", () => {
      const schema: SerializableFormSchema = {
        fields: [{ type: "checkbox", name: "foo" }]
      };
      const result = validateSchema(schema);
      expect(result.valid).toBe(true);
    });

    it("flags missing fields array in containers", () => {
      const schema: SerializableFormSchema = {
        fields: [
          { type: "group", name: "foo" } as unknown as SerializableField,
          { type: "row" } as unknown as SerializableField
        ]
      };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      const issues = result.issues.filter(i => i.code === "missing_fields");
      expect(issues).toHaveLength(2);
    });

    it("flags primitive array with multiple child fields", () => {
      const schema: SerializableFormSchema = {
        fields: [
          { 
            type: "array", 
            name: "foo", 
            primitive: true, 
            // @ts-expect-error - testing invalid state with multiple children
            fields: [{ type: "text", name: "a" }, { type: "text", name: "b" }]
          }
        ]
      };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      const issues = result.issues.filter(i => i.code === "primitive_array_multi");
      expect(issues).toHaveLength(1);
    });

    it("flags empty tabs and missing tab fields", () => {
      const schema: SerializableFormSchema = {
        fields: [
          { type: "tabs", tabs: [] },
          { type: "tabs", tabs: [{ label: "A" }] as unknown as { label: string; fields: SerializableField[] }[] } // missing fields
        ]
      };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.issues.filter(i => i.code === "empty_tabs")).toHaveLength(1);
      expect(result.issues.filter(i => i.code === "missing_fields")).toHaveLength(1);
    });
  });

  describe("type checks", () => {
    it("flags invalid field types", () => {
      const schema: SerializableFormSchema = {
        fields: [
          { type: "magic", name: "foo" } as unknown as SerializableField
        ]
      };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      const issues = result.issues.filter(i => i.code === "invalid_field_type");
      expect(issues).toHaveLength(1);
    });

    it("still traverses invalid fields if they have a fields array", () => {
      const schema: SerializableFormSchema = {
        fields: [
          { 
            type: "custom-container", 
            name: "foo", 
            fields: [{ type: "text", name: "" }] 
          } as unknown as SerializableField
        ]
      };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.issues.filter(i => i.code === "invalid_field_type")).toHaveLength(1);
      expect(result.issues.filter(i => i.code === "missing_name")).toHaveLength(1);
    });

    it("flags name on layout fields", () => {
      const schema: SerializableFormSchema = {
        fields: [
          { type: "row", name: "bad_name", fields: [] } as unknown as SerializableField
        ]
      };
      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      const issues = result.issues.filter(i => i.code === "name_in_layout");
      expect(issues).toHaveLength(1);
    });
  });
});
