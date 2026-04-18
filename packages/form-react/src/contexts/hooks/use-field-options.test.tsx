// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useFieldOptions } from "./use-field-options";
import { FieldContext, type FieldContextValue } from "../field-context";
import type {
  FieldOption,
  ExprContext,
  DataField,
} from "@buildnbuzz/form-core";
import type { FieldFormApi, UnknownData } from "../../types";

const mockStore = {
  state: {
    values: { categoryId: "cat_1" },
  },
  subscribe: vi.fn(),
};

const mockForm = {
  store: mockStore,
} as unknown as FieldFormApi<UnknownData>;

const mockFieldApi = {
  state: { value: undefined },
  handleChange: vi.fn(),
  name: "testField",
};

const baseFieldContext: FieldContextValue<DataField, UnknownData> = {
  form: mockForm,
  field: {
    type: "select" as const,
    name: "testField",
    dependencies: ["/categoryId"],
  } as DataField,
  formData: { categoryId: "cat_1" },
  contextData: undefined,
  fieldPath: "/testField",
  isHidden: false,
  isConditionMet: true,
  isDisabled: false,
  isReadOnly: false,
  isRequired: false,
  registries: undefined,
  fieldApi: mockFieldApi as unknown as FieldContextValue["fieldApi"],
};

function createWrapper(contextValue: FieldContextValue<DataField, UnknownData> = baseFieldContext) {
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
      data: { categoryId: "cat_1" },
      context: undefined,
    });
  });

  it("resolves registry option fetchers", async () => {
    const categoryOptionsResolver = vi.fn().mockResolvedValue([{ label: "Cat 1 Item", value: "item1" }]);
    
    const contextValue = {
      ...baseFieldContext,
      registries: {
        resolvers: {
          fetchByCategory: categoryOptionsResolver,
        },
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
      data: { categoryId: "cat_1" },
      context: undefined,
    }, { limit: 10 });
  });

  it("errors gracefully if registry resolver is missing", async () => {
    const contextValue = {
      ...baseFieldContext,
      registries: {
        resolvers: {}, // Missing our resolver
      },
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

  describe("individual option properties", () => {
    it("resolves per-option disabled Expr variants", () => {
      const options: FieldOption[] = [
        { label: "Literal", value: "literal", disabled: true },
        { label: "Data Ref", value: "data", disabled: { $data: "/disableOption" } },
        { label: "Context Ref", value: "context", disabled: { $context: "/lock" } },
        { label: "Inline Fn", value: "fn", disabled: ({ data }: ExprContext) => data.isLock === true },
        { label: "Registry Fn", value: "reg", disabled: { $fn: "checkLock" } },
      ];

      const contextValue = {
        ...baseFieldContext,
        formData: { disableOption: true, isLock: true },
        contextData: { lock: true },
        registries: {
          fns: {
            checkLock: () => true,
          },
        },
      };

      const { result } = renderHook(() => useFieldOptions(options), {
        wrapper: createWrapper(contextValue),
      });

      expect(result.current.options[0]?.disabled).toBe(true);  // Literal
      expect(result.current.options[1]?.disabled).toBe(true);  // $data
      expect(result.current.options[2]?.disabled).toBe(true);  // $context
      expect(result.current.options[3]?.disabled).toBe(true);  // Inline Fn
      expect(result.current.options[4]?.disabled).toBe(true);  // $fn
    });

    it("resolves $when branching for option disabled", () => {
      const options: FieldOption[] = [
        {
          label: "Branching",
          value: "v",
          disabled: {
            $when: { $data: "/mode", eq: "admin" },
            $then: false,
            $else: true,
          }
        },
      ];

      // Admin mode -> not disabled
      const { result: res1 } = renderHook(() => useFieldOptions(options), {
        wrapper: createWrapper({
          ...baseFieldContext,
          formData: { mode: "admin" },
        }),
      });
      expect(res1.current.options[0]?.disabled).toBe(false);

      // Guest mode -> disabled
      const { result: res2 } = renderHook(() => useFieldOptions(options), {
        wrapper: createWrapper({
          ...baseFieldContext,
          formData: { mode: "guest" },
        }),
      });
      expect(res2.current.options[0]?.disabled).toBe(true);
    });

    it("resolves logical groups for option disabled", () => {
      const options: FieldOption[] = [
        {
          label: "Logical",
          value: "v",
          disabled: { $and: [{ $data: "/a" }, { $data: "/b" }] }
        },
      ];

      const { result } = renderHook(() => useFieldOptions(options), {
        wrapper: createWrapper({
          ...baseFieldContext,
          formData: { a: true, b: true },
        }),
      });
      expect(result.current.options[0]?.disabled).toBe(true);
    });

    it("resolves per-option label Expr variants", () => {
      const options: FieldOption[] = [
        { label: { $data: "/name" }, value: "v1" },
        { label: { $context: "/role" }, value: "v2" },
      ];

      const { result } = renderHook(() => useFieldOptions(options), {
        wrapper: createWrapper({
          ...baseFieldContext,
          formData: { name: "John" },
          contextData: { role: "Admin" },
        }),
      });

      expect(result.current.options[0]?.label).toBe("John");
      expect(result.current.options[1]?.label).toBe("Admin");
    });
  });
});
