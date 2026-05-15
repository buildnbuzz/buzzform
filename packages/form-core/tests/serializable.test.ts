import { describe, it, expect } from "vitest";
import { isSerializable, toSerializable, serializeSchema, deserializeSchema } from "../src/serializable";
import type { SerializableFormSchema, SerializableTextField } from "../src/serializable";
import type { FormSchema } from "../src/types";


describe("serializable", () => {
  describe("isSerializable", () => {
    it("returns true for pure JSON schemas", () => {
      const schema: FormSchema = {
        fields: [
          { type: "text", name: "foo", label: "Foo" }
        ]
      };
      expect(isSerializable(schema)).toBe(true);
    });

    it("returns false if schema contains functions", () => {
      const schema: FormSchema = {
        fields: [
          { type: "text", name: "foo", label: (() => "Foo") as unknown as string }
        ]
      };
      expect(isSerializable(schema)).toBe(false);
    });

    it("returns false if schema contains FrameworkText (React nodes)", () => {
      const schema: FormSchema = {
        fields: [
          { type: "text", name: "foo", label: { $$typeof: Symbol.for("react.element") } as unknown as string }
        ]
      };
      expect(isSerializable(schema)).toBe(false);
    });
  });

  describe("toSerializable", () => {
    it("strips functions and replaces them with undefined", () => {
      const schema: FormSchema = {
        fields: [
          {
            type: "text",
            name: "foo",
            condition: (() => true) as unknown as boolean,
            label: "Foo"
          }
        ]
      };
      const serializable = toSerializable(schema);
      expect((serializable.fields[0] as { condition?: unknown }).condition).toBeUndefined();
      expect((serializable.fields[0] as SerializableTextField).label).toBe("Foo");
    });

    it("replaces OptionResolverFn with an empty array", () => {
      const schema: FormSchema = {
        fields: [
          {
            type: "select",
            name: "foo",
            options: (() => []) as unknown as string[]
          }
        ]
      };
      const serializable = toSerializable(schema);
      expect((serializable.fields[0] as { options?: unknown }).options).toEqual([]);
    });

    it("converts FrameworkText to string", () => {
      const reactNode = { $$typeof: Symbol.for("react.element"), toString: () => "MyNode" };
      const schema: FormSchema = {
        fields: [
          {
            type: "text",
            name: "foo",
            label: reactNode as unknown as string
          }
        ]
      };
      const serializable = toSerializable(schema);
      expect((serializable.fields[0] as SerializableTextField).label).toBe(String(reactNode));
    });

    it("preserves valid serializable nodes", () => {
      const schema: FormSchema = {
        fields: [
          {
            type: "text",
            name: "foo",
            condition: { $data: "bar", eq: "baz" }
          }
        ]
      };
      const serializable = toSerializable(schema);
      expect((serializable.fields[0] as { condition?: unknown }).condition).toEqual({ $data: "bar", eq: "baz" });
    });
  });

  describe("serializeSchema", () => {
    it("returns deterministic JSON", () => {
      const s1: SerializableFormSchema = {
        fields: [
          { type: "text", name: "foo", label: "Foo", required: true }
        ]
      };
      const s2: SerializableFormSchema = {
        fields: [
          { required: true, name: "foo", label: "Foo", type: "text" }
        ]
      };
      expect(serializeSchema(s1)).toBe(serializeSchema(s2));
      expect(serializeSchema(s1)).toBe(`{"fields":[{"label":"Foo","name":"foo","required":true,"type":"text"}]}`);
    });
  });

  describe("deserializeSchema", () => {
    it("parses valid schema", () => {
      const json = `{"fields":[{"type":"text","name":"foo"}]}`;
      const schema = deserializeSchema(json);
      expect(schema.fields).toHaveLength(1);
    });

    it("throws on invalid JSON", () => {
      expect(() => deserializeSchema(`{ broken`)).toThrow("Failed to parse schema");
    });

    it("throws on missing fields array", () => {
      expect(() => deserializeSchema(`{"title":"foo"}`)).toThrow("Invalid schema structure");
    });

    it("round-trips correctly", () => {
      const s: SerializableFormSchema = {
        fields: [{ type: "text", name: "foo", label: "Foo" }]
      };
      const parsed = deserializeSchema(serializeSchema(s));
      expect(parsed).toEqual(s);
    });
  });
});
