import { describe, it, expect } from "vitest";
import { validateSchema } from "../src/schema-validator";
import type { SerializableFormSchema } from "../src/serializable";

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
});
