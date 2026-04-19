import { describe, it, expect, beforeEach } from "vitest";
import { builderStore } from "./store";
import type { Field } from "@buildnbuzz/form-core";

describe("builderStore", () => {
  beforeEach(() => {
    builderStore.getState().clearState();
  });

  it("should initialize cleanly", () => {
    const state = builderStore.getState();
    expect(state.rootIds).toEqual([]);
    expect(state.mode).toBe("edit");
  });

  it("should create a node", () => {
    builderStore.getState().createNode("text", { type: "text", label: "My Text", name: "my_text" }, null, 0);
    const state = builderStore.getState();
    expect(state.rootIds.length).toBe(1);
    
    const nodeId = state.rootIds[0];
    const node = state.nodes[nodeId!];
    expect(node?.field.type).toBe("text");
    expect((node?.field as Extract<Field, { name: string }> | undefined)?.name).toMatch(/^text_/);
  });

  it("should update a node", () => {
    builderStore.getState().createNode("number", { type: "number", label: "Age", name: "age" }, null, 0);
    const id = builderStore.getState().rootIds[0]!;
    
    builderStore.getState().updateNode(id, { label: "Updated Age" });
    const field = builderStore.getState().nodes[id]?.field as Extract<Field, { label: unknown }> | undefined;
    expect(field?.label).toBe("Updated Age");
  });

  it("should remove a node", () => {
    builderStore.getState().createNode("text", { type: "text", label: "My Text" }, null, 0);
    const id = builderStore.getState().rootIds[0]!;
    
    builderStore.getState().removeNode(id);
    expect(builderStore.getState().rootIds.length).toBe(0);
    expect(builderStore.getState().nodes[id]).toBeUndefined();
  });
});
