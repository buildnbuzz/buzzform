import { describe, it, expect } from "vitest";
import { migrateLegacySchema } from "./index";

describe("migrateLegacySchema", () => {
  it("throws error for unknown schema", () => {
    expect(() => migrateLegacySchema({})).toThrow("Invalid schema format");
  });

  it("passes through form-core schema unchanged without warnings", () => {
    const input = { fields: [{ type: "text", name: "test" }] };
    const { schema, warnings } = migrateLegacySchema(input);
    expect(schema).toEqual(input);
    expect(warnings).toHaveLength(0);
  });

  it("migrates legacy schema and collects warnings", () => {
    const legacy = {
      title: "My Form",
      fields: [
        { type: "datetime", name: "d1" },
        { type: "text", name: "t1", component: "Input" }
      ]
    };
    
    const { schema, warnings } = migrateLegacySchema(legacy);
    
    expect(schema).toHaveProperty("title", "My Form");
    expect(schema.fields[0]?.type).toBe("date");
    expect(schema.fields[0]).toHaveProperty("withTime", true);
    expect(schema.fields[1]).not.toHaveProperty("component");
    
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("Stripped");
  });
});
