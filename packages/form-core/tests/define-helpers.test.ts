import { describe, it, expect, expectTypeOf } from "vitest";
import { defineSchema, defineField, defineFields } from "../src";
import type { InferType, FieldInput, TextField, NumberField } from "../src";

describe("defineField", () => {
  it("returns the same field at runtime", () => {
    const input = { type: "text" as const, name: "email" };
    const result = defineField(input);
    expect(result).toBe(input);
  });

  it("narrows literal type on a text field", () => {
    const field = defineField({ type: "text", name: "email", required: true });

    expectTypeOf(field.type).toEqualTypeOf<"text">();
    expectTypeOf(field.name).toEqualTypeOf<"email">();
    expectTypeOf(field.required).toEqualTypeOf<true>();
  });

  it("narrows literal type on a number field", () => {
    const field = defineField({ type: "number", name: "age" });

    expectTypeOf(field.type).toEqualTypeOf<"number">();
    expectTypeOf(field.name).toEqualTypeOf<"age">();
  });

  it("accepts custom field types", () => {
    const field = defineField({ type: "myCustom", name: "custom" });

    expectTypeOf(field.type).toEqualTypeOf<"myCustom">();
    expectTypeOf(field.name).toEqualTypeOf<"custom">();
  });

  it("is assignable to FieldInput", () => {
    const field = defineField({ type: "text", name: "email" });
    expectTypeOf(field).toMatchTypeOf<FieldInput>();
  });
});

describe("defineFields", () => {
  it("returns the same array at runtime", () => {
    const input = [{ type: "text" as const, name: "email" }] as const;
    const result = defineFields(input);
    expect(result).toBe(input);
  });

  it("narrows literal types for all elements", () => {
    const fields = defineFields([
      { type: "text", name: "email", required: true },
      { type: "number", name: "age" },
    ]);

    expectTypeOf(fields[0].type).toEqualTypeOf<"text">();
    expectTypeOf(fields[0].name).toEqualTypeOf<"email">();
    expectTypeOf(fields[1].type).toEqualTypeOf<"number">();
    expectTypeOf(fields[1].name).toEqualTypeOf<"age">();
  });

  it("preserves InferType when spread into defineSchema", () => {
    const extra = defineFields([
      { type: "text", name: "city" },
      { type: "text", name: "zip" },
    ]);

    const schema = defineSchema({
      fields: [
        { type: "text", name: "name", required: true },
        ...extra,
      ],
    });

    expect(schema.fields).toHaveLength(3);

    type Shape = InferType<typeof schema.fields>;
    expectTypeOf<Shape["name"]>().toEqualTypeOf<string>();
    expectTypeOf<Shape["city"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<Shape["zip"]>().toEqualTypeOf<string | undefined>();
  });

  it("works with conditional spreads (the discussion #151 use case)", () => {
    const addAddress = true;

    const addressFields = addAddress
      ? defineFields([
          { type: "text", name: "street" },
          { type: "text", name: "city" },
        ])
      : defineFields([]);

    const schema = defineSchema({
      fields: [
        { type: "text", name: "name", required: true },
        ...addressFields,
      ],
    });

    expect(schema.fields.length).toBeGreaterThanOrEqual(1);
  });

  it("works with defineField inside a conditional spread", () => {
    const addEmail = true;

    const schema = defineSchema({
      fields: [
        defineField({ type: "text", name: "name", required: true }),
        ...(addEmail
          ? [defineField({ type: "email", name: "email" })]
          : []),
      ],
    });

    expect(schema.fields).toHaveLength(2);

    type Shape = InferType<typeof schema.fields>;
    expectTypeOf<Shape["name"]>().toEqualTypeOf<string>();
  });

  it("accepts an empty array", () => {
    const fields = defineFields([]);
    expect(fields).toHaveLength(0);
    expectTypeOf(fields).toEqualTypeOf<readonly []>();
  });
});
