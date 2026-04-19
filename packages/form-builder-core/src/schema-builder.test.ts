import { describe, it, expect } from "vitest";

import type { Node } from "./types";
import { nodesToFields, nodeToField, getAllFieldNames } from "./schema-builder";

function createNode(
  id: string,
  field: Node["field"],
  parentId: string | null = null,
  children: Record<string, string[]> = { __default__: [] },
): Node {
  return {
    id,
    field,
    parentId,
    parentSlot: null,
    children,
  };
}

// ---------------------------------------------------------------------------
// nodeToField
// ---------------------------------------------------------------------------

describe("nodeToField", () => {
  it("returns null for non-existent node", () => {
    expect(nodeToField({}, "missing")).toBeNull();
  });

  it("returns a leaf data field unchanged", () => {
    const nodes: Record<string, Node> = {
      a: createNode("a", { type: "text" as const, name: "name" }, null, { __default__: [] }),
    };
    const field = nodeToField(nodes, "a");
    expect(field).toEqual({ type: "text", name: "name" });
  });

  it("populates fields[] for a container from the default slot", () => {
    const nodes: Record<string, Node> = {
      root: createNode("root", { type: "group" as const, name: "user", fields: [] }, null, {
        __default__: ["child1"],
      }),
      child1: createNode("child1", { type: "text" as const, name: "email" }, "root", {
        __default__: [],
      }),
    };
    const field = nodeToField(nodes, "root");
    expect(field).toEqual({
      type: "group",
      name: "user",
      fields: [{ type: "text", name: "email" }],
    });
  });

  it("populates tabs[].fields for a tabs node from named slots", () => {
    const nodes: Record<string, Node> = {
      root: createNode("root", { type: "tabs" as const, tabs: [
        { name: "tabA", label: "Tab A", fields: [] },
      ] }, null, {
        tabA: ["child1"],
      }),
      child1: createNode("child1", { type: "email" as const, name: "email" }, "root", {
        __default__: [],
      }),
    };
    const field = nodeToField(nodes, "root");
    expect(field).toEqual({
      type: "tabs",
      tabs: [{
        name: "tabA",
        label: "Tab A",
        fields: [{ type: "email", name: "email" }],
      }],
    });
  });

  it("handles deeply nested tree structure", () => {
    const nodes: Record<string, Node> = {
      root: createNode("root", { type: "group" as const, name: "outer", fields: [] }, null, {
        __default__: ["inner"],
      }),
      inner: createNode("inner", { type: "group" as const, name: "inner", fields: [] }, "root", {
        __default__: ["leaf"],
      }),
      leaf: createNode("leaf", { type: "text" as const, name: "val" }, "inner", {
        __default__: [],
      }),
    };
    const field = nodeToField(nodes, "root");
    expect(field).toEqual({
      type: "group",
      name: "outer",
      fields: [{
        type: "group",
        name: "inner",
        fields: [{ type: "text", name: "val" }],
      }],
    });
  });

  it("sanitizes empty values from fields", () => {
    const nodes: Record<string, Node> = {
      a: createNode("a", { 
        type: "text" as const, 
        name: "test", 
        label: "My Label",
        description: "", // Should be removed
        placeholder: null as unknown as string, // Should be removed
        required: false, // Should be kept
      }, null, { __default__: [] }),
    };
    const field = nodeToField(nodes, "a");
    expect(field).toEqual({
      type: "text",
      name: "test",
      label: "My Label",
      required: false,
    });
  });

  it("recursively sanitizes nested objects", () => {
    const nodes: Record<string, Node> = {
      a: createNode("a", { 
        type: "text" as const, 
        name: "test",
        validate: {
          pattern: "",
          message: "err",
        }
      } as unknown as Node["field"], null, { __default__: [] }),
    };
    const field = nodeToField(nodes, "a");
    expect(field).toEqual({
      type: "text",
      name: "test",
      validate: {
        message: "err",
      },
    });
  });
});

// ---------------------------------------------------------------------------
// nodesToFields
// ---------------------------------------------------------------------------

describe("nodesToFields", () => {
  it("converts multiple root nodes", () => {
    const nodes: Record<string, Node> = {
      a: createNode("a", { type: "text" as const, name: "email" }, null, { __default__: [] }),
      b: createNode("b", { type: "switch" as const, name: "active" }, null, { __default__: [] }),
    };
    const fields = nodesToFields(nodes, ["a", "b"]);
    expect(fields).toEqual([
      { type: "text", name: "email" },
      { type: "switch", name: "active" },
    ]);
  });

  it("filters out null entries for missing nodes", () => {
    const nodes: Record<string, Node> = {
      a: createNode("a", { type: "text" as const, name: "x" }, null, { __default__: [] }),
    };
    const fields = nodesToFields(nodes, ["a", "nonexistent"]);
    expect(fields).toEqual([{ type: "text", name: "x" }]);
  });
});

// ---------------------------------------------------------------------------
// getAllFieldNames
// ---------------------------------------------------------------------------

describe("getAllFieldNames", () => {
  it("collects names from nested tree", () => {
    const nodes: Record<string, Node> = {
      root: createNode("root", { type: "group" as const, name: "g", fields: [] }, null, {
        __default__: ["c1", "c2"],
      }),
      c1: createNode("c1", { type: "text" as const, name: "email" }, "root", { __default__: [] }),
      c2: createNode("c2", { type: "switch" as const, name: "active" }, "root", { __default__: [] }),
    };
    const names = getAllFieldNames(nodes, ["root"]);
    // group is a DataField (has name), so "g" is included alongside "email" and "active"
    expect(names).toEqual(new Set(["g", "email", "active"]));
  });

  it("ignores layout fields without names", () => {
    const nodes: Record<string, Node> = {
      root: createNode("root", { type: "row" as const, fields: [] }, null, {
        __default__: ["c1"],
      }),
      c1: createNode("c1", { type: "text" as const, name: "name" }, "root", { __default__: [] }),
    };
    const names = getAllFieldNames(nodes, ["root"]);
    expect(names).toEqual(new Set(["name"]));
  });
});
