import { describe, it, expect, beforeEach, vi } from "vitest";
import { createBuilderStore, setupBuilderAutoSave } from "./store";
import type { Store } from "./store";
import type { StoreApi } from "zustand/vanilla";
import type { BuilderStorageProvider } from "./persistence/provider";
import type { Field } from "@buildnbuzz/form-core";

describe("builderStore", () => {
  let builderStore: StoreApi<Store>;

  beforeEach(() => {
    builderStore = createBuilderStore({ name: "test-store" });
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

describe("Autosave hook", () => {
    let internalStore: StoreApi<Store>;
    
    beforeEach(() => {
        internalStore = createBuilderStore();
        vi.useFakeTimers();
    });

    it("should skip autosave if document is empty", async () => {
      const saveSpy = vi.fn();
      const mockProvider: BuilderStorageProvider = {
        save: saveSpy,
        list: vi.fn(),
        load: vi.fn(),
        remove: vi.fn(),
      };

      setupBuilderAutoSave(internalStore, mockProvider);

      internalStore.getState().updateFormSettings({ outputConfig: { type: "path" } });
      
      await vi.advanceTimersByTimeAsync(600);
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it("should autosave when document is updated", async () => {
      const saveSpy = vi.fn().mockResolvedValue({});
      const mockProvider: BuilderStorageProvider = {
        save: saveSpy,
        list: vi.fn(),
        load: vi.fn(),
        remove: vi.fn(),
      };

      internalStore.getState().createNode("text", { type: "text", label: "My Text" }, null, 0);
      setupBuilderAutoSave(internalStore, mockProvider);

      internalStore.getState().updateFormSettings({ outputConfig: { type: "path" } });
      
      expect(internalStore.getState().saveStatus).toBe("saving");

      await vi.runAllTimersAsync();

      expect(saveSpy).toHaveBeenCalledTimes(1);
      
      expect(internalStore.getState().saveStatus).toBe("saved");
    });
});
