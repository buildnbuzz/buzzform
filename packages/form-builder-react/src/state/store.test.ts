/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createBuilderStore } from "./store";
import type { BuilderFieldRegistry } from "../types";
import type { Node } from "@buildnbuzz/form-builder-core";
import type { StoreApi } from "zustand";
import type { TemporalState } from "zundo";

const mockRegistry: BuilderFieldRegistry = {
  text: {
    kind: "data",
    sidebar: {
      label: "Text",
      icon: { lucide: "TextCursorInput" },
      category: "inputs",
    },
    defaultProps: {
      type: "text",
      label: "New Field",
    },
  },
  row: {
    kind: "layout",
    sidebar: {
      label: "Row",
      icon: { lucide: "Columns" },
      category: "layout",
    },
    defaultProps: {
      type: "row",
      fields: [],
    },
  },
};

describe("Builder Store", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  it("initializes with default state", () => {
    const store = createBuilderStore({ registry: mockRegistry });
    const state = store.getState();
    expect(state.nodes).toEqual({});
    expect(state.rootIds).toEqual([]);
    expect(state.mode).toBe("edit");
  });

  it("can create and select a node", () => {
    const store = createBuilderStore({ registry: mockRegistry });
    store.getState().createNode("text", null);
    
    const state = store.getState();
    const nodeIds = Object.keys(state.nodes);
    expect(nodeIds).toHaveLength(1);
    
    const nodeId = nodeIds[0]!;
    expect(state.rootIds).toContain(nodeId);
    expect(state.nodes[nodeId]?.field.type).toBe("text");
    expect(state.selectedId).toBe(nodeId);
  });

  it("updates node properties", () => {
    const store = createBuilderStore({ registry: mockRegistry });
    store.getState().createNode("text", null);
    const nodeId = Object.keys(store.getState().nodes)[0]!;

    store.getState().updateNode(nodeId, { label: "Updated Label" });
    const field = store.getState().nodes[nodeId]?.field;
    if (field && "label" in field) {
      expect(field.label).toBe("Updated Label");
    } else {
      throw new Error("Field should have a label");
    }
  });

  it("moves nodes within roots", () => {
    const store = createBuilderStore({ registry: mockRegistry });
    store.getState().createNode("text", null); // Node A
    store.getState().createNode("text", null); // Node B
    
    const nodeIds = Object.keys(store.getState().nodes);
    const idA = nodeIds[0]!;
    const idB = nodeIds[1]!;
    
    // Move B to start
    store.getState().moveNode(idB, null, 0);
    expect(store.getState().rootIds).toEqual([idB, idA]);
  });

  it("removes a node and cleans up state", () => {
    const store = createBuilderStore({ registry: mockRegistry });
    store.getState().createNode("text", null);
    const nodeId = Object.keys(store.getState().nodes)[0]!;
    
    store.getState().toggleCollapsed(nodeId);
    store.getState().removeNode(nodeId);
    
    const state = store.getState();
    expect(state.nodes[nodeId]).toBeUndefined();
    expect(state.rootIds).not.toContain(nodeId);
    expect(state.collapsedNodes[nodeId]).toBeUndefined();
    expect(state.selectedId).toBeNull();
  });

  it("duplicates a node", () => {
    const store = createBuilderStore({ registry: mockRegistry });
    store.getState().createNode("text", null);
    const originalId = Object.keys(store.getState().nodes)[0]!;
    
    store.getState().duplicateNode(originalId);
    
    const nodeIds = Object.keys(store.getState().nodes);
    expect(nodeIds).toHaveLength(2);
    expect(store.getState().selectedId).not.toBe(originalId);
    expect(store.getState().selectedId).not.toBeNull();
  });

  it("updates UI state", () => {
    const store = createBuilderStore({ registry: mockRegistry });
    store.getState().setMode("preview");
    expect(store.getState().mode).toBe("preview");
    
    store.getState().setViewport("mobile");
    expect(store.getState().viewport).toBe("mobile");
    
    store.getState().setZoom(1.5);
    expect(store.getState().zoom).toBe(1.5);
  });

  it("supports undo/redo", async () => {
    const store = createBuilderStore({ registry: mockRegistry });
    const temporalStore = (store as unknown as { 
      temporal: StoreApi<TemporalState<{ nodes: Record<string, Node>; rootIds: string[] }>> 
    }).temporal;
    
    // Action
    store.getState().createNode("text", null);
    expect(Object.keys(store.getState().nodes)).toHaveLength(1);
    
    // Wait for history throttle (400ms in core)
    await vi.advanceTimersByTimeAsync(500);
    
    // Undo
    temporalStore.getState().undo();
    expect(Object.keys(store.getState().nodes)).toHaveLength(0);
    
    // Redo
    temporalStore.getState().redo();
    expect(Object.keys(store.getState().nodes)).toHaveLength(1);
  });
});
