import React from "react";
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDropIndicator } from "./use-drop-indicator";
import { BuilderProvider } from "../context/builder-context";
import { createBuilderStore } from "../state/store";

describe("useDropIndicator", () => {
  it("should return the indicator index if it matches parentId and parentSlot", () => {
    const store = createBuilderStore({ registry: {} });
    store.setState({
      dropIndicator: {
        parentId: "group_1",
        parentSlot: "__default__",
        index: 2,
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <BuilderProvider store={store} registry={{}}>{children}</BuilderProvider>
    );

    const { result } = renderHook(() => useDropIndicator("group_1", "__default__"), {
      wrapper,
    });

    expect(result.current).toBe(2);
  });

  it("should return null if parentId matches but parentSlot does not", () => {
    const store = createBuilderStore({ registry: {} });
    store.setState({
      dropIndicator: {
        parentId: "group_1",
        parentSlot: "slot_a",
        index: 2,
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <BuilderProvider store={store} registry={{}}>{children}</BuilderProvider>
    );

    const { result } = renderHook(() => useDropIndicator("group_1", "slot_b"), {
      wrapper,
    });

    expect(result.current).toBeNull();
  });

  it("should return null if parentId does not match", () => {
    const store = createBuilderStore({ registry: {} });
    store.setState({
      dropIndicator: {
        parentId: "group_1",
        parentSlot: "__default__",
        index: 2,
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <BuilderProvider store={store} registry={{}}>{children}</BuilderProvider>
    );

    const { result } = renderHook(() => useDropIndicator("group_2", "__default__"), {
      wrapper,
    });

    expect(result.current).toBeNull();
  });

  it("should return null if dropIndicator is null", () => {
    const store = createBuilderStore({ registry: {} });
    store.setState({
      dropIndicator: null,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <BuilderProvider store={store} registry={{}}>{children}</BuilderProvider>
    );

    const { result } = renderHook(() => useDropIndicator("group_1"), {
      wrapper,
    });

    expect(result.current).toBeNull();
  });
});
