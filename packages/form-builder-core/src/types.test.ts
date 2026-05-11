import { describe, it, expect } from "vitest";

import { isDataField } from "./types";

// ---------------------------------------------------------------------------
// isDataField
// ---------------------------------------------------------------------------

describe("isDataField", () => {
  it("returns true for data fields with a name", () => {
    const textField = { type: "text" as const, name: "email" };
    expect(isDataField(textField)).toBe(true);

    const groupField = {
      type: "group" as const,
      name: "address",
      fields: [],
    };
    expect(isDataField(groupField)).toBe(true);
  });

  it("returns false for layout fields without a name", () => {
    const rowField = { type: "row" as const, fields: [] };
    expect(isDataField(rowField)).toBe(false);

    const tabsField = { type: "tabs" as const, tabs: [] };
    expect(isDataField(tabsField)).toBe(false);

    const collapsibleField = {
      type: "collapsible" as const,
      label: "Advanced",
      fields: [],
    };
    expect(isDataField(collapsibleField)).toBe(false);
  });
});
