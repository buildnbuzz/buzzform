import { describe, it, expect } from "vitest";
import {
  deepClone,
  unflattenFormValues,
  flattenFieldToFormValues,
  getNestedValue,
} from "./objects";
import type { Field } from "@buildnbuzz/form-core";

describe("objects utility", () => {
  describe("deepClone", () => {
    it("clones primitives", () => {
      expect(deepClone(1)).toBe(1);
      expect(deepClone("a")).toBe("a");
      expect(deepClone(null)).toBe(null);
    });

    it("deep clones objects", () => {
      const obj = { a: 1, b: { c: 2 } };
      const clone = deepClone(obj);
      expect(clone).toEqual(obj);
      expect(clone).not.toBe(obj);
      expect(clone.b).not.toBe(obj.b);
    });

    it("deep clones arrays", () => {
      const arr = [1, { a: 2 }];
      const clone = deepClone(arr);
      expect(clone).toEqual(arr);
      expect(clone).not.toBe(arr);
      expect(clone[1]).not.toBe(arr[1]);
    });
  });

  describe("unflattenFormValues", () => {
    it("unflattens simple keys", () => {
      const values = { name: "test", label: "Label" };
      expect(unflattenFormValues(values)).toEqual(values);
    });

    it("unflattens dot notation paths", () => {
      const values = {
        name: "test",
        "ui.placeholder": "Enter text",
        "ui.help": "Help me",
      };
      expect(unflattenFormValues(values)).toEqual({
        name: "test",
        ui: {
          placeholder: "Enter text",
          help: "Help me",
        },
      });
    });

    it("unflattens deeply nested paths", () => {
      const values = {
        "a.b.c.d": 1,
      };
      expect(unflattenFormValues(values)).toEqual({
        a: { b: { c: { d: 1 } } },
      });
    });

    it("deep clones values when unflattening", () => {
      const obj = { x: 1 };
      const values = { "props.data": obj };
      const result = unflattenFormValues(values);
      const props = result.props as Record<string, unknown>;
      expect(props.data).toEqual(obj);
      expect(props.data).not.toBe(obj);
    });
  });

  describe("flattenFieldToFormValues", () => {
    it("flattens simple fields and skips structural props", () => {
      const field = {
        type: "text" as const,
        name: "test",
        label: "My Label",
        fields: [], // structural
        children: {}, // structural
      } as unknown as Field;

      const flat = flattenFieldToFormValues(field);
      expect(flat).toEqual({
        name: "test",
        label: "My Label",
      });
      expect(flat).not.toHaveProperty("type");
      expect(flat).not.toHaveProperty("fields");
    });

    it("flattens nested fields", () => {
      const field = {
        type: "text" as const,
        name: "test",
        ui: { placeholder: "..." },
      } as unknown as Field;

      const flat = flattenFieldToFormValues(field);
      expect(flat).toEqual({
        name: "test",
        "ui.placeholder": "...",
      });
    });

    it("ensures nested parents if propertyConfig is provided", () => {
      const propertyConfig = [
        { type: "text" as const, name: "validation.message" },
      ] as unknown as Field[];
      const field = {
        type: "text" as const,
        name: "test",
      } as unknown as Field;

      const flat = flattenFieldToFormValues(field, propertyConfig);
      expect(flat).toHaveProperty("validation");
      const validation = flat.validation as Record<string, unknown>;
      expect(validation).toEqual({});
    });
  });

  describe("getNestedValue", () => {
    it("gets simple and nested values", () => {
      const obj = { a: 1, b: { c: 2 } };
      expect(getNestedValue(obj, "a")).toBe(1);
      expect(getNestedValue(obj, "b.c")).toBe(2);
      expect(getNestedValue(obj, "x.y")).toBeUndefined();
    });
  });
});
