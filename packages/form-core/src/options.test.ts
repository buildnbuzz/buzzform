import { describe, expect, it } from "vitest";
import {
  normalizeSelectOption,
  getSelectOptionValue,
  getSelectOptionLabel,
  resolveOption,
  resolveOptions,
} from "./options";
import type { FieldOption } from "./types";

const EMPTY = {};

describe("normalizeSelectOption", () => {
  it("converts a string to { value, label }", () => {
    expect(normalizeSelectOption("foo")).toEqual({ value: "foo", label: "foo" });
  });

  it("passes through a FieldOption object unchanged", () => {
    const opt: FieldOption = { value: "bar", label: "Bar" };
    expect(normalizeSelectOption(opt)).toEqual(opt);
  });

  it("preserves ui metadata on FieldOption", () => {
    const opt: FieldOption = { value: "x", label: "X", ui: { icon: "star" } };
    expect(normalizeSelectOption(opt).ui).toEqual({ icon: "star" });
  });
});

describe("getSelectOptionValue", () => {
  it("returns the string as-is", () => {
    expect(getSelectOptionValue("hello")).toBe("hello");
  });

  it("coerces numeric value to string", () => {
    expect(getSelectOptionValue({ value: "42", label: "Forty Two" })).toBe("42");
  });

  it("returns value from FieldOption", () => {
    expect(getSelectOptionValue({ value: "abc", label: "ABC" })).toBe("abc");
  });
});

describe("getSelectOptionLabel", () => {
  it("returns the string as-is", () => {
    expect(getSelectOptionLabel("hello")).toBe("hello");
  });

  it("returns label from FieldOption", () => {
    expect(getSelectOptionLabel({ value: "x", label: "My Label" })).toBe("My Label");
  });

  it("falls back to value string when label is a DynamicString ref", () => {
    const opt: FieldOption = { value: "x", label: { $data: "someField" } };
    expect(getSelectOptionLabel(opt)).toBe("x");
  });
});

describe("resolveOption", () => {
  it("resolves a string option", () => {
    expect(resolveOption("foo", EMPTY)).toEqual({
      label: "foo",
      value: "foo",
      disabled: false,
    });
  });

  it("resolves a plain FieldOption", () => {
    const opt: FieldOption = { value: "a", label: "Alpha" };
    expect(resolveOption(opt, EMPTY)).toEqual({
      label: "Alpha",
      value: "a",
      disabled: false,
      ui: undefined,
    });
  });

  it("resolves static disabled: true", () => {
    const opt: FieldOption = { value: "a", label: "Alpha", disabled: true };
    expect(resolveOption(opt, EMPTY).disabled).toBe(true);
  });

  it("resolves dynamic disabled via $data", () => {
    const opt: FieldOption = { value: "a", label: "Alpha", disabled: { $data: "/isLocked" } };
    expect(resolveOption(opt, { isLocked: true }).disabled).toBe(true);
    expect(resolveOption(opt, { isLocked: false }).disabled).toBe(false);
  });

  it("resolves dynamic disabled via $context", () => {
    const opt: FieldOption = { value: "a", label: "Alpha", disabled: { $context: "/readonly" } };
    expect(resolveOption(opt, EMPTY, { readonly: true }).disabled).toBe(true);
  });

  it("defaults disabled to false when undefined", () => {
    const opt: FieldOption = { value: "a", label: "Alpha" };
    expect(resolveOption(opt, EMPTY).disabled).toBe(false);
  });

  it("preserves ui metadata", () => {
    const opt: FieldOption = { value: "a", label: "Alpha", ui: { description: "desc" } };
    expect(resolveOption(opt, EMPTY).ui).toEqual({ description: "desc" });
  });
});

describe("resolveOptions", () => {
  it("resolves a mixed array of strings and FieldOptions", () => {
    const options: (FieldOption | string)[] = [
      "foo",
      { value: "bar", label: "Bar", disabled: true },
    ];
    const result = resolveOptions(options, EMPTY);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ label: "foo", value: "foo", disabled: false });
    expect(result[1]).toMatchObject({ label: "Bar", value: "bar", disabled: true });
  });

  it("returns empty array for empty input", () => {
    expect(resolveOptions([], EMPTY)).toEqual([]);
  });
});
