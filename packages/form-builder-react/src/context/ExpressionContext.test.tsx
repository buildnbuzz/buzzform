import React from "react";
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ExpressionProvider, useAvailableFields, useExpressionContext } from "./ExpressionContext";
import * as useBuilderStoreModule from "./BuilderContext";
import type { BuilderStoreInterface } from "../types";

// Mock the hook from form-builder-react
vi.mock("./BuilderContext", () => ({
  useBuilderStore: vi.fn(),
}));

describe("ExpressionContext", () => {
  const mockNodes = {
    "node-1": {
      id: "node-1",
      field: { type: "text", name: "firstName", label: "First Name" },
      parentId: null,
      parentSlot: null,
      children: {},
    },
    "node-2": {
      id: "node-2",
      field: { type: "text", name: "lastName", label: "Last Name" },
      parentId: null,
      parentSlot: null,
      children: {},
    },
  };

  it("throws an error when used outside of ExpressionProvider", () => {
    // Suppress console.error for expected throw
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => renderHook(() => useExpressionContext())).toThrow(
      "useExpressionContext must be used within an ExpressionProvider"
    );

    console.error = originalError;
  });

  it("returns empty array when there are no nodes", () => {
    vi.mocked(useBuilderStoreModule.useBuilderStore).mockImplementation((selector: unknown) => {
      const state = { nodes: {}, rootIds: [] } as unknown as BuilderStoreInterface;
      return (selector as (state: BuilderStoreInterface) => unknown)(state);
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ExpressionProvider>{children}</ExpressionProvider>
    );

    const { result } = renderHook(() => useAvailableFields(), { wrapper });

    expect(result.current).toEqual([]);
  });

  it("derives availableFields from builder store nodes", () => {
    vi.mocked(useBuilderStoreModule.useBuilderStore).mockImplementation((selector: unknown) => {
      const state = { nodes: mockNodes, rootIds: ["node-1", "node-2"] } as unknown as BuilderStoreInterface;
      return (selector as (state: BuilderStoreInterface) => unknown)(state);
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ExpressionProvider>{children}</ExpressionProvider>
    );

    const { result } = renderHook(() => useAvailableFields(), { wrapper });

    expect(result.current).toEqual([
      { id: "firstName", label: "firstName" },
      { id: "lastName", label: "lastName" },
    ]);
  });
});
