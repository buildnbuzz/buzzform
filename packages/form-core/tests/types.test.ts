import { describe, it, expect, expectTypeOf } from "vitest";
import { defineSchema } from "../src";
import type { ArrayFieldDef, Field, FormSchema, InferType, PrimitiveArrayField, UnknownData } from "../src";

describe("form-core types", () => {
  it("infers basic data shape from fields", () => {
    const fields = [
      { type: "text", name: "title", required: true },
      { type: "number", name: "age" },
      {
        type: "group",
        name: "address",
        fields: [
          { type: "text", name: "city" },
          { type: "text", name: "country" },
        ],
      },
      {
        type: "array",
        name: "items",
        fields: [
          { type: "text", name: "label" },
          { type: "checkbox", name: "active" },
        ],
      },
      {
        type: "row",
        fields: [{ type: "switch", name: "acceptTerms" }],
      },
      {
        type: "tabs",
        tabs: [
          {
            label: "Details",
            fields: [{ type: "textarea", name: "notes" }],
          },
        ],
      },
      {
        type: "collapsible",
        label: "Advanced",
        fields: [{ type: "radio", name: "level", options: [] }],
      },
    ] as const satisfies Field[];

    expect(fields).toHaveLength(7);

    type Shape = InferType<typeof fields>;

    // required field → value is not optional
    expectTypeOf<Shape["title"]>().toEqualTypeOf<string>();
    // optional fields → value includes undefined
    expectTypeOf<Shape["age"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<Shape["address"]>().toEqualTypeOf<
      { city?: string; country?: string } | undefined
    >();
    expectTypeOf<Shape["items"]>().toEqualTypeOf<
      { label?: string; active?: boolean }[] | undefined
    >();
    expectTypeOf<Shape["acceptTerms"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<Shape["notes"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<Shape["level"]>().toEqualTypeOf<string | undefined>();
  });

  it("accepts a minimal form schema", () => {
    const schema: FormSchema = {
      fields: [{ type: "text", name: "email" }],
    };

    expectTypeOf(schema.fields[0]!.type).toEqualTypeOf<
      "text" | "email" | "password" | "textarea" | "number" | "select" | "date" | "tags" | "checkbox" | "switch" | "radio" | "group" | "array" | "row" | "tabs" | "collapsible"
    >();
  });

  it("accepts schema metadata fields", () => {
    const schema: FormSchema = {
      id: "contact-form",
      title: "Contact form",
      description: "Collect contact details and a message.",
      fields: [{ type: "text", name: "email" }],
    };

    expectTypeOf(schema.id).toEqualTypeOf<string | undefined>();
    expectTypeOf(schema.title).toEqualTypeOf<string | undefined>();
    expectTypeOf(schema.description).toEqualTypeOf<string | undefined>();
  });

  it("accepts ui extension data on fields and layouts", () => {
    const schema: FormSchema = {
      fields: [
        {
          type: "text",
          name: "email",
          ui: { placeholder: "you@domain.com", size: "lg" },
        },
        {
          type: "row",
          ui: { gap: "md" },
          fields: [{ type: "text", name: "name" }],
        },
      ],
    };

    expectTypeOf(schema.fields[0]!.ui).toEqualTypeOf<UnknownData | undefined>();
    expectTypeOf(schema.fields[1]!.ui).toEqualTypeOf<UnknownData | undefined>();
  });

  it("defineSchema narrows types like as const satisfies", () => {
    const schema = defineSchema({
      fields: [
        { type: "text", name: "email", required: true },
        { type: "number", name: "age" },
        { type: "switch", name: "active" },
      ],
    });

    expect(schema.fields).toHaveLength(3);

    type Shape = InferType<typeof schema.fields>;

    expectTypeOf<Shape["email"]>().toEqualTypeOf<string>();
    expectTypeOf<Shape["age"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<Shape["active"]>().toEqualTypeOf<boolean | undefined>();
  });

  it("infers nested array shape (default)", () => {
    const schema = defineSchema({
      fields: [
        {
          type: "array",
          name: "items",
          fields: [
            { type: "text", name: "label", required: true },
            { type: "checkbox", name: "active" },
          ],
        },
      ],
    });

    type Shape = InferType<typeof schema.fields>;
    expectTypeOf<Shape["items"]>().toEqualTypeOf<
      { label: string; active?: boolean }[] | undefined
    >();
    void schema;
  });

  it("accepts primitive array items with omitted name", () => {
    const _valid: PrimitiveArrayField = {
      type: "array",
      name: "tags",
      primitive: true,
      fields: [{ type: "text", required: true }],
    };
    expectTypeOf(_valid).toBeObject();
  });

  it("infers primitive array shape with empty name", () => {
    const schema = defineSchema({
      fields: [
        {
          type: "array",
          name: "tags",
          primitive: true,
          fields: [{ type: "text", name: "", required: true }],
        },
      ],
    });

    type Shape = InferType<typeof schema.fields>;
    expectTypeOf<Shape["tags"]>().toEqualTypeOf<string[] | undefined>();
    void schema;
  });

  it("infers primitive array shape with non-empty name", () => {
    const schema = defineSchema({
      fields: [
        {
          type: "array",
          name: "socials",
          primitive: true,
          fields: [{ type: "text", name: "url", required: true }],
        },
      ],
    });

    type Shape = InferType<typeof schema.fields>;
    expectTypeOf<Shape["socials"]>().toEqualTypeOf<string[] | undefined>();
    void schema;
  });

  it("rejects multiple fields in primitive mode", () => {
    const _invalid: ArrayFieldDef = {
      type: "array",
      name: "test",
      primitive: true,
      // @ts-expect-error - Primitive mode only allows exactly one field (tuple)
      fields: [
        { type: "text", name: "f1" },
        { type: "text", name: "f2" },
      ],
    };
    void _invalid;
  });

  it("allows multiple fields in standard array", () => {
    const _valid: ArrayFieldDef = {
      type: "array",
      name: "test",
      fields: [
        { type: "text", name: "f1" },
        { type: "text", name: "f2" },
      ],
    };
    expectTypeOf(_valid).toBeObject();
  });
});
