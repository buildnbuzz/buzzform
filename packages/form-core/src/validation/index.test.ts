import { describe, it, expect } from "vitest";
import type { ValidationCheck } from "../types";
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
