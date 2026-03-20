import { describe, it, expectTypeOf } from "vitest";
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

    type Shape = InferDataShape<typeof fields>;

    expectTypeOf<Shape>().toEqualTypeOf<{
      title: string;
      age: number;
      address: {
        city: string;
        country: string;
      };
      items: { label: string; active: boolean }[];
      acceptTerms: boolean;
      notes: string;
      level: string;
    }>();
  });

  it("accepts a minimal form schema", () => {
    const schema: FormSchema = {
      fields: [{ type: "text", name: "email" }],
    };

    expectTypeOf(schema.fields[0].type).toEqualTypeOf<
      "text" | "textarea" | "number" | "select" | "checkbox" | "switch" | "radio" | "group" | "array" | "row" | "tabs" | "collapsible"
    >();
  });
});
