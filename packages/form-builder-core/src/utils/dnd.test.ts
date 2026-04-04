import { describe, it, expect } from "vitest";

import type { Node } from "../types";
import type { Field } from "@buildnbuzz/form-core";
import { getDropLocation, canDrop, isDescendant, toSafeFileName } from "./dnd";

function createNode(
  id: string,
  field: Node["field"],
  parentId: string | null = null,
  parentSlot: string | null = null,
  children: Record<string, string[]> = { __default__: [] },
): Node {
  return {
    id,
    field,
    parentId,
    parentSlot,
    children,
  };
}

// ---------------------------------------------------------------------------
// getDropLocation
// ---------------------------------------------------------------------------

describe("getDropLocation", () => {
  it("returns root-level drop location when overId is 'root'", () => {
    const result = getDropLocation({}, ["a", "b"], "root", "after");
    expect(result).toEqual({ parentId: null, parentSlot: null, index: 2 });
  });

  it("returns null when overId doesn't exist", () => {
    const result = getDropLocation({}, ["a"], "nonexistent", "before");
    expect(result).toBeNull();
  });

  it("returns before/after location for a sibling node", () => {
    const nodes: Record<string, Node> = {
      parent: createNode("parent", { type: "group", name: "g", fields: [] }, null, null, {
        __default__: ["a", "b"],
      }),
      a: createNode("a", { type: "text", name: "x" }, "parent", null, { __default__: ["a", "b"] }),
      b: createNode("b", { type: "text", name: "y" }, "parent", null, { __default__: ["a", "b"] }),
    };
    const result = getDropLocation(nodes, ["parent"], "b", "before");
    expect(result).toEqual({ parentId: "parent", parentSlot: null, index: 1 });
  });

  it("returns inside location for a container node", () => {
    const nodes: Record<string, Node> = {
      root: createNode("root", { type: "group", name: "g", fields: [] }, null, null, {
        __default__: ["c"],
      }),
      c: createNode("c", { type: "text", name: "t" }, "root", null, { __default__: ["c"] }),
    };
    const result = getDropLocation(nodes, ["root"], "c", "inside");
    expect(result).toEqual({
      parentId: "root",
      parentSlot: null,
      index: 1,
    });
  });

  it("returns inside location for a tabs node (first tab slot)", () => {
    const nodes: Record<string, Node> = {
      tabs: createNode("tabs", {
        type: "tabs" as const,
        tabs: [{ name: "tabA", label: "A", fields: [] }],
      }, null, null, { tabA: ["c"] }),
      c: createNode("c", { type: "text", name: "t" }, "tabs", "tabA", { __default__: [] }),
    };
    const result = getDropLocation(nodes, ["tabs"], "tabs", "inside");
    expect(result).toEqual({
      parentId: "tabs",
      parentSlot: "tabA",
      index: 1,
    });
  });
});

// ---------------------------------------------------------------------------
// canDrop
// ---------------------------------------------------------------------------

describe("canDrop", () => {
  it("returns false when childType is undefined", () => {
    expect(canDrop("group", undefined)).toBe(false);
  });

  it("accepts any child at the canvas root", () => {
    expect(canDrop(null, "group")).toBe(true);
    expect(canDrop(null, "text")).toBe(true);
    expect(canDrop(null, "tabs")).toBe(true);
  });

  it("rejects containers inside a row", () => {
    expect(canDrop("row", "group")).toBe(false);
    expect(canDrop("row", "array")).toBe(false);
    expect(canDrop("row", "tabs")).toBe(false);
    expect(canDrop("row", "collapsible")).toBe(false);
  });

  it("accepts data fields inside a row", () => {
    expect(canDrop("row", "text")).toBe(true);
    expect(canDrop("row", "email")).toBe(true);
    expect(canDrop("row", "switch")).toBe(true);
    expect(canDrop("row", "select")).toBe(true);
  });

  it("accepts any field inside group, array, collapsible, tabs", () => {
    const parents: Array<Field["type"]> = ["group", "array", "collapsible", "tabs"];
    for (const parent of parents) {
      expect(canDrop(parent, "text")).toBe(true);
      expect(canDrop(parent, "group")).toBe(true);
      expect(canDrop(parent, "tabs")).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// isDescendant
// ---------------------------------------------------------------------------

describe("isDescendant", () => {
  it("returns true for a direct child", () => {
    const nodes: Record<string, Node> = {
      a: createNode("a", { type: "group", name: "g", fields: [] }, null, null, { __default__: ["b"] }),
      b: createNode("b", { type: "text", name: "t" }, "a", null, { __default__: [] }),
    };
    expect(isDescendant(nodes, "a", "b")).toBe(true);
  });

  it("returns true for a deeply nested descendant", () => {
    const nodes: Record<string, Node> = {
      a: createNode("a", { type: "group", name: "g1", fields: [] }, null, null, { __default__: ["b"] }),
      b: createNode("b", { type: "group", name: "g2", fields: [] }, "a", null, { __default__: ["c"] }),
      c: createNode("c", { type: "text", name: "t" }, "b", null, { __default__: [] }),
    };
    expect(isDescendant(nodes, "a", "c")).toBe(true);
  });

  it("returns false for unrelated nodes", () => {
    const nodes: Record<string, Node> = {
      a: createNode("a", { type: "text", name: "x" }, null, null, { __default__: [] }),
      b: createNode("b", { type: "text", name: "y" }, null, null, { __default__: [] }),
    };
    expect(isDescendant(nodes, "a", "b")).toBe(false);
  });

  it("returns false when ancestor doesn't exist", () => {
    expect(isDescendant({}, "missing", "any")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// toSafeFileName
// ---------------------------------------------------------------------------

describe("toSafeFileName", () => {
  it("converts a normal string to a slug", () => {
    expect(toSafeFileName("  My Contact Form  ")).toBe("my-contact-form");
  });

  it("handles special characters", () => {
    expect(toSafeFileName("User's @Profile! (v2)")).toBe("user-s-profile-v2");
  });

  it("returns 'form' for empty input", () => {
    expect(toSafeFileName("   ")).toBe("form");
    expect(toSafeFileName("")).toBe("form");
  });

  it("truncates to 60 characters", () => {
    const long = "a".repeat(100);
    expect(toSafeFileName(long)).toBe("a".repeat(60));
  });

  it("handles parentheses and digits correctly", () => {
    expect(toSafeFileName("User Profile (v2)")).toBe("user-profile-v2");
  });
});
