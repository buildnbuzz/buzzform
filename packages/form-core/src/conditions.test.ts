import { describe, it, expect } from "vitest";
import { evaluateVisibility } from "./conditions";

describe("evaluateVisibility", () => {
  it("evaluates basic comparisons and not", () => {
    const ctx = { formData: { age: 20, name: "Ada" } };

    expect(
      evaluateVisibility({ $data: "/age", gt: 18 }, ctx),
    ).toBe(true);

    expect(
      evaluateVisibility({ $data: "/age", lte: 18 }, ctx),
    ).toBe(false);

    expect(
      evaluateVisibility({ $data: "/name", startsWith: "Ad" }, ctx),
    ).toBe(true);

    expect(
      evaluateVisibility({ $data: "/name", contains: "x", not: true }, ctx),
    ).toBe(true);
  });

  it("supports implicit AND arrays", () => {
    const ctx = { formData: { age: 20, name: "Ada" } };

    const condition = [
      { $data: "/age", gte: 18 },
      { $data: "/name", eq: "Ada" },
    ] as const;

    expect(evaluateVisibility(condition, ctx)).toBe(true);
  });

  it("supports explicit AND/OR groups", () => {
    const ctx = { formData: { score: 5, tier: "gold" } };

    expect(
      evaluateVisibility(
        { $and: [{ $data: "/score", gt: 3 }, { $data: "/tier", eq: "gold" }] },
        ctx,
      ),
    ).toBe(true);

    expect(
      evaluateVisibility(
        { $or: [{ $data: "/score", lt: 3 }, { $data: "/tier", eq: "gold" }] },
        ctx,
      ),
    ).toBe(true);
  });

  it("resolves $context references", () => {
    const ctx = {
      formData: {},
      contextData: { role: "admin" },
    };

    expect(
      evaluateVisibility({ $context: "/role", eq: "admin" }, ctx),
    ).toBe(true);
  });

  it("handles JSON Pointer array indices", () => {
    const ctx = { formData: { items: [{ id: 1 }, { id: 2 }] } };

    expect(
      evaluateVisibility({ $data: "/items/1/id", eq: 2 }, ctx),
    ).toBe(true);
  });
});
