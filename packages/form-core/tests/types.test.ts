import { describe, it, expect, expectTypeOf } from "vitest";
import type { Field, InferDataShape, FormSchema } from "../src";

describe("form-core types", () => {
  it("infers basic data shape from fields", () => {
    const fields = [
      { type: "text", name: "title" },
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
        title: "Advanced",
        fields: [{ type: "radio", name: "level", options: [] }],
      },
    ] as const satisfies Field[];

    expect(fields).toHaveLength(7);

    type Shape = InferDataShape<typeof fields>;

    expectTypeOf<Shape["title"]>().toEqualTypeOf<string>();
    expectTypeOf<Shape["age"]>().toEqualTypeOf<number>();
    expectTypeOf<Shape["address"]["city"]>().toEqualTypeOf<string>();
    expectTypeOf<Shape["address"]["country"]>().toEqualTypeOf<string>();
    expectTypeOf<Shape["items"][number]["label"]>().toEqualTypeOf<string>();
    expectTypeOf<Shape["items"][number]["active"]>().toEqualTypeOf<boolean>();
    expectTypeOf<Shape["acceptTerms"]>().toEqualTypeOf<boolean>();
    expectTypeOf<Shape["notes"]>().toEqualTypeOf<string>();
    expectTypeOf<Shape["level"]>().toEqualTypeOf<string>();
  });

  it("accepts a minimal form schema", () => {
    const schema: FormSchema = {
      fields: [{ type: "text", name: "email" }],
    };

    expectTypeOf(schema.fields[0]!.type).toEqualTypeOf<
      "text" | "textarea" | "number" | "select" | "checkbox" | "switch" | "radio" | "group" | "array" | "row" | "tabs" | "collapsible"
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
});
