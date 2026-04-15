// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useFieldOptions } from "./use-field-options";
import { FieldContext } from "../field-context";
import type { FormRegistries } from "@buildnbuzz/form-core";
import type { FieldFormApi, UnknownData } from "../../types";

describe("useFieldOptions - cascading dropdown integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockContext({
    values = {},
    dependencies = [],
    optionResolvers = {},
    initialValue = undefined,
  }: {
    values?: Record<string, unknown>;
    dependencies?: string[];
    optionResolvers?: OptionResolverRegistry;
    initialValue?: unknown;
  }) {
    const mockStore = {
      state: { values },
      subscribe: vi.fn(() => () => {}),
    };

    const mockForm = { store: mockStore } as unknown as FieldFormApi<UnknownData>;

    const handleChange = vi.fn();

    const context = {
      form: mockForm,
      field: {
        type: "select" as const,
        name: "city",
        dependencies,
      },
      formData: values,
      contextData: undefined,
      fieldPath: "/city",
      isHidden: false,
      isConditionMet: true,
      isDisabled: false,
      isReadOnly: false,
      isRequired: false,
      registries: {
        resolvers: optionResolvers,
      },
      fieldApi: {
        state: { value: initialValue },
        handleChange,
        name: "city",
      },
    };

    return { context, handleChange, mockStore };
  }

  function createWrapper(contextValue: Record<string, unknown>) {
    function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <FieldContext.Provider value={contextValue}>
          {children}
        </FieldContext.Provider>
      );
    }
    Wrapper.displayName = "TestFieldContextWrapper";
    return Wrapper;
  }

  it("clears field value when dependencies change", async () => {
    const statesResolver = vi.fn().mockResolvedValue([
      { label: "California", value: "CA" },
      { label: "Texas", value: "TX" },
    ]);

    const { context, handleChange, mockStore } = createMockContext({
      values: { country: "USA", state: "CA" },
      dependencies: ["/country"],
      optionResolvers: { getStates: statesResolver },
      initialValue: "CA",
    });

    // First render: country = USA, state = CA
    const { result, rerender } = renderHook(() => useFieldOptions({ resolver: "getStates" }), {
      wrapper: createWrapper(context),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.options).toHaveLength(2);

    // Simulate country change (dependency change)
    mockStore.state.values = { country: "Canada", state: "CA" };
    context.formData = { country: "Canada", state: "CA" };

    rerender();

    // Should clear the state value when dependency changes
    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(undefined);
    });
  });

  it("does not call resolver with stale dependency values", async () => {
    const citiesResolver = vi.fn().mockResolvedValue([
      { label: "Los Angeles", value: "LA" },
    ]);

    const { context, mockStore } = createMockContext({
      values: { country: "USA", state: "CA" },
      dependencies: ["/state"],
      optionResolvers: { getCities: citiesResolver },
      initialValue: "LA",
    });

    const { result, rerender } = renderHook(() => useFieldOptions({ resolver: "getCities" }), {
      wrapper: createWrapper(context),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(citiesResolver).toHaveBeenCalledTimes(1);
    expect(citiesResolver).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { country: "USA", state: "CA" },
      }),
      undefined,
    );

    // Change state dependency
    mockStore.state.values = { country: "USA", state: "TX" };
    context.formData = { country: "USA", state: "TX" };

    rerender();

    await waitFor(() => {
      expect(citiesResolver).toHaveBeenCalledTimes(2);
      expect(citiesResolver).toHaveBeenLastCalledWith(
        expect.objectContaining({
          data: { country: "USA", state: "TX" },
        }),
        undefined,
      );
    });
  });

  it("deduplicates concurrent resolver calls with same params", async () => {
    const slowResolver = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => {
            resolve([{ label: "City", value: "city" }]);
          }, 50),
        ),
    );

    const { context } = createMockContext({
      values: { country: "USA" },
      dependencies: ["/country"],
      optionResolvers: { getCities: slowResolver },
    });

    // Render two instances with the same dependencies (simulates duplicate render)
    const wrapper = createWrapper(context);
    const { result: result1 } = renderHook(() => useFieldOptions({ resolver: "getCities" }), {
      wrapper,
    });
    const { result: result2 } = renderHook(() => useFieldOptions({ resolver: "getCities" }), {
      wrapper,
    });

    // Wait for both to finish loading
    await waitFor(() => expect(result1.current.isLoading).toBe(false));
    await waitFor(() => expect(result2.current.isLoading).toBe(false));

    // Resolver should only be called once due to deduplication
    expect(slowResolver).toHaveBeenCalledTimes(1);
    expect(result1.current.options).toEqual(result2.current.options);
  });

  it("handles rapid dependency changes without stale data", async () => {
    const fetchCities = vi.fn().mockImplementation(async () => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 30));
      return [{ label: "City", value: "city" }];
    });

    const { context, mockStore } = createMockContext({
      values: { state: "CA" },
      dependencies: ["/state"],
      optionResolvers: { getCities: fetchCities },
    });

    const { result, rerender } = renderHook(() => useFieldOptions({ resolver: "getCities" }), {
      wrapper: createWrapper(context),
    });

    // Wait for initial load
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Rapidly change state multiple times
    for (const state of ["TX", "NY", "FL"]) {
      mockStore.state.values = { state };
      context.formData = { state };
      rerender();
      // Don't wait - simulate rapid changes
    }

    // Should eventually settle on the last value (FL)
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.options).toHaveLength(1);
  });
});
