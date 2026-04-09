// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useFieldOptions } from "./use-field-options";
import { FieldContext } from "../field-context";
import type { OptionResolverRegistry } from "@buildnbuzz/form-core";

const mockStore = {
  state: {
    values: { categoryId: "cat_1" },
  },
  subscribe: vi.fn(),
};

const mockForm = {
  store: mockStore,
} as any;

const baseFieldContext = {
  form: mockForm,
  field: { type: "select", name: "testField", dependencies: ["/categoryId"] } as any,
  formData: { categoryId: "cat_1" },
  contextData: undefined,
  fieldPath: "/testField",
  isHidden: false,
  isConditionMet: true,
  isDisabled: false,
  isReadOnly: false,
  isRequired: false,
  optionResolvers: undefined as OptionResolverRegistry | undefined,
};

function createWrapper(contextValue = baseFieldContext) {
  return ({ children }: { children: React.ReactNode }) => (
    <FieldContext.Provider value={contextValue}>{children}</FieldContext.Provider>
  );
}

describe("useFieldOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves static options synchronously", () => {
    const staticOptions = [{ label: "A", value: "a" }];
    const { result } = renderHook(() => useFieldOptions(staticOptions), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.options).toEqual([{ label: "A", value: "a", disabled: false }]);
  });

  it("resolves inline function option fetchers", async () => {
    const fetcher = vi.fn().mockResolvedValue([{ label: "Async", value: "async" }]);
    const { result } = renderHook(() => useFieldOptions(fetcher), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.options).toEqual([{ label: "Async", value: "async", disabled: false }]);
    expect(fetcher).toHaveBeenCalledWith({
      formData: { categoryId: "cat_1" },
      contextData: undefined,
    });
  });

  it("resolves registry option fetchers", async () => {
    const categoryOptionsResolver = vi.fn().mockResolvedValue([{ label: "Cat 1 Item", value: "item1" }]);
    
    const contextValue = {
      ...baseFieldContext,
      optionResolvers: {
        fetchByCategory: categoryOptionsResolver,
      },
    };

    const resolverConfig = { resolver: "fetchByCategory", args: { limit: 10 } };

    const { result } = renderHook(() => useFieldOptions(resolverConfig), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.options).toEqual([{ label: "Cat 1 Item", value: "item1", disabled: false }]);
    expect(categoryOptionsResolver).toHaveBeenCalledWith({
      formData: { categoryId: "cat_1" },
      contextData: undefined,
    }, { limit: 10 });
  });

  it("errors gracefully if registry resolver is missing", async () => {
    const contextValue = {
      ...baseFieldContext,
      optionResolvers: {}, // Missing our resolver
    };

    const resolverConfig = { resolver: "missingResolver" };

    const { result } = renderHook(() => useFieldOptions(resolverConfig), {
      wrapper: createWrapper(contextValue),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain("not found in registry");
  });
});
