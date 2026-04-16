// @vitest-environment jsdom
import React from "react";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { FormRegistries } from "@buildnbuzz/form-core";
import { FieldContext } from "../field-context";
import { useResolvedFieldText } from "./use-resolved-field-text";
import type { FieldFormApi, UnknownData } from "../../types";

type CountryFormData = {
  country: string;
};

type TestField = {
  type: "text";
  name: string;
  label?: unknown;
  placeholder?: unknown;
  description?: unknown;
};

type TestContextValue = {
  form: FieldFormApi<UnknownData>;
  field: TestField;
  formData: CountryFormData;
  contextData: {
    theme: string;
  };
  fieldPath: string;
  isHidden: boolean;
  isConditionMet: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  registries: FormRegistries;
  fieldApi: FieldFormApi<UnknownData>;
};

const mockForm = {
  store: {
    state: {
      values: { country: "USA" },
    },
  },
} as unknown as FieldFormApi<UnknownData>;

const baseFieldContext: TestContextValue = {
  form: mockForm,
  field: {
    type: "text",
    name: "testField",
    label: "Static Label",
    placeholder: "Static Placeholder",
    description: "Static Description",
  },
  formData: { country: "USA" },
  contextData: { theme: "dark" },
  fieldPath: "/testField",
  isHidden: false,
  isConditionMet: true,
  isDisabled: false,
  isReadOnly: false,
  isRequired: false,
  registries: {} as FormRegistries,
  fieldApi: mockForm,
};

function createWrapper(contextValue: TestContextValue = baseFieldContext) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <FieldContext.Provider value={contextValue}>
        {children}
      </FieldContext.Provider>
    );
  };
}

describe("useResolvedFieldText", () => {
  it("resolves static strings", () => {
    const { result } = renderHook(() => useResolvedFieldText(), {
      wrapper: createWrapper(),
    });

    expect(result.current.label).toBe("Static Label");
    expect(result.current.placeholder).toBe("Static Placeholder");
    expect(result.current.description).toBe("Static Description");
  });

  it("resolves functions for label, placeholder, and description", () => {
    const contextValue: TestContextValue = {
      ...baseFieldContext,
      field: {
        ...baseFieldContext.field,
        label: ({ data }: { data: CountryFormData }) =>
          `Label for ${data.country}`,
        placeholder: ({ data }: { data: CountryFormData }) =>
          `Enter state in ${data.country}`,
        description: ({ data }: { data: CountryFormData }) =>
          `Description for ${data.country}`,
      },
    };

    const { result } = renderHook(() => useResolvedFieldText(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current.label).toBe("Label for USA");
    expect(result.current.placeholder).toBe("Enter state in USA");
    expect(result.current.description).toBe("Description for USA");
  });

  it("resolves expressions for label, placeholder, and description", () => {
    const contextValue: TestContextValue = {
      ...baseFieldContext,
      field: {
        ...baseFieldContext.field,
        label: { $text: "Label for ${/country}" },
        placeholder: { $text: "Enter state in ${/country}" },
        description: { $text: "Description for ${/country}" },
      },
    };

    const { result } = renderHook(() => useResolvedFieldText(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current.label).toBe("Label for USA");
    expect(result.current.placeholder).toBe("Enter state in USA");
    expect(result.current.description).toBe("Description for USA");
  });

  it("falls back when values are missing", () => {
    const contextValue: TestContextValue = {
      ...baseFieldContext,
      field: {
        ...baseFieldContext.field,
        label: undefined,
        placeholder: undefined,
        description: undefined,
      },
    };

    const { result } = renderHook(
      () =>
        useResolvedFieldText({
          labelFallback: "Fallback Label",
          placeholderFallback: "Fallback Placeholder",
          descriptionFallback: "Fallback Description",
        }),
      {
        wrapper: createWrapper(contextValue),
      },
    );

    expect(result.current.label).toBe("Fallback Label");
    expect(result.current.placeholder).toBe("Fallback Placeholder");
    expect(result.current.description).toBe("Fallback Description");
  });
});
