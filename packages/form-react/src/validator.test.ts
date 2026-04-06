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

  it("supports primitive array item validations when name is omitted", async () => {
    const schema: FormSchema = {
      fields: [
        {
          type: "array",
          name: "tags",
          primitive: true,
          fields: [
            {
              type: "text",
              name: "",
              validate: {
                onSubmit: {
                  checks: [{ type: "email", message: "Invalid tag" }],
                },
              },
            },
          ],
        },
      ],
    };

    const validator = buildStandardSchemaValidator(schema);
    const result = await validator["~standard"].validate({
      tags: ["valid@example.com", "bad-email"],
    });

    expect("issues" in result).toBe(true);
    if ("issues" in result && result.issues) {
      expect(result.issues[0]?.message).toBe("Invalid tag");
      expect(result.issues[0]?.path).toEqual(["tags", "1"]);
    }
  });

  it("validates primitive array items when name property is completely omitted", async () => {
    const schema = {
      fields: [
        {
          type: "array",
          name: "tags",
          primitive: true,
          fields: [
            {
              type: "text",
              validate: {
                onSubmit: {
                  checks: [{ type: "email", message: "Invalid tag" }],
                },
              },
            },
          ],
        },
      ],
    } as FormSchema;

    const validator = buildStandardSchemaValidator(schema);
    const result = await validator["~standard"].validate({
      tags: ["valid@example.com", "bad-email"],
    });

    expect("issues" in result).toBe(true);
    if ("issues" in result && result.issues) {
      expect(result.issues[0]?.message).toBe("Invalid tag");
      expect(result.issues[0]?.path).toEqual(["tags", "1"]);
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

  describe("visibility", () => {
    it("skips validation when field condition is not met", async () => {
      const schema: FormSchema = {
        fields: [
          {
            type: "text",
            name: "firstName",
            required: true,
          },
          {
            type: "text",
            name: "lastName",
            required: true,
            condition: { $data: "/firstName", neq: "" },
          },
        ],
      };

      const validator = buildStandardSchemaValidator(schema);

      // firstName is empty, so lastName condition is false.
      // lastName should be skipped even though it is required.
      const result = await validator["~standard"].validate({
        firstName: "",
        lastName: "",
      });

      expect("issues" in result).toBe(true);
      if ("issues" in result && result.issues) {
        // Should only have error for firstName
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0]?.path).toEqual(["firstName"]);
      }
    });

    it("skips validation when field is disabled", async () => {
      const schema: FormSchema = {
        fields: [
          {
            type: "text",
            name: "lockedField",
            required: true,
            disabled: true,
          },
        ],
      };

      const validator = buildStandardSchemaValidator(schema);
      const result = await validator["~standard"].validate({
        lockedField: "",
      });

      // Disabled fields should skip validation
      expect("issues" in result).toBe(false);
    });

    it("still validates hidden fields", async () => {
      const schema: FormSchema = {
        fields: [
          {
            type: "text",
            name: "secretField",
            required: true,
            hidden: true,
          },
        ],
      };

      const validator = buildStandardSchemaValidator(schema);
      const result = await validator["~standard"].validate({
        secretField: "",
      });

      // Hidden fields should still be validated
      expect("issues" in result).toBe(true);
      if ("issues" in result && result.issues) {
        expect(result.issues[0]?.path).toEqual(["secretField"]);
      }
    });

    it("still validates readOnly fields", async () => {
      const schema: FormSchema = {
        fields: [
          {
            type: "text",
            name: "readOnlyField",
            required: true,
            readOnly: true,
          },
        ],
      };

      const validator = buildStandardSchemaValidator(schema);
      const result = await validator["~standard"].validate({
        readOnlyField: "",
      });

      // ReadOnly fields should still be validated
      expect("issues" in result).toBe(true);
      if ("issues" in result && result.issues) {
        expect(result.issues[0]?.path).toEqual(["readOnlyField"]);
      }
    });

    it("resolves relative paths in conditions during validation", async () => {
      const schema: FormSchema = {
        fields: [
          {
            type: "group",
            name: "user",
            fields: [
              { type: "text", name: "type", defaultValue: "admin" },
              {
                type: "text",
                name: "adminCode",
                required: true,
                condition: { $data: "type", eq: "admin" },
              },
            ],
          },
        ],
      };

      const validator = buildStandardSchemaValidator(schema);

      // adminCode condition is true, so it should be validated.
      const resultAdmin = await validator["~standard"].validate({
        user: { type: "admin", adminCode: "" },
      });
      expect("issues" in resultAdmin).toBe(true);

      // adminCode condition is false, so it should be skipped.
      const resultUser = await validator["~standard"].validate({
        user: { type: "guest", adminCode: "" },
      });
      expect("issues" in resultUser).toBe(false);
    });
  });
});
