import { describe, it, expect } from "vitest";
import {
  getByPath,
  setByPath,
  escapePointer,
  toDotNotation,
  fromDotNotation,
  normalizeArrayIndicesToWildcard,
  splitPointer,
} from "./path";

describe("getByPath", () => {
  it("returns root object for empty pointer", () => {
    const obj = { a: 1 };
    expect(getByPath(obj, "")).toBe(obj);
    expect(getByPath(obj, "/")).toBe(obj);
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

  it("sets values by JSON Pointer paths", () => {
    const obj: Record<string, unknown> = {};
    setByPath(obj, "/user/name", "Ada");
    setByPath(obj, "/user/age", 42);

    expect(obj).toEqual({ user: { name: "Ada", age: 42 } });
  });

  it("overwrites primitive intermediates to continue nested writes", () => {
    const obj: Record<string, unknown> = {
      user: "Ada",
    };

    setByPath(obj, "/user/name", "Grace");

    expect(obj).toEqual({
      user: { name: "Grace" },
    });
  });

  it("creates nested arrays and objects for mixed paths", () => {
    const obj: Record<string, unknown> = {};

    setByPath(obj, "/groups/0/users/1/name", "Ada");

    expect(obj).toEqual({
      groups: [
        {
          users: [undefined, { name: "Ada" }],
        },
      ],
    });
  });

  it("supports appending to arrays with '-'", () => {
    const obj: Record<string, unknown> = {
      tags: ["one"],
    };

    setByPath(obj, "/tags/-", "two");

    expect(obj).toEqual({
      tags: ["one", "two"],
    });
  });

  it("allows object-like writes on arrays for non-numeric segments", () => {
    const obj: Record<string, unknown> = {
      items: [],
    };

    setByPath(obj, "/items/meta/label", "Collection");

    expect((obj.items as Record<string, unknown>[] & Record<string, unknown>).meta)
      .toEqual({
        label: "Collection",
      });
  });

  it("handles escaped pointer segments during writes", () => {
    const obj: Record<string, unknown> = {};

    setByPath(obj, "/a~1b/c~0d", 5);

    expect(obj).toEqual({
      "a/b": {
        "c~d": 5,
      },
    });
  });

  it("escapes JSON Pointer segments", () => {
    expect(escapePointer("a/b")).toBe("a~1b");
    expect(escapePointer("c~d")).toBe("c~0d");
  });

  it("converts JSON Pointer paths to dot notation", () => {
    expect(toDotNotation("/profile/name")).toBe("profile.name");
    expect(toDotNotation("/items/0/label")).toBe("items.0.label");
    expect(toDotNotation("")).toBe("");
  });

  it("converts dot notation to JSON Pointer paths", () => {
    expect(fromDotNotation("profile.name")).toBe("/profile/name");
    expect(fromDotNotation("items.0.label")).toBe("/items/0/label");
    expect(fromDotNotation("")).toBe("/");
    expect(fromDotNotation("/already/pointer")).toBe("/already/pointer");
  });

  it("normalizes array indices to wildcard segments", () => {
    expect(normalizeArrayIndicesToWildcard("/items/0/label")).toBe(
      "/items/*/label",
    );
    expect(normalizeArrayIndicesToWildcard("/profile/tags/12/value")).toBe(
      "/profile/tags/*/value",
    );
  });

  it("splits JSON Pointer paths into unescaped segments", () => {
    expect(splitPointer("/items/0/a~1b/c~0d")).toEqual([
      "items",
      "0",
      "a/b",
      "c~d",
    ]);
  });
});
