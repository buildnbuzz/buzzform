import { describe, it, expect } from "vitest";
import {
  clampNumber,
  applyNumericPrecision,
  formatNumberWithSeparator,
  parseFormattedNumber,
} from "./number";

describe("clampNumber", () => {
  it("returns value when within bounds", () => {
    expect(clampNumber(5, 0, 10)).toBe(5);
  });

  it("clamps to min when below", () => {
    expect(clampNumber(-5, 0, 10)).toBe(0);
  });

  it("clamps to max when above", () => {
    expect(clampNumber(15, 0, 10)).toBe(10);
  });

  it("works with no bounds", () => {
    expect(clampNumber(42)).toBe(42);
  });

  it("works with only min", () => {
    expect(clampNumber(-1, 0)).toBe(0);
    expect(clampNumber(5, 0)).toBe(5);
  });

  it("works with only max", () => {
    expect(clampNumber(100, undefined, 50)).toBe(50);
    expect(clampNumber(10, undefined, 50)).toBe(10);
  });

  it("returns min when value equals min", () => {
    expect(clampNumber(0, 0, 10)).toBe(0);
  });

  it("returns max when value equals max", () => {
    expect(clampNumber(10, 0, 10)).toBe(10);
  });
});

describe("applyNumericPrecision", () => {
  it("rounds to given decimal places", () => {
    expect(applyNumericPrecision(3.14159, 2)).toBe(3.14);
  });

  it("returns integer unchanged when no decimal needed", () => {
    expect(applyNumericPrecision(10, 2)).toBe(10);
  });

  it("returns undefined when value is undefined", () => {
    expect(applyNumericPrecision(undefined, 2)).toBeUndefined();
  });

  it("returns value unchanged when precision is undefined", () => {
    expect(applyNumericPrecision(3.14159)).toBe(3.14159);
  });

  it("handles zero precision", () => {
    expect(applyNumericPrecision(3.7, 0)).toBe(4);
  });

  it("handles negative numbers", () => {
    expect(applyNumericPrecision(-3.14159, 2)).toBe(-3.14);
  });
});

describe("formatNumberWithSeparator", () => {
  it("formats integer with default comma separator", () => {
    expect(formatNumberWithSeparator(1234567)).toBe("1,234,567");
  });

  it("formats number with decimals", () => {
    expect(formatNumberWithSeparator(1234567.89)).toBe("1,234,567.89");
  });

  it("uses custom separator", () => {
    expect(formatNumberWithSeparator(1234567, " ")).toBe("1 234 567");
  });

  it("returns empty string for undefined", () => {
    expect(formatNumberWithSeparator(undefined)).toBe("");
  });

  it("returns empty string for NaN", () => {
    expect(formatNumberWithSeparator(NaN)).toBe("");
  });

  it("handles small numbers without separator", () => {
    expect(formatNumberWithSeparator(999)).toBe("999");
  });

  it("handles negative numbers", () => {
    expect(formatNumberWithSeparator(-1234567)).toBe("-1,234,567");
  });

  it("handles zero", () => {
    expect(formatNumberWithSeparator(0)).toBe("0");
  });
});

describe("parseFormattedNumber", () => {
  it("parses comma-separated integer", () => {
    expect(parseFormattedNumber("1,234,567")).toBe(1234567);
  });

  it("parses comma-separated float", () => {
    expect(parseFormattedNumber("1,234,567.89")).toBe(1234567.89);
  });

  it("parses with custom separator", () => {
    expect(parseFormattedNumber("1 234 567", " ")).toBe(1234567);
  });

  it("returns undefined for empty string", () => {
    expect(parseFormattedNumber("")).toBeUndefined();
  });

  it("returns undefined for non-numeric string", () => {
    expect(parseFormattedNumber("abc")).toBeUndefined();
  });

  it("round-trips with formatNumberWithSeparator", () => {
    const original = 1234567.89;
    const formatted = formatNumberWithSeparator(original);
    expect(parseFormattedNumber(formatted)).toBe(original);
  });
});
