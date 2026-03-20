import { describe, it, expect } from "vitest";
import type { Field } from "../types";
import { walkFields, getOptionValues } from "./walk";

const schema: Field[] = [
  { type: "text", name: "title" },
  {
    type: "group",
    name: "profile",
    fields: [{ type: "number", name: "age" }],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "A",
        fields: [{ type: "checkbox", name: "isActive" }],
      },
    ],
  },
  {
    type: "row",
    fields: [{ type: "textarea", name: "notes" }],
  },
];

describe("walkFields", () => {
  it("walks fields depth-first and tracks JSON Pointer paths", () => {
    const visited: string[] = [];

    walkFields(schema, (field, ctx) => {
      if ("name" in field) {
        visited.push(`${ctx.path}/${field.name}`.replace(/^\//, ""));
      }
    });

    expect(visited).toEqual([
      "title",
      "profile",
      "profile/age",
      "isActive",
      "notes",
    ]);
  });

  it("collects option values", () => {
    const field: Field = {
      type: "select",
      name: "status",
      options: [
        { label: "Open", value: "open" },
        { label: "Closed", value: "closed" },
      ],
    };

    expect(getOptionValues(field)).toEqual(["open", "closed"]);
  });
});
