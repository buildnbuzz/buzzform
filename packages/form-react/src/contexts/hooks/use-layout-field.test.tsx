// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useLayoutField } from "./use-layout-field";
import { FieldContext, type FieldContextValue } from "../field-context";
import { type TabsField, type CollapsibleField, type Field as CoreField } from "@buildnbuzz/form-core";
import type { FieldFormApi, UnknownData } from "../../types";

const mockStore = {
  state: {
    values: { mode: "strict", collapsed: true },
  },
  subscribe: vi.fn(),
};

const mockForm = {
  store: mockStore,
} as unknown as FieldFormApi<UnknownData>;

const baseFieldContext: FieldContextValue<CoreField, UnknownData> = {
  form: mockForm,
  field: { type: "row", fields: [] } as CoreField,
  formData: { mode: "strict", collapsed: true },
  contextData: { theme: "dark" },
  fieldPath: "/test",
  isHidden: false,
  isConditionMet: true,
  isDisabled: false,
  isReadOnly: false,
  isRequired: false,
  registries: {
    fns: {
      isStrict: () => true,
    },
  },
};

function createWrapper(contextValue: FieldContextValue<CoreField, UnknownData>) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <FieldContext.Provider value={contextValue}>
      {children}
    </FieldContext.Provider>
  );
  Wrapper.displayName = "FieldContextWrapper";
  return Wrapper;
}

describe("useLayoutField", () => {
  it("resolves TabsField properties correctly", () => {
    const field: TabsField = {
      type: "tabs",
      tabs: [
        { label: { $data: "/mode" }, fields: [] },
        { label: "Static", fields: [], disabled: { $fn: "isStrict" } },
      ],
    };

    const { result } = renderHook(() => useLayoutField(), {
      wrapper: createWrapper({ ...baseFieldContext, field }),
    });

    expect(result.current.resolvedTabs).toEqual([
      { label: "strict", disabled: false },
      { label: "Static", disabled: true },
    ]);
  });

  it("resolves CollapsibleField properties correctly", () => {
    const field: CollapsibleField = {
      type: "collapsible",
      label: { $context: "/theme" },
      collapsed: { $data: "/collapsed" },
      fields: [],
    };

    const { result } = renderHook(() => useLayoutField(), {
      wrapper: createWrapper({ ...baseFieldContext, field }),
    });

    expect(result.current.resolvedCollapsible).toEqual({
      label: "dark",
      collapsed: true,
    });
  });

  it("defaults for non-tabs/non-collapsible fields", () => {
    const field: CoreField = { type: "row", fields: [] };
    const { result } = renderHook(() => useLayoutField(), {
      wrapper: createWrapper({ ...baseFieldContext, field }),
    });

    expect(result.current.resolvedTabs).toEqual([]);
    expect(result.current.resolvedCollapsible).toBeUndefined();
  });
});
