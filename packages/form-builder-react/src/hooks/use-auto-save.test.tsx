/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { useAutoSave } from "./use-auto-save";
import { setupBuilderAutoSave } from "@buildnbuzz/form-builder-core";
import { BuilderProvider } from "../context/builder-context";

vi.mock("@buildnbuzz/form-builder-core", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@buildnbuzz/form-builder-core")>();
  return {
    ...actual,
    setupBuilderAutoSave: vi.fn(),
  };
});

import type { BuilderStorageProvider } from "@buildnbuzz/form-builder-core";
import type { StoreApi, UseBoundStore } from "zustand";
import type { BuilderStoreInterface } from "../types";

describe("useAutoSave", () => {
  let mockStore: UseBoundStore<StoreApi<BuilderStoreInterface>>;
  let mockProvider: BuilderStorageProvider;
  let mockUnsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    const mockState = { nodes: {}, rootIds: [] };
    const mockTemporalState = { undo: vi.fn(), redo: vi.fn(), clear: vi.fn(), pastStates: [], futureStates: [] };

    mockStore = {
      subscribe: vi.fn(),
      getState: vi.fn(() => mockState),
      temporal: {
        subscribe: vi.fn(),
        getState: vi.fn(() => mockTemporalState),
      },
    } as unknown as UseBoundStore<StoreApi<BuilderStoreInterface>>;
    mockProvider = {
      save: vi.fn(),
      load: vi.fn(),
      list: vi.fn(),
      remove: vi.fn(),
    } as unknown as BuilderStorageProvider;
    mockUnsubscribe = vi.fn();
    vi.mocked(setupBuilderAutoSave).mockReturnValue(
      mockUnsubscribe as () => void,
    );
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BuilderProvider store={mockStore} registry={{}}>
      {children}
    </BuilderProvider>
  );

  it("subscribes on mount when provider is given", () => {
    renderHook(() => useAutoSave(mockProvider), { wrapper });

    expect(setupBuilderAutoSave).toHaveBeenCalledTimes(1);
    expect(setupBuilderAutoSave).toHaveBeenCalledWith(mockStore, mockProvider);
  });

  it("unsubscribes on unmount", () => {
    const { unmount } = renderHook(() => useAutoSave(mockProvider), {
      wrapper,
    });

    expect(mockUnsubscribe).not.toHaveBeenCalled();
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it("does not subscribe if provider is null", () => {
    renderHook(() => useAutoSave(null), { wrapper });

    expect(setupBuilderAutoSave).not.toHaveBeenCalled();
  });
});
