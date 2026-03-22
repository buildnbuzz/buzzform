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

  it("does not include derived checks when disabled", () => {
    const field = {
      type: "text" as const,
      name: "title",
      required: true,
      minLength: 2,
      validate: {
        onSubmit: {
          checks: [{ type: "maxLength", message: "Too long", args: { max: 5 } }],
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

    const result = await validateFields(fields, { title: "" }, { run: "blur" });

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
      { run: "blur" },
    );
    expect(tooShort.errorsByPath["/code"]).toBe(
      "Must be at least 3 characters.",
    );

    const tooLong = await validateFields(
      fields,
      { code: "ABCDEF" },
      { run: "blur" },
    );
    expect(tooLong.errorsByPath["/code"]).toBe(
      "Must be at most 5 characters.",
    );

    const invalidPattern = await validateFields(
      fields,
      { code: "AbC" },
      { run: "blur" },
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

    const tooLow = await validateFields(fields, { age: 16 }, { run: "blur" });
    expect(tooLow.errorsByPath["/age"]).toBe("Must be at least 18.");

    const tooHigh = await validateFields(fields, { age: 70 }, { run: "blur" });
    expect(tooHigh.errorsByPath["/age"]).toBe("Must be at most 65.");
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

    const tooFew = await validateFields(fields, { tags: ["a"] }, { run: "blur" });
    expect(tooFew.errorsByPath["/tags"]).toBe("Select at least 2.");

    const tooMany = await validateFields(
      fields,
      { tags: ["a", "b", "c", "d"] },
      { run: "blur" },
    );
    expect(tooMany.errorsByPath["/tags"]).toBe("Select at most 3.");
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

  it("does not include derived checks on submit by default", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "title",
        required: true,
      },
    ];

    const result = await validateFields(fields, { title: "" }, { run: "submit" });

    expect(result.valid).toBe(true);
    expect(result.errorsByPath["/title"]).toBeUndefined();
  });

  it("includes derived checks when derivedRun matches run", async () => {
    const fields = [
      {
        type: "text" as const,
        name: "title",
        required: true,
      },
    ];

    const result = await validateFields(fields, { title: "" }, {
      run: "submit",
      derivedRun: "submit",
    });

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

    const result = await validateFields(fields, { title: "" }, {
      run: "submit",
      includeDerived: true,
    });

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
      { run: "blur" },
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
  it("respects derivedRun default (blur)", async () => {
    const field = {
      type: "text" as const,
      name: "title",
      required: true,
    };

    const submitResult = await validateField(field, "/title", { title: "" }, {
      run: "submit",
    });
    expect(submitResult.valid).toBe(true);

    const blurResult = await validateField(field, "/title", { title: "" }, {
      run: "blur",
    });
    expect(blurResult.valid).toBe(false);
    expect(blurResult.error).toBe("This field is required.");
  });

  it("includes derived checks when includeDerived is true", async () => {
    const field = {
      type: "number" as const,
      name: "age",
      min: 18,
    };

    const result = await validateField(field, "/age", { age: 16 }, {
      run: "submit",
      includeDerived: true,
    });

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
      { run: "blur" },
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
      { run: "blur" },
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

    const result = await validatePath(fields, "/missing", { title: "" }, {
      run: "blur",
    });

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

    const result = await validatePath(fields, "/secret/code", {
      show: false,
      secret: { code: "" },
    }, {
      run: "blur",
    });

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

    const result = await validateSchema(schema, { email: "" }, { run: "blur" });

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

    const result = await validateSchema(schema, {}, {
      run: "blur",
      validators: {
        customFail: () => false,
      },
    });

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

    const result = await validateSchema(schema, {}, {
      run: "blur",
      validators: {
        customFail: () => false,
      },
    });

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

    const result = await validateSchema(schema, { title: "" }, {
      run: "blur",
      validators: {
        customFail: () => false,
      },
    });

    expect(result.valid).toBe(false);
    expect(result.errorsByPath["/title"]).toBe("This field is required.");
    expect(result.errorsByPath[FORM_ERROR_PATH]).toBe("Form invalid");
  });
});
