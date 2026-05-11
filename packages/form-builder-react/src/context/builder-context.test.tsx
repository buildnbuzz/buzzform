/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { renderHook, act } from "@testing-library/react";
import { 
  DefaultBuilderProvider, 
  useBuilderContext, 
  useBuilderStore,
  useSelectedNode 
} from "./builder-context";
import type { BuilderFieldRegistry } from "../types";

const mockRegistry: BuilderFieldRegistry = {
  text: {
    kind: "data",
    sidebar: { label: "Text", icon: { lucide: "TextCursorInput" }, category: "inputs" },
    defaultProps: { type: "text", label: "New Field" },
  },
};

describe("Builder Context", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("provides store and registry to children", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DefaultBuilderProvider registry={mockRegistry} persistenceName="test-store">
        {children}
      </DefaultBuilderProvider>
    );

    const { result } = renderHook(() => useBuilderContext(), { wrapper });

    expect(result.current.registry).toBe(mockRegistry);
    expect(result.current.store).toBeDefined();
  });

  it("provides renderIcon to children", () => {
    const renderIcon = vi.fn();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DefaultBuilderProvider 
        registry={mockRegistry} 
        renderIcon={renderIcon} 
        persistenceName="test-icon"
      >
        {children}
      </DefaultBuilderProvider>
    );

    const { result } = renderHook(() => useBuilderContext(), { wrapper });
    expect(result.current.renderIcon).toBe(renderIcon);
  });

  it("throws error when used outside provider", () => {
    // Suppress console.error for expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => renderHook(() => useBuilderContext())).toThrow(
      "useBuilderContext must be used within a BuilderProvider"
    );
    
    spy.mockRestore();
  });

  it("useBuilderStore reacts to state changes", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DefaultBuilderProvider registry={mockRegistry} persistenceName="test-reactivity">
        {children}
      </DefaultBuilderProvider>
    );

    const { result } = renderHook(() => ({
      mode: useBuilderStore((s) => s.mode),
      store: useBuilderContext().store
    }), { wrapper });

    expect(result.current.mode).toBe("edit");

    act(() => {
      result.current.store.getState().setMode("preview");
    });
    
    expect(result.current.mode).toBe("preview");
  });

  it("useSelectedNode returns node when selected", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DefaultBuilderProvider registry={mockRegistry} persistenceName="test-selection">
        {children}
      </DefaultBuilderProvider>
    );

    const { result } = renderHook(() => ({
      selected: useSelectedNode(),
      store: useBuilderContext().store
    }), { wrapper });

    expect(result.current.selected).toBeNull();

    act(() => {
      result.current.store.getState().createNode("text", null);
    });

    expect(result.current.selected).not.toBeNull();
    expect(result.current.selected?.field.type).toBe("text");
  });
});
