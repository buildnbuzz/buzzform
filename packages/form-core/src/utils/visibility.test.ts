import { describe, it, expect } from "vitest";
import type { Field } from "../types";
import { getVisibleFields } from "./visibility";

const fields: Field[] = [
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
];

describe("getVisibleFields", () => {
  it("filters fields by condition and preserves hidden fields", () => {
    const visible = getVisibleFields(fields, {
      formData: { showSecret: false, showProfile: true },
    });

    expect(visible.map((f) => ("name" in f ? f.name : f.type))).toEqual([
      "title",
      "secret",
      "profile",
    ]);

    const secret = visible[1];
    expect(secret?.hidden).toBeTruthy();
  });

  it("removes fields when condition is false", () => {
    const visible = getVisibleFields(fields, {
      formData: { showSecret: true, showProfile: false },
    });

    expect(visible.map((f) => ("name" in f ? f.name : f.type))).toEqual([
      "title",
      "secret",
    ]);
  });
});
