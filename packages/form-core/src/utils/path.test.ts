import { describe, it, expect } from "vitest";
import { getByPath } from "./path";

describe("getByPath", () => {
  it("returns root object for empty pointer", () => {
    const obj = { a: 1 };
    expect(getByPath(obj, "")).toBe(obj);
  });

  it("resolves nested object paths", () => {
    const obj = { user: { name: "Ada" } };
    expect(getByPath(obj, "/user/name")).toBe("Ada");
  });

  it("resolves array indices", () => {
    const obj = { items: [{ id: 1 }, { id: 2 }] };
    expect(getByPath(obj, "/items/1/id")).toBe(2);
  });

  it("returns undefined for invalid pointers", () => {
    const obj = { user: { name: "Ada" } };
    expect(getByPath(obj, "user/name")).toBeUndefined();
    expect(getByPath(obj, "/missing")).toBeUndefined();
  });

  it("unescapes JSON Pointer tokens", () => {
    const obj = { "a/b": { "c~d": 5 } };
    expect(getByPath(obj, "/a~1b/c~0d")).toBe(5);
  });
});
