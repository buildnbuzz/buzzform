import { describe, it, expect } from "vitest";
import { computeSchemaSignature, syncRuntimeForm } from "./sync";
import type { Field, GroupField } from "@buildnbuzz/form-core";

describe("sync logic", () => {
  describe("computeSchemaSignature", () => {
    it("should be deterministic regarding field order", () => {
      const fields1: Field[] = [
        { type: "text", name: "a" },
        { type: "text", name: "b" },
      ];
      const fields2: Field[] = [
        { type: "text", name: "b" },
        { type: "text", name: "a" },
      ];
      const defaults = { a: 1, b: 2 };

      expect(computeSchemaSignature(fields1, defaults)).toBe(
        computeSchemaSignature(fields2, defaults),
      );
    });

    it("should change when field names change", () => {
      const fields1: Field[] = [{ type: "text", name: "name1" }];
      const fields2: Field[] = [{ type: "text", name: "name2" }];
      const defaults = {};

      expect(computeSchemaSignature(fields1, defaults)).not.toBe(
        computeSchemaSignature(fields2, defaults),
      );
    });

    it("should change when default values change", () => {
      const fields: Field[] = [{ type: "text", name: "a" }];
      expect(computeSchemaSignature(fields, { a: 1 })).not.toBe(
        computeSchemaSignature(fields, { a: 2 }),
      );
    });

    it("should handle nested structures", () => {
      const fields: Field[] = [
        {
          type: "group",
          name: "g",
          fields: [{ type: "text", name: "a" }],
        } as GroupField,
      ];
      const sig = computeSchemaSignature(fields, {});
      expect(sig).toContain("g");
      expect(sig).toContain("g.a");
    });
  });

  describe("syncRuntimeForm", () => {
    it("should preserve existing values", () => {
      const current = { name: "John" };
      const fields: Field[] = [{ type: "text", name: "name" }];
      const defaults = { name: "Default" };

      const result = syncRuntimeForm(current, fields, defaults);
      expect(result.name).toBe("John");
    });

    it("should apply defaults for new fields", () => {
      const current = {};
      const fields: Field[] = [{ type: "text", name: "name" }];
      const defaults = { name: "Default" };

      const result = syncRuntimeForm(current, fields, defaults);
      expect(result.name).toBe("Default");
    });

    it("should prune values not in schema", () => {
      const current = { oldField: "value" };
      const fields: Field[] = [{ type: "text", name: "newField" }];
      const defaults = {};

      const result = syncRuntimeForm(current, fields, defaults);
      expect(result).not.toHaveProperty("oldField");
    });

    it("should recurse into groups", () => {
      const current = { g: { a: "current" } };
      const fields: Field[] = [
        {
          type: "group",
          name: "g",
          fields: [
            { type: "text", name: "a" },
            { type: "text", name: "b" },
          ],
        } as GroupField,
      ];
      const defaultVals = { g: { b: "default" } };

      const result = syncRuntimeForm(current, fields, defaultVals);
      expect((result.g as Record<string, unknown>).a).toBe("current");
      expect((result.g as Record<string, unknown>).b).toBe("default");
    });
  });
});
