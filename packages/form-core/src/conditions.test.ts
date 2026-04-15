import { describe, it, expect } from "vitest";
import { resolveExpr } from "./expr";

describe("resolveExpr (conditions)", () => {
  it("evaluates basic comparisons and not", () => {
    const ctx = { data: { age: 20, name: "Ada" } };

    expect(
      resolveExpr<boolean>({ $data: "/age", gt: 18 }, ctx),
    ).toBe(true);

    expect(
      resolveExpr<boolean>({ $data: "/age", lte: 18 }, ctx),
    ).toBe(false);

    expect(
      resolveExpr<boolean>({ $data: "/name", startsWith: "Ad" }, ctx),
    ).toBe(true);

    expect(
      resolveExpr<boolean>({ $data: "/name", contains: "x", not: true }, ctx),
    ).toBe(true);
  });

  it("supports implicit AND arrays", () => {
    const ctx = { data: { age: 20, name: "Ada" } };

    const condition = [
      { $data: "/age", gte: 18 },
      { $data: "/name", eq: "Ada" },
    ] as const;

    expect(resolveExpr<boolean>(condition, ctx)).toBe(true);
  });

  it("supports explicit AND/OR groups", () => {
    const ctx = { data: { score: 5, tier: "gold" } };

    expect(
      resolveExpr<boolean>(
        { $and: [{ $data: "/score", gt: 3 }, { $data: "/tier", eq: "gold" }] },
        ctx,
      ),
    ).toBe(true);

    expect(
      resolveExpr<boolean>(
        { $or: [{ $data: "/score", lt: 3 }, { $data: "/tier", eq: "gold" }] },
        ctx,
      ),
    ).toBe(true);
  });

  it("resolves $context references", () => {
    const ctx = {
      data: {},
      context: { role: "admin" },
    };

    expect(
      resolveExpr<boolean>({ $context: "/role", eq: "admin" }, ctx),
    ).toBe(true);
  });

  it("handles JSON Pointer array indices", () => {
    const ctx = { data: { items: [{ id: 1 }, { id: 2 }] } };

    expect(
      resolveExpr<boolean>({ $data: "/items/1/id", eq: 2 }, ctx),
    ).toBe(true);
  });
});
