import { describe, it, expect } from "vitest";
import type { ExpressionGroup } from "../types";
import {
  findContainer,
  isGroupNode,
  findNode,
  isExpressionDescendant,
} from "./expressions";

const makeGroup = (
  id: string,
  children: ExpressionGroup["children"] = []
): ExpressionGroup => ({
  id,
  type: "group",
  logicalOperator: "AND",
  children,
});

const makeRule = (id: string) => ({
  id,
  type: "rule" as const,
  fieldId: "name",
  operator: "equals" as const,
  value: "test",
});

describe("findContainer", () => {
  it("returns parent id for a direct rule child", () => {
    const root = makeGroup("root", [makeRule("r1"), makeRule("r2")]);
    expect(findContainer("r1", root)).toBe("root");
  });

  it("returns parent id for a nested group child", () => {
    const inner = makeGroup("inner", [makeRule("r1")]);
    const root = makeGroup("root", [inner]);
    expect(findContainer("r1", root)).toBe("inner");
    expect(findContainer("inner", root)).toBe("root");
  });

  it("returns null when id not found", () => {
    const root = makeGroup("root", [makeRule("r1")]);
    expect(findContainer("missing", root)).toBeNull();
  });
});

describe("isGroupNode", () => {
  it("returns true for the root itself", () => {
    const root = makeGroup("root");
    expect(isGroupNode("root", root)).toBe(true);
  });

  it("returns true for a nested group", () => {
    const inner = makeGroup("inner");
    const root = makeGroup("root", [inner]);
    expect(isGroupNode("inner", root)).toBe(true);
  });

  it("returns false for a rule node", () => {
    const root = makeGroup("root", [makeRule("r1")]);
    expect(isGroupNode("r1", root)).toBe(false);
  });

  it("returns false for an unknown id", () => {
    const root = makeGroup("root");
    expect(isGroupNode("nope", root)).toBe(false);
  });
});

describe("findNode", () => {
  it("finds the root itself", () => {
    const root = makeGroup("root");
    expect(findNode("root", root)).toBe(root);
  });

  it("finds a direct rule child", () => {
    const r1 = makeRule("r1");
    const root = makeGroup("root", [r1]);
    expect(findNode("r1", root)).toEqual(r1);
  });

  it("finds a deeply nested rule", () => {
    const r1 = makeRule("r1");
    const inner = makeGroup("inner", [r1]);
    const root = makeGroup("root", [inner]);
    expect(findNode("r1", root)).toEqual(r1);
  });

  it("returns null when not found", () => {
    const root = makeGroup("root");
    expect(findNode("ghost", root)).toBeNull();
  });
});

describe("isExpressionDescendant", () => {
  it("returns true when targetId is a direct child", () => {
    const r1 = makeRule("r1");
    const root = makeGroup("root", [r1]);
    expect(isExpressionDescendant("root", "r1", root)).toBe(true);
  });

  it("returns true when targetId is a nested child", () => {
    const r1 = makeRule("r1");
    const inner = makeGroup("inner", [r1]);
    const root = makeGroup("root", [inner]);
    expect(isExpressionDescendant("root", "r1", root)).toBe(true);
    expect(isExpressionDescendant("inner", "r1", root)).toBe(true);
  });

  it("returns false when parentId is not a group node", () => {
    const r1 = makeRule("r1");
    const r2 = makeRule("r2");
    const root = makeGroup("root", [r1, r2]);
    // r1 is a rule, not a group — can't be parent
    expect(isExpressionDescendant("r1", "r2", root)).toBe(false);
  });

  it("returns false when targetId is not a descendant", () => {
    const inner = makeGroup("inner", [makeRule("r1")]);
    const root = makeGroup("root", [inner, makeRule("r2")]);
    expect(isExpressionDescendant("inner", "r2", root)).toBe(false);
  });

  it("returns false when parentId not found", () => {
    const root = makeGroup("root", [makeRule("r1")]);
    expect(isExpressionDescendant("ghost", "r1", root)).toBe(false);
  });
});
