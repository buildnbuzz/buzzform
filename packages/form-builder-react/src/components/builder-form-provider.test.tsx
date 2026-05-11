import React from "react";
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  BuilderFormProvider,
  useBuilderFormContext,
} from "./builder-form-provider";
import { useBuilderStore } from "../context/builder-context";

import type { BuilderStoreInterface } from "../types";

// Mock the builder context hook since it leverages zustand implicitly
vi.mock("../context/builder-context", () => ({
  useBuilderStore: vi.fn(),
  BuilderProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useBuilderContext: vi.fn(() => ({ store: {} })),
}));

describe("BuilderFormProvider", () => {
  it("provides builder mode properly", () => {
    // Setup dummy store returns
    vi.mocked(useBuilderStore).mockImplementation(
      (selector: (state: BuilderStoreInterface) => unknown) => {
        const state = {
          nodes: {},
          rootIds: [],
          outputConfig: undefined,
        };
        return selector(state as unknown as BuilderStoreInterface);
      },
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <BuilderFormProvider mode="preview">{children}</BuilderFormProvider>
    );

    const { result } = renderHook(() => useBuilderFormContext(), { wrapper });

    expect(result.current.mode).toBe("preview");
    expect(result.current.fields).toEqual([]);
  });

  it("throws when missing provider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(() => {
      renderHook(() => useBuilderFormContext());
    }).toThrow(
      "useBuilderFormContext must be used within <BuilderFormProvider>",
    );
    consoleError.mockRestore();
  });
});
