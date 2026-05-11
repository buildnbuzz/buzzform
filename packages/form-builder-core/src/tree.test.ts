import { describe, test, expect } from "vitest";
import { insertNode, moveNode, removeNodeTree, duplicateNode, updateNode, type TreeState } from "./tree";
import type { Node } from "./types";

function createMockTextNode(id: string, parentId: string | null = null, parentSlot: string | null = null): Node {
  return {
    id,
    field: { type: "text", name: `field_${id}`, label: `Text ${id}` },
    parentId,
    parentSlot,
    children: {},
  };
}

function createMockGroupNode(id: string, parentId: string | null = null, parentSlot: string | null = null): Node {
  return {
    id,
    field: { type: "group", name: `group_${id}`, fields: [] },
    parentId,
    parentSlot,
    children: {}, // Will be resolved to __default__ by modifiers over time
  };
}

describe("Tree Reducers - Behavioral Tests", () => {
  test("insertNode: adding to root adds to nodes dict and rootIds", () => {
    const initialState: TreeState = { nodes: {}, rootIds: [] };
    const newNode = createMockTextNode("n1");
    
    const nextState = insertNode(initialState, newNode, 0);
    
    expect(nextState.nodes["n1"]).toBeDefined();
    expect(nextState.rootIds).toEqual(["n1"]);
  });

  test("removeNodeTree: recursively cleans up all descendants", () => {
    const parent = createMockGroupNode("p1");
    const child1 = createMockGroupNode("c1", "p1", "__default__");
    const child2 = createMockTextNode("c2", "c1", "__default__");
    
    // Wire up parent-child relationships
    parent.children["__default__"] = ["c1"];
    child1.children["__default__"] = ["c2"];

    const initialState: TreeState = {
      nodes: { p1: parent, c1: child1, c2: child2 },
      rootIds: ["p1"],
    };

    const nextState = removeNodeTree(initialState, "p1");

    expect(nextState.rootIds).toEqual([]); // p1 gone from root
    expect(nextState.nodes["p1"]).toBeUndefined();
    expect(nextState.nodes["c1"]).toBeUndefined(); // recursively deleted
    expect(nextState.nodes["c2"]).toBeUndefined();
  });

  test("moveNode: transfers a node between parents and updates slot arrays", () => {
    const parentA = createMockGroupNode("pA");
    const parentB = createMockGroupNode("pB");
    const child = createMockTextNode("child", "pA", "__default__");

    parentA.children["__default__"] = ["child"];

    const initialState: TreeState = {
      nodes: { pA: parentA, pB: parentB, child: child },
      rootIds: ["pA", "pB"],
    };

    // Move child from pA to pB
    const nextState = moveNode(initialState, "child", "pB", 0, "__default__");

    const newPA = nextState.nodes["pA"]!;
    const newPB = nextState.nodes["pB"]!;

    expect(newPA.children["__default__"]).toEqual([]);
    expect(newPB.children["__default__"]).toEqual(["child"]);
    expect(nextState.nodes["child"]!.parentId).toBe("pB");
  });

  test("duplicateNode: clones a node and its descendants into adjacent slot", () => {
    const parent = createMockGroupNode("grp1");
    const child = createMockTextNode("txt1", "grp1", "__default__");
    
    parent.children["__default__"] = ["txt1"];

    const initialState: TreeState = {
      nodes: { grp1: parent, txt1: child },
      rootIds: ["grp1"],
    };

    const { state: nextState, newId } = duplicateNode(initialState, "grp1");

    expect(newId).not.toBeNull();
    // The clone should be inserted immediately after the original in rootIds
    expect(nextState.rootIds).toEqual(["grp1", newId!]);

    const clonedParent = nextState.nodes[newId!];
    expect(clonedParent).toBeDefined();

    // It should have generated a new unique name
    expect((clonedParent!.field as unknown as { name: string }).name).toBe("group_grp1_copy");

    // It should have cloned the child
    const clonedChildrenIds = clonedParent!.children["__default__"];
    expect(clonedChildrenIds).toHaveLength(1);

    const clonedChild = nextState.nodes[clonedChildrenIds![0]!];
    expect(clonedChild).toBeDefined();
    expect((clonedChild!.field as unknown as { name: string }).name).toBe("field_txt1_copy");
    expect(clonedChild!.parentId).toBe(newId); // points to new parent
  });

  test("updateNode: syncTabsChildren gracefully handles tab addition and deletion", () => {
    const tabsNode: Node = {
      id: "tabs1",
      parentId: null,
      parentSlot: null,
      field: {
        type: "tabs",
        tabs: [{ label: "Tab A", name: "tabA", fields: [] }, { label: "Tab B", name: "tabB", fields: [] }]
      },
      children: { __tab_0: ["childA"], __tab_1: ["childB"] }, // slot resolution
    };
    
    const childA = createMockTextNode("childA", "tabs1", "__tab_0");
    const childB = createMockTextNode("childB", "tabs1", "__tab_1");

    const initialState: TreeState = {
      nodes: { tabs1: tabsNode, childA, childB },
      rootIds: ["tabs1"],
    };

    // Action: User modifies the node to delete the first tab and add a new one
    const updates = {
      tabs: [{ label: "Tab B", name: "tabB", fields: [] }, { label: "New Tab C", name: "tabC", fields: [] }]
    };

    const nextState = updateNode(initialState, "tabs1", updates);
    const updatedTabs = nextState.nodes["tabs1"]!;

    // Expected keys based off getTabSlotKeys fallback: "tabB", "tabC"
    // 'childA' was orphaned because tabA was deleted. It should be swept into the first available tab ("tabB").
    // 'childB' originally lived in tabB, it should remain in tabB.
    
    const nextChildren = updatedTabs.children;
    expect(nextChildren["tabB"]).toBeDefined();
    expect(nextChildren["tabC"]).toBeDefined();

    // childA and childB should both be grouped into "tabB"
    expect(nextChildren["tabB"]).toContain("childB");
    expect(nextChildren["tabB"]).toContain("childA"); // gracefully mapped to first available

    expect(nextState.nodes["childA"]!.parentSlot).toBe("tabB");
    expect(nextState.nodes["childB"]!.parentSlot).toBe("tabB");
  });
});
