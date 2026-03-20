import { describe, it, expect } from "vitest";
import { resolveDynamicValue } from "./dynamic";

describe("resolveDynamicValue", () => {
  it("returns literal values", () => {
    expect(resolveDynamicValue("hi", {})).toBe("hi");
    expect(resolveDynamicValue(42, {})).toBe(42);
  });

  it("resolves $data pointers", () => {
    const data = { user: { name: "Ada" } };
    expect(resolveDynamicValue({ $data: "/user/name" }, data)).toBe("Ada");
  });

  it("resolves $context pointers", () => {
    const data = {};
    const context = { role: "admin" };
    expect(
      resolveDynamicValue({ $context: "/role" }, data, context),
    ).toBe("admin");
  });

  it("returns undefined for missing pointers", () => {
    const data = { user: {} };
    expect(resolveDynamicValue({ $data: "/user/age" }, data)).toBeUndefined();
  });
});
