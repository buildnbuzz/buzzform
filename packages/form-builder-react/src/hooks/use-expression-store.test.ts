/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useExpressionStore } from "./use-expression-store";
import type { ExpressionGroup } from "@buildnbuzz/form-builder-core";

const makeGroup = (id = "root"): ExpressionGroup => ({
  id,
  type: "group",
  logicalOperator: "AND",
  children: [],
});

describe("useExpressionStore", () => {
  it("initializes with default empty root group when no initialValue", () => {
    const { result } = renderHook(() => useExpressionStore());
    expect(result.current.rootGroup.type).toBe("group");
    expect(result.current.rootGroup.children).toHaveLength(0);
  });

  it("initializes with provided initialValue", () => {
    const initial = makeGroup("custom-root");
    const { result } = renderHook(() => useExpressionStore(initial));
    expect(result.current.rootGroup.id).toBe("custom-root");
  });

  it("rootGroup updates reactively when store mutates", async () => {
    const { result } = renderHook(() => useExpressionStore());

    act(() => {
      result.current.store.getState().addRule("root");
    });

    expect(result.current.rootGroup.children).toHaveLength(1);
  });

  it("returns a valid store with getState", () => {
    const { result } = renderHook(() => useExpressionStore());
    expect(typeof result.current.store.getState).toBe("function");
    expect(typeof result.current.store.subscribe).toBe("function");
  });

  it("recreates store when open toggles", () => {
    const initial = makeGroup();
    let open = false;
    const { result, rerender } = renderHook(
      ({ o }) => useExpressionStore(initial, o),
      { initialProps: { o: open } },
    );

    const firstStore = result.current.store;

    // Add a rule so the store is "dirty"
    act(() => {
      result.current.store.getState().addRule("root");
    });
    expect(result.current.rootGroup.children).toHaveLength(1);

    // Toggle open → should recreate store with fresh state
    open = true;
    rerender({ o: open });

    const secondStore = result.current.store;
    expect(secondStore).not.toBe(firstStore);
    expect(result.current.rootGroup.children).toHaveLength(0);
  });
});
