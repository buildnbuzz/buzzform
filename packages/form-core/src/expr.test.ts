import { describe, it, expect } from "vitest";
import { resolveExpr } from "./expr";
import type { ExprContext, FnRegistry } from "./types";

// ============================================================================
// Helpers
// ============================================================================

const ctx: (overrides?: Partial<ExprContext>) => ExprContext = (
  overrides = {},
) => ({
  data: { name: "Ada", age: 30, active: true, role: "admin", tags: ["a", "b"] },
  context: { permissions: ["read", "write"], region: "eu" },
  ...overrides,
});

// ============================================================================
// Primitives
// ============================================================================

describe("resolveExpr — primitives", () => {
  it("returns undefined for undefined input", () => {
    expect(resolveExpr(undefined, ctx())).toBeUndefined();
  });

  it("returns literal primitives unchanged", () => {
    expect(resolveExpr("hello", ctx())).toBe("hello");
    expect(resolveExpr(42, ctx())).toBe(42);
    expect(resolveExpr(true, ctx())).toBe(true);
    expect(resolveExpr(null as never, ctx())).toBeNull();
  });

  it("returns literal objects unchanged", () => {
    const obj = { a: 1 };
    expect(resolveExpr(obj, ctx())).toBe(obj);
  });
});

// ============================================================================
// $data references
// ============================================================================

describe("resolveExpr — $data", () => {
  it("resolves $data pointers from ctx.data", () => {
    expect(resolveExpr({ $data: "/name" }, ctx())).toBe("Ada");
    expect(resolveExpr({ $data: "/age" }, ctx())).toBe(30);
    expect(resolveExpr({ $data: "/active" }, ctx())).toBe(true);
  });

  it("resolves nested $data paths", () => {
    expect(resolveExpr({ $data: "/role" }, ctx())).toBe("admin");
  });

  it("returns undefined for missing paths", () => {
    expect(resolveExpr({ $data: "/missing" }, ctx())).toBeUndefined();
  });

  it("resolves array indices", () => {
    expect(resolveExpr({ $data: "/tags/0" }, ctx())).toBe("a");
    expect(resolveExpr({ $data: "/tags/1" }, ctx())).toBe("b");
    expect(resolveExpr({ $data: "/tags/99" }, ctx())).toBeUndefined();
  });
});

// ============================================================================
// $context references
// ============================================================================

describe("resolveExpr — $context", () => {
  it("resolves $context pointers from ctx.context", () => {
    expect(resolveExpr({ $context: "/region" }, ctx())).toBe("eu");
    expect(resolveExpr({ $context: "/permissions/0" }, ctx())).toBe("read");
  });

  it("returns undefined for missing context paths", () => {
    expect(resolveExpr({ $context: "/missing" }, ctx())).toBeUndefined();
  });

  it("returns undefined when context is not set", () => {
    expect(resolveExpr({ $context: "/x" }, ctx({ context: undefined }))).toBeUndefined();
  });
});

// ============================================================================
// $text template interpolation
// ============================================================================

describe("resolveExpr — $text", () => {
  it("interpolates ${/path} references from data", () => {
    expect(resolveExpr({ $text: "Hello, ${/name}!" }, ctx())).toBe("Hello, Ada!");
    expect(resolveExpr({ $text: "Age: ${/age}" }, ctx())).toBe("Age: 30");
  });

  it("leaves unmatched paths as-is", () => {
    expect(resolveExpr({ $text: "Value: ${/missing}" }, ctx())).toBe("Value: ");
  });

  it("handles multiple interpolations", () => {
    expect(resolveExpr({ $text: "${/name} is ${/age}" }, ctx())).toBe("Ada is 30");
  });
});

// ============================================================================
// $when / $then / $else branching
// ============================================================================

describe("resolveExpr — $when", () => {
  it("resolves $then when predicate is truthy", () => {
    expect(
      resolveExpr(
        { $when: true, $then: "yes", $else: "no" },
        ctx(),
      ),
    ).toBe("yes");
  });

  it("resolves $else when predicate is falsy", () => {
    expect(
      resolveExpr(
        { $when: false, $then: "yes", $else: "no" },
        ctx(),
      ),
    ).toBe("no");
  });

  it("evaluates atomic conditions as predicate", () => {
    expect(
      resolveExpr(
        {
          $when: { $data: "/role", eq: "admin" },
          $then: "allowed",
          $else: "denied",
        },
        ctx(),
      ),
    ).toBe("allowed");

    expect(
      resolveExpr(
        {
          $when: { $data: "/role", eq: "superadmin" },
          $then: "allowed",
          $else: "denied",
        },
        ctx(),
      ),
    ).toBe("denied");
  });

  it("supports implicit AND arrays as predicate", () => {
    expect(
      resolveExpr(
        {
          $when: [{ $data: "/active" }, { $data: "/role", eq: "admin" }],
          $then: "yes",
          $else: "no",
        },
        ctx(),
      ),
    ).toBe("yes");

    expect(
      resolveExpr(
        {
          $when: [{ $data: "/active" }, { $data: "/role", eq: "guest" }],
          $then: "yes",
          $else: "no",
        },
        ctx(),
      ),
    ).toBe("no");
  });

  it("supports nested $when in $then/$else", () => {
    expect(
      resolveExpr(
        {
          $when: { $data: "/region", eq: "us" },
          $then: "US",
          $else: {
            $when: { $context: "/region", eq: "eu" },
            $then: "EU",
            $else: "other",
          },
        },
        ctx(),
      ),
    ).toBe("EU");
  });
});

// ============================================================================
// $fn registry calls
// ============================================================================

describe("resolveExpr — $fn", () => {
  const fns: FnRegistry = {
    upper: ({ args }) => String(args?.text).toUpperCase(),
    greet: (c) => `Hello, ${c.data.name}!`,
    check: ({ args }) => args?.value === true,
    nested: (c) => String(c.args?.prefix) + String(c.data?.age),
  };

  it("calls registered functions", () => {
    expect(
      resolveExpr({ $fn: "upper", args: { text: "hello" } }, ctx(), fns),
    ).toBe("HELLO");
  });

  it("passes ctx.data to functions", () => {
    expect(resolveExpr({ $fn: "greet" }, ctx(), fns)).toBe("Hello, Ada!");
  });

  it("returns undefined for unregistered names", () => {
    expect(resolveExpr({ $fn: "missing" }, ctx(), fns)).toBeUndefined();
  });

  it("works without fn registry", () => {
    expect(resolveExpr({ $fn: "missing" }, ctx())).toBeUndefined();
  });
});

// ============================================================================
// Inline functions
// ============================================================================

describe("resolveExpr — inline functions", () => {
  it("evaluates inline functions with ExprContext", () => {
    const fn = (c: ExprContext) => c.data.name === "Ada";
    expect(resolveExpr(fn, ctx())).toBe(true);
    expect(resolveExpr(fn, ctx({ data: { name: "Bob" } }))).toBe(false);
  });

  it("returns function result as T", () => {
    const fn = () => 42 as number;
    expect(resolveExpr(fn, ctx())).toBe(42);
  });
});

// ============================================================================
// Arrays — implicit AND for Expr<boolean>
// ============================================================================

describe("resolveExpr — arrays (implicit AND)", () => {
  it("returns true when all items are truthy", () => {
    expect(
      resolveExpr([{ $data: "/active" }, { $data: "/age", gt: 18 }], ctx()),
    ).toBe(true);
  });

  it("returns false when any item is falsy", () => {
    expect(
      resolveExpr([{ $data: "/active" }, { $data: "/age", lt: 18 }], ctx()),
    ).toBe(false);
  });

  it("handles empty arrays", () => {
    expect(resolveExpr([] as never, ctx())).toBe(true);
  });
});

// ============================================================================
// Condition groups — $and / $or
// ============================================================================

describe("resolveExpr — $and / $or", () => {
  it("$and returns true when all children pass", () => {
    expect(
      resolveExpr(
        { $and: [{ $data: "/active" }, { $data: "/age", gt: 18 }] },
        ctx(),
      ),
    ).toBe(true);
  });

  it("$and returns false when any child fails", () => {
    expect(
      resolveExpr(
        { $and: [{ $data: "/active" }, { $data: "/age", lt: 18 }] },
        ctx(),
      ),
    ).toBe(false);
  });

  it("$or returns true when any child passes", () => {
    expect(
      resolveExpr(
        { $or: [{ $data: "/active" }, { $data: "/age", lt: 18 }] },
        ctx(),
      ),
    ).toBe(true);
  });

  it("$or returns false when all children fail", () => {
    expect(
      resolveExpr(
        { $or: [{ $data: "/missing" }, { $data: "/age", lt: 18 }] },
        ctx(),
      ),
    ).toBe(false);
  });

  it("supports nested $and/$or", () => {
    expect(
      resolveExpr(
        {
          $and: [
            { $data: "/active" },
            { $or: [{ $data: "/role", eq: "admin" }, { $data: "/role", eq: "mod" }] },
          ],
        },
        ctx(),
      ),
    ).toBe(true);
  });
});

// ============================================================================
// Comparison operators in AtomicCondition
// ============================================================================

describe("resolveExpr — comparison operators", () => {
  it("eq/neq", () => {
    expect(
      resolveExpr<boolean>({ $data: "/role", eq: "admin" }, ctx()),
    ).toBe(true);
    expect(
      resolveExpr<boolean>({ $data: "/role", neq: "admin" }, ctx()),
    ).toBe(false);
    expect(
      resolveExpr<boolean>({ $data: "/role", neq: "guest" }, ctx()),
    ).toBe(true);
  });

  it("gt/gte/lt/lte", () => {
    expect(
      resolveExpr<boolean>({ $data: "/age", gt: 29 }, ctx()),
    ).toBe(true);
    expect(
      resolveExpr<boolean>({ $data: "/age", gt: 30 }, ctx()),
    ).toBe(false);
    expect(
      resolveExpr<boolean>({ $data: "/age", gte: 30 }, ctx()),
    ).toBe(true);
    expect(
      resolveExpr<boolean>({ $data: "/age", lt: 31 }, ctx()),
    ).toBe(true);
    expect(
      resolveExpr<boolean>({ $data: "/age", lte: 30 }, ctx()),
    ).toBe(true);
  });

  it("contains/startsWith/endsWith", () => {
    expect(
      resolveExpr<boolean>({ $data: "/name", contains: "d" }, ctx()),
    ).toBe(true);
    expect(
      resolveExpr<boolean>({ $data: "/name", startsWith: "Ad" }, ctx()),
    ).toBe(true);
    expect(
      resolveExpr<boolean>({ $data: "/name", endsWith: "a" }, ctx()),
    ).toBe(true);
  });

  it("not negation", () => {
    expect(
      resolveExpr<boolean>({ $data: "/role", eq: "guest", not: true }, ctx()),
    ).toBe(true);
    expect(
      resolveExpr<boolean>({ $data: "/role", eq: "admin", not: true }, ctx()),
    ).toBe(false);
  });

  it("resolves RHS as Expr values", () => {
    expect(
      resolveExpr<boolean>({ $data: "/name", eq: { $data: "/name" } }, ctx()),
    ).toBe(true);
  });
});

// ============================================================================
// $context in AtomicCondition
// ============================================================================

describe("resolveExpr — $context in conditions", () => {
  it("evaluates $context conditions", () => {
    expect(
      resolveExpr<boolean>({ $context: "/region", eq: "eu" }, ctx()),
    ).toBe(true);
    expect(
      resolveExpr<boolean>({ $context: "/region", neq: "us" }, ctx()),
    ).toBe(true);
  });
});

// ============================================================================
// Undefined handling
// ============================================================================

describe("resolveExpr — undefined handling", () => {
  it("returns undefined for undefined input", () => {
    expect(resolveExpr(undefined, ctx())).toBeUndefined();
  });

  it("returns undefined for $fn with no registry match", () => {
    expect(resolveExpr({ $fn: "nope" }, ctx())).toBeUndefined();
  });
});

// ============================================================================
// Edge cases
// ============================================================================

describe("resolveExpr — edge cases", () => {
  it("handles null data value", () => {
    expect(resolveExpr({ $data: "/x" }, ctx({ data: { x: null } }))).toBeNull();
  });

  it("handles zero value", () => {
    expect(resolveExpr({ $data: "/x" }, ctx({ data: { x: 0 } }))).toBe(0);
  });

  it("handles empty string", () => {
    expect(resolveExpr({ $data: "/x" }, ctx({ data: { x: "" } }))).toBe("");
  });
});
