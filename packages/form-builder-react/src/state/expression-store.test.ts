import { describe, it, expect, beforeEach } from "vitest";
import { createExpressionStore, type ExpressionStoreState } from "./expression-store";
import type { StoreApi } from "zustand/vanilla";

describe("ExpressionGroupStore", () => {
  let store: StoreApi<ExpressionStoreState>;

  beforeEach(() => {
    store = createExpressionStore();
  });

  it("initializes with root group", () => {
    const state = store.getState();
    expect(state.rootGroup).toEqual({
      id: "root",
      type: "group",
      logicalOperator: "AND",
      children: [],
    });
  });

  it("initializes with provided state", () => {
    const initialStore = createExpressionStore({
      id: "custom",
      type: "group",
      logicalOperator: "OR",
      children: [],
    });
    expect(initialStore.getState().rootGroup.id).toBe("custom");
    expect(initialStore.getState().rootGroup.logicalOperator).toBe("OR");
  });

  it("addRule adds a rule to a group", () => {
    store.getState().addRule("root");
    const state = store.getState();
    expect(state.rootGroup.children).toHaveLength(1);
    expect(state.rootGroup.children[0]?.type).toBe("rule");
  });

  it("addGroup adds a group with a default rule", () => {
    store.getState().addGroup("root");
    const state = store.getState();
    expect(state.rootGroup.children).toHaveLength(1);
    expect(state.rootGroup.children[0]?.type).toBe("group");
    if (state.rootGroup.children[0]?.type === "group") {
      expect(state.rootGroup.children[0].children).toHaveLength(1);
      expect(state.rootGroup.children[0].children[0]?.type).toBe("rule");
    }
  });

  it("removeNode removes a child", () => {
    store.getState().addRule("root");
    const ruleId = store.getState().rootGroup.children[0]?.id as string;
    store.getState().removeNode("root", ruleId);
    expect(store.getState().rootGroup.children).toHaveLength(0);
  });

  it("updateRule updates rule properties", () => {
    store.getState().addRule("root");
    const ruleId = store.getState().rootGroup.children[0]?.id as string;
    
    store.getState().updateRule("root", ruleId, { fieldId: "email", operator: "is_empty" });
    
    const rule = store.getState().rootGroup.children[0];
    if (rule?.type === "rule") {
      expect(rule.fieldId).toBe("email");
      expect(rule.operator).toBe("is_empty");
    }
  });

  it("updateGroupOperator updates the logical operator", () => {
    store.getState().updateGroupOperator("root", "OR");
    expect(store.getState().rootGroup.logicalOperator).toBe("OR");
  });

  it("duplicateRule creates a shallow copy with a new ID", () => {
    store.getState().addRule("root");
    const ruleId = store.getState().rootGroup.children[0]?.id as string;
    store.getState().updateRule("root", ruleId, { fieldId: "test" });
    
    store.getState().duplicateRule("root", ruleId);
    
    const children = store.getState().rootGroup.children;
    expect(children).toHaveLength(2);
    expect(children[0]?.id).not.toBe(children[1]?.id);
    if (children[0]?.type === "rule" && children[1]?.type === "rule") {
      expect(children[0].fieldId).toBe("test");
      expect(children[1].fieldId).toBe("test");
    }
  });

  it("duplicateGroup creates a deep clone with fresh IDs", () => {
    store.getState().addGroup("root");
    const groupId = store.getState().rootGroup.children[0]?.id as string;
    
    store.getState().duplicateGroup("root", groupId);
    
    const children = store.getState().rootGroup.children;
    expect(children).toHaveLength(2);
    expect(children[0]?.id).not.toBe(children[1]?.id);
    if (children[0]?.type === "group" && children[1]?.type === "group") {
      expect(children[0].children[0]?.id).not.toBe(children[1].children[0]?.id);
    }
  });

  it("reorderNode moves a child within a group", () => {
    store.getState().addRule("root");
    store.getState().addRule("root");
    const children = store.getState().rootGroup.children;
    const firstId = children[0]?.id as string;
    const secondId = children[1]?.id as string;
    
    store.getState().reorderNode("root", firstId, secondId);
    
    const newChildren = store.getState().rootGroup.children;
    expect(newChildren[0]?.id).toBe(secondId);
    expect(newChildren[1]?.id).toBe(firstId);
  });
  
  it("moveNode moves a node between groups", () => {
    store.getState().addRule("root");
    store.getState().addGroup("root");
    const children = store.getState().rootGroup.children;
    const ruleId = children[0]?.id as string;
    const groupId = children[1]?.id as string;
    
    store.getState().moveNode(ruleId, groupId, 0);
    
    const newChildren = store.getState().rootGroup.children;
    expect(newChildren).toHaveLength(1); // the group
    if (newChildren[0]?.type === "group") {
      // the group now has the default rule + our moved rule
      expect(newChildren[0].children).toHaveLength(2);
      expect(newChildren[0].children[0]?.id).toBe(ruleId);
    }
  });
});
