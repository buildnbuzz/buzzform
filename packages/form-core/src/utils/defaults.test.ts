import { describe, it, expect } from "vitest";
import type { Field } from "../types";
import { extractDefaults } from "./defaults";

const baseFields: Field[] = [
  { type: "text", name: "title" },
  { type: "number", name: "age" },
  { type: "checkbox", name: "active" },
  { type: "select", name: "status", options: [] },
];

describe("extractDefaults", () => {
  it("returns zero-values when no explicit defaultValue is set", () => {
    expect(extractDefaults(baseFields)).toEqual({
      title: "",
      age: 0,
      active: false,
      status: "",
    });
  });

  it("uses explicit defaultValue when set", () => {
    const fields: Field[] = [
      { type: "text", name: "country", defaultValue: "US" },
      { type: "number", name: "quantity", defaultValue: 3 },
      { type: "checkbox", name: "active", defaultValue: true },
    ];

    expect(extractDefaults(fields)).toEqual({
      country: "US",
      quantity: 3,
      active: true,
    });
  });

  it("handles nested groups", () => {
    const fields: Field[] = [
      {
        type: "group",
        name: "profile",
        fields: [
          { type: "text", name: "first" },
          { type: "text", name: "last", defaultValue: "Doe" },
        ],
      },
    ];

    expect(extractDefaults(fields)).toEqual({
      profile: { first: "", last: "Doe" },
    });
  });

  it("handles array fields", () => {
    const fields: Field[] = [
      {
        type: "array",
        name: "emails",
        fields: [{ type: "text", name: "email" }],
      },
    ];

    expect(extractDefaults(fields)).toEqual({
      emails: [],
    });
  });

  it("uses static defaultValue for arrays", () => {
    const fields: Field[] = [
      {
        type: "array",
        name: "emails",
        fields: [{ type: "text", name: "email" }],
        defaultValue: ["admin@example.com"],
      },
    ];

    expect(extractDefaults(fields)).toEqual({
      emails: ["admin@example.com"],
    });
  });

  it("ignores dynamic defaultValue references", () => {
    const fields: Field[] = [
      {
        type: "text",
        name: "greeting",
        defaultValue: { $data: "/user/name" },
      },
    ];

    expect(extractDefaults(fields)).toEqual({
      greeting: "",
    });
  });
});
