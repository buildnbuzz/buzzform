import { describe, it, expect } from "vitest";
import type { ValidationCheck } from "../types";
import {
  builtInValidators,
  deriveFieldChecks,
  runChecks,
  collectFieldValidationChecks,
} from "./index";

// ============================================================================
// Built-in validators
// ============================================================================

describe("builtInValidators", () => {
  it("validates required", () => {
    expect(builtInValidators.required("")).toBe(false);
    expect(builtInValidators.required("ok")).toBe(true);
  });

  it("validates min/max length", () => {
    expect(builtInValidators.minLength("hi", { min: 3 })).toBe(false);
    expect(builtInValidators.maxLength("hello", { max: 5 })).toBe(true);
  });

  it("validates pattern", () => {
    expect(builtInValidators.pattern("abc", { pattern: "^a" })).toBe(true);
    expect(builtInValidators.pattern("abc", { pattern: "^z" })).toBe(false);
  });

  it("validates number range", () => {
    expect(builtInValidators.min(2, { min: 3 })).toBe(false);
    expect(builtInValidators.max(2, { max: 3 })).toBe(true);
  });

  it("validates min/max items", () => {
    expect(builtInValidators.minItems([1], { min: 2 })).toBe(false);
    expect(builtInValidators.maxItems([1, 2], { max: 2 })).toBe(true);
  });
});

// ============================================================================
// Derived checks
// ============================================================================

describe("deriveFieldChecks", () => {
  it("derives checks from field props", () => {
    const checks = deriveFieldChecks({
      type: "text",
      name: "title",
      required: true,
      minLength: 2,
      maxLength: 10,
      pattern: "^a",
    });

    const types = checks.map((check) => check.type);
    expect(types).toEqual([
      "required",
      "minLength",
      "maxLength",
      "pattern",
    ]);
  });
});

// ============================================================================
// Runner
// ============================================================================

describe("runChecks", () => {
  it("returns first error message", async () => {
    const checks: ValidationCheck[] = [
      { type: "minLength", message: "Too short", args: { min: 3 } },
      { type: "maxLength", message: "Too long", args: { max: 5 } },
    ];

    const message = await runChecks(checks, "hi", {
      formData: {},
    });

    expect(message).toBe("Too short");
  });
});

describe("collectFieldValidationChecks", () => {
  it("includes derived checks when requested", () => {
    const field = {
      type: "number" as const,
      name: "age",
      min: 18,
      validate: {
        onSubmit: {
          checks: [{ type: "max", message: "Too high", args: { max: 99 } }],
        },
      },
    };

    const checks = collectFieldValidationChecks(field, "submit", {
      includeDerived: true,
    });

    expect(checks.map((c) => c.type)).toEqual(["max", "min"]);
  });
});
