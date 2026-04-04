import { describe, it, expect } from "vitest";

import type { Tab } from "@buildnbuzz/form-core";

import type { Node } from "./types";
import { DEFAULT_SLOT, getTabSlotKeys, getNodeChildren, getSlotKeys, getChildList, ensureChildList } from "./node-children";

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
// getTabSlotKeys
// ---------------------------------------------------------------------------

describe("getTabSlotKeys", () => {
  it("generates unique keys from tab names", () => {
    const tabs = [
      { name: "details", label: "Details" },
      { name: "settings", label: "Settings" },
    ];
    expect(getTabSlotKeys(tabs)).toEqual(["details", "settings"]);
  });

  it("falls back to __tab_N for unnamed tabs", () => {
    const tabs = [{ label: "Tab 1", fields: [] } as Tab, { label: "Tab 2", fields: [] } as Tab];
    expect(getTabSlotKeys(tabs)).toEqual(["__tab_0", "__tab_1"]);
  });

  it("deduplicates duplicate tab names", () => {
    const tabs = [
      { name: "info", label: "Info" },
      { name: "info", label: "Info" },
      { name: "info", label: "Info" },
    ];
    expect(getTabSlotKeys(tabs)).toEqual(["info", "info_1", "info_2"]);
  });
});

// ---------------------------------------------------------------------------
// getNodeChildren
// ---------------------------------------------------------------------------

describe("getNodeChildren", () => {
  it("returns children from the default slot for non-tab containers", () => {
    const node = createNode("a", { type: "group" as const, name: "g", fields: [] }, null, {
      __default__: ["b", "c"],
    });
    expect(getNodeChildren(node)).toEqual(["b", "c"]);
  });

  it("flattens all named slots for tab containers", () => {
    const node = createNode("a", { type: "tabs" as const, tabs: [] }, null, {
      __tab_0: ["b", "c"],
      __tab_1: ["d"],
    });
    expect(getNodeChildren(node)).toEqual(["b", "c", "d"]);
  });

  it("returns empty array for node with no children", () => {
    const node = createNode("a", { type: "text" as const, name: "t" }, null, {
      __default__: [],
    });
    expect(getNodeChildren(node)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getSlotKeys
// ---------------------------------------------------------------------------

describe("getSlotKeys", () => {
  it("returns __default__ for non-tab containers", () => {
    const node = createNode("a", { type: "group" as const, name: "g", fields: [] }, null, {
      __default__: ["b"],
    });
    expect(getSlotKeys(node)).toEqual(["__default__"]);
  });

  it("returns all slot keys for tab containers", () => {
    const node = createNode("a", { type: "tabs" as const, tabs: [
      { name: "one", label: "One", fields: [] },
      { name: "two", label: "Two", fields: [] },
    ] }, null, {
      one: ["b"],
      two: ["c"],
    });
    expect(getSlotKeys(node)).toEqual(["one", "two"]);
  });
});

// ---------------------------------------------------------------------------
// getChildList
// ---------------------------------------------------------------------------

describe("getChildList", () => {
  it("returns rootIds when parentId is null", () => {
    const rootIds = ["a", "b"];
    expect(getChildList({}, rootIds, null)).toBe(rootIds);
  });

  it("returns empty array when parent node doesn't exist", () => {
    expect(getChildList({}, ["a"], "nonexistent")).toEqual([]);
  });

  it("returns default slot children for non-tab containers", () => {
    const nodes = {
      a: createNode("a", { type: "group" as const, name: "g", fields: [] }, null, {
        __default__: ["b", "c"],
      }),
    };
    expect(getChildList(nodes, [], "a")).toEqual(["b", "c"]);
  });

  it("returns specific slot children for tab containers", () => {
    const nodes = {
      a: createNode("a", { type: "tabs" as const, tabs: [
        { name: "t1", label: "Tab 1", fields: [] },
      ] }, null, {
        t1: ["x", "y"],
      }),
    };
    expect(getChildList(nodes, [], "a", "t1")).toEqual(["x", "y"]);
  });
});

// ---------------------------------------------------------------------------
// ensureChildList
// ---------------------------------------------------------------------------

describe("ensureChildList", () => {
  it("returns rootIds with default slot when parentId is null", () => {
    const rootIds = ["a", "b"];
    const result = ensureChildList({}, rootIds, null);
    expect(result.list).toBe(rootIds);
    expect(result.resolvedSlot).toBe(DEFAULT_SLOT);
  });

  it("initializes missing default slot for non-tab containers", () => {
    const nodes: Record<string, Node> = {
      a: createNode("a", { type: "group" as const, name: "g", fields: [] }, null, {}),
    };
    const result = ensureChildList(nodes, [], "a");
    expect(result.resolvedSlot).toBe(DEFAULT_SLOT);
    expect(result.list).toEqual([]);
    expect(nodes["a"]!.children[DEFAULT_SLOT]).toBe(result.list);
  });

  it("initializes missing tab slot and returns resolved slot key", () => {
    const nodes: Record<string, Node> = {
      a: createNode("a", { type: "tabs" as const, tabs: [
        { name: "t1", label: "Tab 1", fields: [] },
      ] }, null, {}),
    };
    const result = ensureChildList(nodes, [], "a", "t1");
    expect(result.resolvedSlot).toBe("t1");
    expect(result.list).toEqual([]);
    expect(nodes["a"]!.children["t1"]).toBe(result.list);
  });
});
