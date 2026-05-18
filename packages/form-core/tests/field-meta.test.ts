import { describe, it, expect } from "vitest";
import { getFieldMeta, getFieldsByCategory } from "../src/field-meta";
import type { FieldType } from "../src/types";

describe("field-meta", () => {
  describe("input category", () => {
    const inputTypes: FieldType[] = ["text", "email", "password", "textarea", "number", "date", "tags", "upload"];

    it("has metadata for all input types", () => {
      inputTypes.forEach((type) => {
        const meta = getFieldMeta(type);
        expect(meta).toBeDefined();
        expect(meta?.type).toBe(type);
        expect(meta?.category).toBe("input");
      });
    });

    it("getFieldsByCategory('input') returns all input fields", () => {
      const inputs = getFieldsByCategory("input");
      expect(inputs.length).toBe(inputTypes.length);
      inputs.forEach((meta) => {
        expect(inputTypes).toContain(meta.type);
      });
    });

    it("has requiredProps and optionalProps for input fields", () => {
      const meta = getFieldMeta("text");
      expect(meta?.requiredProps).toContain("type");
      expect(meta?.requiredProps).toContain("name");
      expect(meta?.optionalProps).toContain("label");
    });

    it("example configs are structured correctly", () => {
      const meta = getFieldMeta("tags");
      expect(meta?.example).toEqual({ type: "tags", name: "skills", label: "Skills" });
    });
  });

  describe("choice category", () => {
    const choiceTypes: FieldType[] = ["select", "checkbox", "switch", "radio"];

    it("has metadata for all choice types", () => {
      choiceTypes.forEach((type) => {
        const meta = getFieldMeta(type);
        expect(meta).toBeDefined();
        expect(meta?.type).toBe(type);
        expect(meta?.category).toBe("choice");
      });
    });

    it("getFieldsByCategory('choice') returns all choice fields", () => {
      const choices = getFieldsByCategory("choice");
      expect(choices.length).toBe(choiceTypes.length);
      choices.forEach((meta) => {
        expect(choiceTypes).toContain(meta.type);
      });
    });
  });

  describe("container and layout categories", () => {
    const containerTypes: FieldType[] = ["group", "array"];
    const layoutTypes: FieldType[] = ["row", "tabs", "collapsible"];

    it("has metadata for all container and layout types", () => {
      [...containerTypes, ...layoutTypes].forEach((type) => {
        const meta = getFieldMeta(type);
        expect(meta).toBeDefined();
        expect(meta?.hasChildren).toBe(true);
      });
    });

    it("getFieldsByCategory works for container and layout", () => {
      expect(getFieldsByCategory("container").length).toBe(containerTypes.length);
      expect(getFieldsByCategory("layout").length).toBe(layoutTypes.length);
    });
    
    it("layout fields do not have name or defaultValue in required/optional props", () => {
      layoutTypes.forEach((type) => {
        const meta = getFieldMeta(type);
        expect(meta?.requiredProps).not.toContain("name");
        expect(meta?.optionalProps).not.toContain("name");
        expect(meta?.optionalProps).not.toContain("defaultValue");
      });
    });
  });

  describe("completeness", () => {
    it("every FieldType has an entry", () => {
      const allTypes: FieldType[] = [
        "text", "email", "password", "textarea", "number", "select", "date", "tags",
        "checkbox", "switch", "radio", "group", "array", "row", "tabs", "collapsible", "upload"
      ];
      allTypes.forEach((type) => {
        expect(getFieldMeta(type)).toBeDefined();
      });
    });
  });
});
