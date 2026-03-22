import { describe, expect, it } from "vitest";
import type { FormSchema } from "@buildnbuzz/form-core";
import { buildStandardSchemaValidator } from "./validator";

describe("buildStandardSchemaValidator", () => {
  it("returns issues for field-level submit validations with field paths", async () => {
    const schema: FormSchema = {
      fields: [
        {
          type: "text",
          name: "email",
          validate: {
            onSubmit: {
              checks: [{ type: "email", message: "Invalid email" }],
            },
            onChange: {
              checks: [
                { type: "minLength", args: { min: 5 }, message: "Short" },
              ],
            },
          },
        },
      ],
    };

    const validator = buildStandardSchemaValidator(schema);
    const result = await validator["~standard"].validate({
      email: "not-an-email",
    });

    expect("issues" in result).toBe(true);
    if ("issues" in result && result.issues) {
      expect(result.issues[0]?.message).toBe("Invalid email");
      expect(result.issues[0]?.path).toEqual(["email"]);
    }
  });

  it("skips non-required checks when the field value is empty", async () => {
    const schema: FormSchema = {
      fields: [
        {
          type: "text",
          name: "nickname",
          validate: {
            onSubmit: {
              checks: [
                { type: "minLength", args: { min: 3 }, message: "Short" },
              ],
            },
          },
        },
      ],
    };

    const validator = buildStandardSchemaValidator(schema);
    const result = await validator["~standard"].validate({ nickname: "" });

    expect("issues" in result).toBe(false);
  });

  it("includes derived required checks on submit by default", async () => {
    const schema: FormSchema = {
      fields: [
        {
          type: "text",
          name: "inviteCode",
          required: true,
        },
      ],
    };

    const validator = buildStandardSchemaValidator(schema);
    const result = await validator["~standard"].validate({ inviteCode: "" });

    expect("issues" in result).toBe(true);
    if ("issues" in result && result.issues) {
      expect(result.issues[0]?.message).toBe("This field is required.");
      expect(result.issues[0]?.path).toEqual(["inviteCode"]);
    }
  });

  it("supports wildcard pointers for array field checks", async () => {
    const schema: FormSchema = {
      fields: [
        {
          type: "array",
          name: "users",
          fields: [
            {
              type: "text",
              name: "email",
              validate: {
                onSubmit: {
                  checks: [{ type: "email", message: "Invalid user email" }],
                },
              },
            },
          ],
        },
      ],
    };

    const validator = buildStandardSchemaValidator(schema);
    const result = await validator["~standard"].validate({
      users: [{ email: "a@example.com" }, { email: "bad-email" }],
    });

    expect("issues" in result).toBe(true);
    if ("issues" in result && result.issues) {
      expect(result.issues[0]?.message).toBe("Invalid user email");
      expect(result.issues[0]?.path).toEqual(["users", "1", "email"]);
    }
  });

  it("attaches form-level errors to root when no path is provided", async () => {
    const schema: FormSchema = {
      fields: [{ type: "number", name: "min" }],
      validate: {
        onSubmit: {
          checks: [{ type: "alwaysFail", message: "Form invalid" }],
        },
      },
    };

    const validator = buildStandardSchemaValidator(schema, {
      customValidators: { alwaysFail: () => false },
    });
    const result = await validator["~standard"].validate({ min: 1 });

    expect("issues" in result).toBe(true);
    if ("issues" in result && result.issues) {
      expect(result.issues[0]?.message).toBe("Form invalid");
      expect(result.issues[0]?.path).toEqual([]);
    }
  });

  it("attaches form-level errors to provided path", async () => {
    const schema: FormSchema = {
      fields: [{ type: "number", name: "min" }],
      validate: {
        onSubmit: {
          checks: [
            {
              type: "alwaysFail",
              message: "Min invalid",
              args: { path: "/min" },
            },
          ],
        },
      },
    };

    const validator = buildStandardSchemaValidator(schema, {
      customValidators: { alwaysFail: () => false },
    });
    const result = await validator["~standard"].validate({ min: 1 });

    expect("issues" in result).toBe(true);
    if ("issues" in result && result.issues) {
      expect(result.issues[0]?.message).toBe("Min invalid");
      expect(result.issues[0]?.path).toEqual(["min"]);
    }
  });
});
