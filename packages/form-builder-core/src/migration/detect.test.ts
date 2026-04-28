import { describe, it, expect } from "vitest";
import { detectSchemaFormat } from "./detect";

describe("detectSchemaFormat", () => {
  it("should return unknown for non-objects or missing fields array", () => {
    expect(detectSchemaFormat(null)).toBe("unknown");
    expect(detectSchemaFormat({})).toBe("unknown");
    expect(detectSchemaFormat({ fields: "not-an-array" })).toBe("unknown");
  });

  it("should default to form-core for empty fields array", () => {
    expect(detectSchemaFormat({ fields: [] })).toBe("form-core");
  });

  it("should detect buzzform-legacy based on admin prop", () => {
    expect(
      detectSchemaFormat({
        fields: [{ type: "text", name: "test", admin: { readOnly: true } }],
      })
    ).toBe("buzzform-legacy");
  });

  it("should detect buzzform-legacy based on type: datetime", () => {
    expect(
      detectSchemaFormat({
        fields: [{ type: "datetime", name: "date" }],
      })
    ).toBe("buzzform-legacy");
  });

  it("should detect buzzform-legacy based on component prop", () => {
    expect(
      detectSchemaFormat({
        fields: [{ type: "text", name: "test", component: "Input" }],
      })
    ).toBe("buzzform-legacy");
  });

  it("should detect form-core based on Expr structure in condition", () => {
    expect(
      detectSchemaFormat({
        fields: [
          {
            type: "text",
            name: "test",
            condition: { $: "==", args: [{ $: "field", name: "other" }, "val"] },
          },
        ],
      })
    ).toBe("form-core");
  });

  it("should default to form-core for ambiguous simple schemas", () => {
    expect(
      detectSchemaFormat({
        fields: [{ type: "text", name: "simple" }],
      })
    ).toBe("form-core");
  });
});
