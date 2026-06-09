import { describe, it, expect } from "vitest";
import type { FieldInput } from "../types";
import { getVisibleFields } from "./visibility";

const isArrayField = (field: FieldInput): field is Extract<FieldInput, { type: "array" }> =>
  field.type === "array";

const fields: FieldInput[] = [
  { type: "text", name: "title" },
  {
    type: "text",
    name: "secret",
    hidden: { $data: "/showSecret", eq: false },
  },
  {
    type: "group",
    name: "profile",
    condition: { $data: "/showProfile", eq: true },
    fields: [{ type: "text", name: "nickname" }],
  },
  {
    type: "array",
    name: "socials",
    primitive: true,
    fields: [{ type: "text", name: "" }],
  },
  {
    type: "array",
    name: "contacts",
    fields: [
      { type: "text", name: "type" },
      {
        type: "text",
        name: "value",
        condition: { $data: "/showContactValue", eq: true },
      },
    ],
  },
];

describe("getVisibleFields", () => {
  it("filters fields by condition and preserves hidden fields", () => {
    const visible = getVisibleFields(fields, {
      data: { showSecret: false, showProfile: true },
    });

    expect(visible.map((f) => ("name" in f ? f.name : f.type))).toEqual([
      "title",
      "secret",
      "profile",
      "socials",
      "contacts",
    ]);

    const secret = visible[1];
    expect(secret?.hidden).toBeTruthy();
  });

  it("removes fields when condition is false", () => {
    const visible = getVisibleFields(fields, {
      data: {
 showSecret: true, showProfile: false },
    });

    expect(visible.map((f) => ("name" in f ? f.name : f.type))).toEqual([
      "title",
      "secret",
      "socials",
      "contacts",
    ]);
  });

  it("keeps primitive array fields unchanged after filtering", () => {
    const visible = getVisibleFields(fields, {
      data: {
 showSecret: true, showProfile: true },
    });

    const socials = visible
      .filter(isArrayField)
      .find((field) => field.name === "socials");
    expect(socials).toBeDefined();
    expect(socials?.type).toBe("array");
    expect(socials?.fields.length).toBe(1);
    expect(socials?.fields[0]?.type).toBe("text");
  });

  it("filters nested array fields based on child conditions", () => {
    const visible = getVisibleFields(fields, {
      data: {
 showSecret: true, showProfile: true, showContactValue: false },
    });

    const contacts = visible
      .filter(isArrayField)
      .find((field) => field.name === "contacts");
    expect(contacts).toBeDefined();
    const contactFieldNames = contacts?.fields.flatMap((field) =>
      "name" in field ? [field.name] : [],
    );
    expect(contactFieldNames).toEqual(["type"]);
  });
});
