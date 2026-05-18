import { describe, it, expect } from "vitest";
import type { ExprContext, ValidationCheck } from "../types";
import {
  builtInValidators,
  deriveFieldChecks,
  runChecks,
  collectFieldValidationChecks,
  validateFields,
  validateField,
  validatePath,
  validateSchema,
  FORM_ERROR_PATH,
} from "./index";

// ============================================================================
// Built-in validators
// ============================================================================

describe("builtInValidators", () => {
  it("validates required", () => {
    expect(builtInValidators.required("")).toBe(false);
    expect(builtInValidators.required("ok")).toBe(true);
    // Booleans: false should fail required (unchecked checkbox)
    expect(builtInValidators.required(false)).toBe(false);
    expect(builtInValidators.required(true)).toBe(true);
    // Null (tristate indeterminate) should fail required
    expect(builtInValidators.required(null)).toBe(false);
    expect(builtInValidators.required(undefined)).toBe(false);
  });

  it("validates email", () => {
    expect(builtInValidators.email("ada@example.com")).toBe(true);
    expect(builtInValidators.email("not-an-email")).toBe(false);
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

  it("validates precision and step", () => {
    expect(builtInValidators.precision(12.34, { precision: 2 })).toBe(true);
    expect(builtInValidators.precision(12.345, { precision: 2 })).toBe(false);
    expect(builtInValidators.step(12, { step: 3 })).toBe(true);
    expect(builtInValidators.step(10, { step: 3 })).toBe(false);
  });

  it("validates min/max items", () => {
    expect(builtInValidators.minItems([1], { min: 2 })).toBe(false);
    expect(builtInValidators.maxItems([1, 2], { max: 2 })).toBe(true);
  });

  it("validates matches", () => {
    expect(builtInValidators.matches("abc", { other: "abc" })).toBe(true);
    expect(builtInValidators.matches("abc", { other: "xyz" })).toBe(false);
  });

  it("validates passwordCriteria", () => {
    const criteria = {
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecial: true,
    };
    expect(builtInValidators.passwordCriteria("Abcdef1!", criteria)).toBe(true);
    expect(builtInValidators.passwordCriteria("abcdef1!", criteria)).toBe(
      false,
    ); // no uppercase
    expect(builtInValidators.passwordCriteria("ABCDEF1!", criteria)).toBe(
      false,
    ); // no lowercase
    expect(builtInValidators.passwordCriteria("Abcdefg!", criteria)).toBe(
      false,
    ); // no number
    expect(builtInValidators.passwordCriteria("Abcdef12", criteria)).toBe(
      false,
    ); // no special
    expect(builtInValidators.passwordCriteria("Abcdef1!", {})).toBe(true); // no criteria = pass
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
    expect(types).toEqual(["required", "pattern", "minLength", "maxLength"]);
  });

  it("derives precision and step checks from number fields", () => {
    const checks = deriveFieldChecks({
      type: "number",
      name: "amount",
      precision: 2,
      step: 0.5,
    });

    expect(checks.map((check) => check.type)).toEqual(["precision", "step"]);
  });

  it("derives email format check for email fields", () => {
    const checks = deriveFieldChecks({
      type: "email",
      name: "email",
      minLength: 5,
    });
    const types = checks.map((c) => c.type);
    expect(types).toContain("email");
    expect(types).toContain("minLength");
  });

  it("derives passwordCriteria check when criteria is set", () => {
    const checks = deriveFieldChecks({
      type: "password",
      name: "password",
      criteria: { requireUppercase: true, requireNumber: true },
    });
    const criteriaCheck = checks.find((c) => c.type === "passwordCriteria");
    expect(criteriaCheck).toBeDefined();
    expect(criteriaCheck?.args).toEqual({
      requireUppercase: true,
      requireNumber: true,
    });
  });

  it("does not derive passwordCriteria when criteria is absent", () => {
    const checks = deriveFieldChecks({ type: "password", name: "password" });
    expect(checks.find((c) => c.type === "passwordCriteria")).toBeUndefined();
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

  it("does not include derived checks when disabled", () => {
    const field = {
      type: "text" as const,
      name: "title",
      required: true,
      minLength: 2,
      validate: {
        onSubmit: {
          checks: [
            { type: "maxLength", message: "Too long", args: { max: 5 } },
          ],
        },
      },
    };

    const checks = collectFieldValidationChecks(field, "submit", {
      includeDerived: false,
    });

    expect(checks.map((c) => c.type)).toEqual(["maxLength"]);
  });

  it("avoids duplicating checks by type", () => {
    const field = {
      type: "text" as const,
      name: "title",
      required: true,
      validate: {
        onSubmit: {
          checks: [{ type: "required", message: "Custom required" }],
        },
      },
    };

    const checks = collectFieldValidationChecks(field, "submit", {
      includeDerived: true,
    });

    expect(checks.map((c) => c.type)).toEqual(["required"]);
    expect(checks[0]?.message).toBe("Custom required");
  });
});

// ============================================================================
// Schema validation
// ============================================================================

describe("validateFields", () => {
  it("validates derived required checks", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "title",
        required: true,
      },
    ];

    const result = await validateFields(
      fields,
      { title: "" },
      { run: "blur", includeDerived: true },
    );

    expect(result.valid).toBe(false);
    expect(result.errorsByPath["/title"]).toBe("This field is required.");
  });

  it("validates derived min/max + pattern for text", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "code",
        minLength: 3,
        maxLength: 5,
        pattern: "^[A-Z]+$",
      },
    ];

    const tooShort = await validateFields(
      fields,
      { code: "A" },
      { run: "blur", includeDerived: true },
    );
    expect(tooShort.errorsByPath["/code"]).toBe(
      "Must be at least 3 characters.",
    );

    const tooLong = await validateFields(
      fields,
      { code: "ABCDEF" },
      { run: "blur", includeDerived: true },
    );
    expect(tooLong.errorsByPath["/code"]).toBe("Must be at most 5 characters.");

    const invalidPattern = await validateFields(
      fields,
      { code: "AbC" },
      { run: "blur", includeDerived: true },
    );
    expect(invalidPattern.errorsByPath["/code"]).toBe("Invalid format.");
  });

  it("validates derived min/max for number", async () => {
    const fields = [
      {
        type: "number" as const,
        name: "age",
        min: 18,
        max: 65,
      },
    ];

    const tooLow = await validateFields(
      fields,
      { age: 16 },
      { run: "blur", includeDerived: true },
    );
    expect(tooLow.errorsByPath["/age"]).toBe("Must be at least 18.");

    const tooHigh = await validateFields(
      fields,
      { age: 70 },
      { run: "blur", includeDerived: true },
    );
    expect(tooHigh.errorsByPath["/age"]).toBe("Must be at most 65.");
  });

  it("validates derived precision and step for number", async () => {
    const fields = [
      {
        type: "number" as const,
        name: "amount",
        precision: 2,
        step: 0.5,
      },
    ];

    const badPrecision = await validateFields(
      fields,
      { amount: 12.345 },
      { run: "blur", includeDerived: true },
    );
    expect(badPrecision.errorsByPath["/amount"]).toBe(
      "Must have at most 2 decimal places.",
    );

    const badStep = await validateFields(
      fields,
      { amount: 1.3 },
      { run: "blur", includeDerived: true },
    );
    expect(badStep.errorsByPath["/amount"]).toBe("Must be a multiple of 0.5.");
  });

  it("validates email and matches checks with resolved dynamic args", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "email",
        validate: {
          onBlur: {
            checks: [{ type: "email", message: "Invalid email." }],
          },
        },
      },
      {
        type: "text" as const,
        name: "confirmEmail",
        validate: {
          onBlur: {
            checks: [
              {
                type: "matches",
                message: "Emails must match.",
                args: { other: { $data: "/email" } },
              },
            ],
          },
        },
      },
    ];

    const badEmail = await validateFields(
      fields,
      { email: "wrong", confirmEmail: "wrong" },
      { run: "blur", includeDerived: true },
    );
    expect(badEmail.errorsByPath["/email"]).toBe("Invalid email.");

    const mismatch = await validateFields(
      fields,
      { email: "ada@example.com", confirmEmail: "grace@example.com" },
      { run: "blur", includeDerived: true },
    );
    expect(mismatch.errorsByPath["/confirmEmail"]).toBe("Emails must match.");
  });

  it("validates derived min/max items for array", async () => {
    const fields = [
      {
        type: "array" as const,
        name: "tags",
        minItems: 2,
        maxItems: 3,
        fields: [
          {
            type: "text" as const,
            name: "label",
          },
        ],
      },
    ];

    const tooFew = await validateFields(
      fields,
      { tags: ["a"] },
      { run: "blur", includeDerived: true },
    );
    expect(tooFew.errorsByPath["/tags"]).toBe("Add at least 2 items.");

    const tooMany = await validateFields(
      fields,
      { tags: ["a", "b", "c", "d"] },
      { run: "blur", includeDerived: true },
    );
    expect(tooMany.errorsByPath["/tags"]).toBe("Cannot exceed 3 items.");
  });

  it("skips fields gated by condition", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "secret",
        required: true,
        condition: { $data: "/show", eq: true },
      },
    ];

    const result = await validateFields(fields, { show: false, secret: "" });

    expect(result.valid).toBe(true);
  });

  it("includes derived checks on submit by default", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "title",
        required: true,
      },
    ];

    const result = await validateFields(
      fields,
      { title: "" },
      { run: "submit" },
    );

    expect(result.valid).toBe(false);
    expect(result.errorsByPath["/title"]).toBe("This field is required.");
  });

  it("includes derived checks when derivedRun matches run", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "title",
        required: true,
      },
    ];

    const result = await validateFields(
      fields,
      { title: "" },
      {
        run: "submit",
        derivedRun: "submit",
      },
    );

    expect(result.valid).toBe(false);
    expect(result.errorsByPath["/title"]).toBe("This field is required.");
  });

  it("includes derived checks when includeDerived is true", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "title",
        required: true,
      },
    ];

    const result = await validateFields(
      fields,
      { title: "" },
      {
        run: "submit",
        includeDerived: true,
      },
    );

    expect(result.valid).toBe(false);
    expect(result.errorsByPath["/title"]).toBe("This field is required.");
  });

  it("validates array item fields when present", async () => {
    const fields = [
      {
        type: "array" as const,
        name: "items",
        fields: [
          {
            type: "text" as const,
            name: "label",
            required: true,
          },
        ],
      },
    ];

    const result = await validateFields(
      fields,
      { items: [{ label: "" }, { label: "ok" }] },
      { run: "blur", includeDerived: true },
    );

    expect(result.valid).toBe(false);
    expect(result.errorsByPath["/items/0/label"]).toBe(
      "This field is required.",
    );
    expect(result.errorsByPath["/items/1/label"]).toBeUndefined();
  });
});

// ============================================================================
// Single-field validation
// ============================================================================

describe("validateField", () => {
  it("respects derivedRun default (submit)", async () => {
    const field = {
      type: "text" as const,
      name: "title",
      required: true,
    };

    const blurResult = await validateField(
      field,
      "/title",
      { title: "" },
      {
        run: "blur",
      },
    );
    expect(blurResult.valid).toBe(true);

    const submitResult = await validateField(
      field,
      "/title",
      { title: "" },
      {
        run: "submit",
      },
    );
    expect(submitResult.valid).toBe(false);
    expect(submitResult.error).toBe("This field is required.");
  });

  it("includes derived checks when includeDerived is true", async () => {
    const field = {
      type: "number" as const,
      name: "age",
      min: 18,
    };

    const result = await validateField(
      field,
      "/age",
      { age: 16 },
      {
        run: "submit",
        includeDerived: true,
      },
    );

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Must be at least 18.");
  });
});

describe("validatePath", () => {
  it("finds nested fields through groups, arrays, and layout", async () => {
    const fields = [
      {
        type: "row" as const,
        fields: [
          {
            type: "group" as const,
            name: "profile",
            fields: [
              {
                type: "array" as const,
                name: "tags",
                fields: [
                  {
                    type: "text" as const,
                    name: "label",
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const result = await validatePath(
      fields,
      "/profile/tags/0/label",
      { profile: { tags: [{ label: "" }] } },
      { run: "blur", includeDerived: true },
    );

    expect(result.valid).toBe(false);
    expect(result.error).toBe("This field is required.");
  });

  it("does not confuse numeric field names with array indices", async () => {
    const fields = [
      {
        type: "group" as const,
        name: "report",
        fields: [
          {
            type: "text" as const,
            name: "2024",
            required: true,
          },
        ],
      },
    ];

    const result = await validatePath(
      fields,
      "/report/2024",
      { report: { "2024": "" } },
      { run: "blur", includeDerived: true },
    );

    expect(result.valid).toBe(false);
    expect(result.error).toBe("This field is required.");
  });

  it("returns valid when path is not found", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "title",
        required: true,
      },
    ];

    const result = await validatePath(
      fields,
      "/missing",
      { title: "" },
      {
        run: "blur",
      },
    );

    expect(result.valid).toBe(true);
  });

  it("skips validation when parent condition hides the field", async () => {
    const fields = [
      {
        type: "group" as const,
        name: "secret",
        condition: { $data: "/show", eq: true },
        fields: [
          {
            type: "text" as const,
            name: "code",
            required: true,
          },
        ],
      },
    ];

    const result = await validatePath(
      fields,
      "/secret/code",
      {
        show: false,
        secret: { code: "" },
      },
      {
        run: "blur",
      },
    );

    expect(result.valid).toBe(true);
  });
});

describe("validateSchema", () => {
  it("accepts schema metadata without affecting validation behavior", async () => {
    const schema = {
      id: "signup-form",
      title: "Sign up",
      description: "Collect signup details.",
      fields: [
        {
          type: "text" as const,
          name: "email",
          required: true,
        },
      ],
    };

    const result = await validateSchema(
      schema,
      { email: "" },
      { run: "blur", includeDerived: true },
    );

    expect(result.valid).toBe(false);
    expect(result.errorsByPath["/email"]).toBe("This field is required.");
  });
});

// ============================================================================
// Schema-level validation
// ============================================================================

describe("validateSchema", () => {
  it("runs form-level checks for the requested run", async () => {
    const schema = {
      fields: [],
      validate: {
        onBlur: {
          checks: [{ type: "customFail", message: "Form invalid" }],
        },
      },
    };

    const result = await validateSchema(
      schema,
      {},
      {
        run: "blur",
        validators: {
          customFail: () => false,
        },
      },
    );

    expect(result.valid).toBe(false);
    expect(result.errorsByPath[FORM_ERROR_PATH]).toBe("Form invalid");
  });

  it("does not run form-level checks for other runs", async () => {
    const schema = {
      fields: [],
      validate: {
        onSubmit: {
          checks: [{ type: "customFail", message: "Form invalid" }],
        },
      },
    };

    const result = await validateSchema(
      schema,
      {},
      {
        run: "blur",
        validators: {
          customFail: () => false,
        },
      },
    );

    expect(result.valid).toBe(true);
    expect(result.errorsByPath[FORM_ERROR_PATH]).toBeUndefined();
  });

  it("combines field errors with form-level errors", async () => {
    const schema = {
      fields: [
        {
          type: "text" as const,
          name: "title",
          required: true,
        },
      ],
      validate: {
        onBlur: {
          checks: [{ type: "customFail", message: "Form invalid" }],
        },
      },
    };

    const result = await validateSchema(
      schema,
      { title: "" },
      {
        run: "blur",
        includeDerived: true,
        validators: {
          customFail: () => false,
        },
      },
    );

    expect(result.valid).toBe(false);
    expect(result.errorsByPath["/title"]).toBe("This field is required.");
    expect(result.errorsByPath[FORM_ERROR_PATH]).toBe("Form invalid");
  });
});

describe("Dynamic Required Validation", () => {
  it("validates when required is a literal true", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "test",
        required: true,
      },
    ];

    const invalid = await validateFields(
      fields,
      { test: "" },
      { includeDerived: true },
    );
    expect(invalid.valid).toBe(false);
    expect(invalid.errorsByPath["/test"]).toBe("This field is required.");

    const valid = await validateFields(
      fields,
      { test: "ok" },
      { includeDerived: true },
    );
    expect(valid.valid).toBe(true);
  });

  it("skips validation when required is a literal false", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "test",
        required: false,
      },
    ];

    const valid = await validateFields(
      fields,
      { test: "" },
      { includeDerived: true },
    );
    expect(valid.valid).toBe(true);
  });

  it("validates when required is an inline function returning true", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "test",
        required: ({ data }: { data: Record<string, unknown> }) =>
          data.must === true,
      },
    ];

    // Case 1: Dynamic required is ON, value is empty -> Fail
    const invalid = await validateFields(
      fields,
      { test: "", must: true },
      { includeDerived: true },
    );
    expect(invalid.valid).toBe(false);
    expect(invalid.errorsByPath["/test"]).toBe("This field is required.");

    // Case 2: Dynamic required is OFF, value is empty -> Pass
    const valid = await validateFields(
      fields,
      { test: "", must: false },
      { includeDerived: true },
    );
    expect(valid.valid).toBe(true);
  });

  it("validates when required is an AST expression ($data)", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "test",
        required: { $data: "/isNeeded", eq: true },
      },
    ];

    // Case 1: Expression resolves to true, value empty -> Fail
    const invalid = await validateFields(
      fields,
      { test: "", isNeeded: true },
      { includeDerived: true },
    );
    expect(invalid.valid).toBe(false);
    expect(invalid.errorsByPath["/test"]).toBe("This field is required.");

    // Case 2: Expression resolves to false, value empty -> Pass
    const valid = await validateFields(
      fields,
      { test: "", isNeeded: false },
      { includeDerived: true },
    );
    expect(valid.valid).toBe(true);
  });

  it("respects complex condition groups ($and/$or) as required property", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "test",
        required: {
          $or: [
            { $data: "/a", eq: 1 },
            { $data: "/b", eq: 1 },
          ],
        },
      },
    ];

    // a=1, b=0 -> Required
    const invalid1 = await validateFields(
      fields,
      { test: "", a: 1, b: 0 },
      { includeDerived: true },
    );
    expect(invalid1.valid).toBe(false);

    // a=0, b=1 -> Required
    const invalid2 = await validateFields(
      fields,
      { test: "", a: 0, b: 1 },
      { includeDerived: true },
    );
    expect(invalid2.valid).toBe(false);

    // a=0, b=0 -> Not required
    const valid = await validateFields(
      fields,
      { test: "", a: 0, b: 0 },
      { includeDerived: true },
    );
    expect(valid.valid).toBe(true);
  });
});

// ============================================================================
// Argument Resolution
// ============================================================================

describe("Validation Argument Resolution", () => {
  it("resolves all Expr variants in validator args", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "test",
        validate: {
          onSubmit: {
            checks: [
              {
                type: "minLength",
                message: "Too short (data)",
                args: { min: { $data: "/minLen" } },
              },
              {
                type: "maxLength",
                message: "Too long (context)",
                args: { max: { $context: "/maxLen" } },
              },
              {
                type: "required",
                message: "Required (fn)",
                args: { isRequired: { $fn: "checkRequired" } },
              },
              {
                type: "pattern",
                message: "Invalid (when)",
                args: {
                  pattern: {
                    $when: { $data: "/mode", eq: "strict" },
                    $then: "^strict$",
                    $else: ".*",
                  },
                },
              },
            ],
          },
        },
      },
    ];

    const ctx = {
      minLen: 5,
      mode: "strict",
    };
    const extCtx = {
      maxLen: 10,
    };
    const validators = {
      checkRequired: () => true,
    };

    // 1. All pass
    const pass = await validateFields(
      fields,
      { ...ctx, test: "strict" },
      {
        contextData: extCtx,
        validators,
      },
    );
    expect(pass.valid).toBe(true);

    // 2. Data ref fails (minLen=5, value="short" is 5, but wait... "short" is length 5. let's use "abc" length 3)
    const dataFail = await validateFields(
      fields,
      { ...ctx, test: "abc" },
      {
        contextData: extCtx,
        validators,
      },
    );
    expect(dataFail.errorsByPath["/test"]).toBe("Too short (data)");

    // 3. Context ref fails (maxLen=10, value="longerthan10" is 12)
    const contextFail = await validateFields(
      fields,
      { ...ctx, test: "longerthan10" },
      {
        contextData: extCtx,
        validators,
      },
    );
    expect(contextFail.errorsByPath["/test"]).toBe("Too long (context)");

    // 4. When ref fails (mode=strict, value="abc" fails ^strict$)
    const whenFail = await validateFields(
      fields,
      { ...ctx, test: "abc", minLen: 1 },
      {
        contextData: extCtx,
        validators,
      },
    );
    expect(whenFail.errorsByPath["/test"]).toBe("Invalid (when)");
  });

  it("resolves logical groups in boolean validator args", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "test",
        validate: {
          onSubmit: {
            checks: [
              {
                type: "required",
                message: "Conditionally Required",
                args: {
                  isRequired: { $and: [{ $data: "/a" }, { $data: "/b" }] },
                },
              },
            ],
          },
        },
      },
    ];

    // both true -> required -> empty value fails
    const fail = await validateFields(fields, { a: true, b: true, test: "" });
    expect(fail.valid).toBe(false);

    // one false -> not required -> empty value passes
    const pass = await validateFields(fields, { a: true, b: false, test: "" });
    expect(pass.valid).toBe(true);
  });

  it("resolves inline functions in validator args", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "test",
        validate: {
          onSubmit: {
            checks: [
              {
                type: "minLength",
                message: "Too short (inline)",
                args: {
                  min: (ctx: ExprContext) =>
                    (ctx.context?.minOverride as number) || 10,
                },
              },
            ],
          },
        },
      },
    ];

    const ctx = { test: "short" }; // len 5
    const extCtx = { minOverride: 3 };

    // 1. Pass with context override (len 5 >= 3)
    const pass = await validateFields(fields, ctx, { contextData: extCtx });
    expect(pass.valid).toBe(true);

    // 2. Fail with default (len 5 < 10)
    const fail = await validateFields(fields, ctx, { contextData: {} });
    expect(fail.valid).toBe(false);
  });
});

// ============================================================================
// Dynamic Messages
// ============================================================================

describe("Dynamic Validation Messages", () => {
  it("resolves $text interpolation in custom messages", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "test",
        validate: {
          onSubmit: {
            checks: [
              {
                type: "minLength",
                message: { $text: "Need ${/args/min} got ${/test}" },
                args: { min: 10 },
              },
            ],
          },
        },
      },
    ];

    const result = await validateFields(fields, { test: "short" });
    expect(result.errorsByPath["/test"]).toBe("Need 10 got short");
  });

  it("resolves conditional messages based on form state", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "test",
        validate: {
          onSubmit: {
            checks: [
              {
                type: "required",
                message: {
                  $when: { $data: "/isUrgent", eq: true },
                  $then: "URGENT: Required!",
                  $else: "Please fill this.",
                },
                args: { isRequired: true },
              },
            ],
          },
        },
      },
    ];

    const urgentFail = await validateFields(fields, { test: "", isUrgent: true });
    expect(urgentFail.errorsByPath["/test"]).toBe("URGENT: Required!");

    const normalFail = await validateFields(fields, { test: "", isUrgent: false });
    expect(normalFail.errorsByPath["/test"]).toBe("Please fill this.");
  });

  it("resolves derived dynamic messages", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "test",
        minLength: 5,
      },
    ];

    const result = await validateFields(fields, { test: "abc" }, { includeDerived: true });
    expect(result.errorsByPath["/test"]).toBe("Must be at least 5 characters.");
  });

  describe("upload validators", () => {
    it("validates derived min, max, and maxSize check for upload fields", async () => {
      const fields = [
        {
          type: "upload" as const,
          name: "files",
          min: 2,
          max: 3,
          maxSize: 5000, // 5000 bytes
        },
      ];

      // Test size validation on File mocks in node environment (which defaults to true inside node checkSize)
      // Since window is undefined in node/vitest, let's mock it or test the checkSize directly
      expect(builtInValidators.maxSize("some-url", { max: 1000 })).toBe(true);

      // In JSDOM, window is defined, so File size check runs! Let's build a mock File
      const mockFileSmall = { size: 1000, name: "small.png" } as unknown as File;
      const mockFileLarge = { size: 9000, name: "large.png" } as unknown as File;

      expect(builtInValidators.maxSize(mockFileSmall, { max: 5000 })).toBe(true);
      expect(builtInValidators.maxSize(mockFileLarge, { max: 5000 })).toBe(false);

      // Test min/max array counts derived rules
      const tooFew = await validateFields(
        fields,
        { files: ["a"] },
        { run: "blur", includeDerived: true },
      );
      expect(tooFew.errorsByPath["/files"]).toBe("Upload at least 2 file(s).");

      const tooMany = await validateFields(
        fields,
        { files: ["a", "b", "c", "d"] },
        { run: "blur", includeDerived: true },
      );
      expect(tooMany.errorsByPath["/files"]).toBe("Upload at most 3 file(s).");
    });
  });
});
