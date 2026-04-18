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

  it("resolves $data references from formData", () => {
    // formData = { country: "USA" }
    const contextValue: TestContextValue = {
      ...baseFieldContext,
      field: {
        ...baseFieldContext.field,
        label: { $data: "/country" },
        placeholder: { $data: "/country" },
        description: { $data: "/country" },
      },
    };

    const { result } = renderHook(() => useResolvedFieldText(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current.label).toBe("USA");
    expect(result.current.placeholder).toBe("USA");
    expect(result.current.description).toBe("USA");
  });

  it("resolves $context references from contextData", () => {
    // contextData = { theme: "dark" }
    const contextValue: TestContextValue = {
      ...baseFieldContext,
      field: {
        ...baseFieldContext.field,
        label: { $context: "/theme" },
        placeholder: { $context: "/theme" },
        description: { $context: "/theme" },
      },
    };

    const { result } = renderHook(() => useResolvedFieldText(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current.label).toBe("dark");
    expect(result.current.placeholder).toBe("dark");
    expect(result.current.description).toBe("dark");
  });

  it("resolves $when/$then/$else branching", () => {
    const contextValue: TestContextValue = {
      ...baseFieldContext,
      field: {
        ...baseFieldContext.field,
        label: {
          $when: { $data: "/country", eq: "USA" },
          $then: "US Label",
          $else: "Other Label",
        },
        placeholder: {
          $when: { $data: "/country", eq: "USA" },
          $then: "Enter US state",
          $else: "Enter region",
        },
        description: {
          $when: { $data: "/country", eq: "USA" },
          $then: "US only field",
          $else: "Other field",
        },
      },
    };

    const { result } = renderHook(() => useResolvedFieldText(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current.label).toBe("US Label");
    expect(result.current.placeholder).toBe("Enter US state");
    expect(result.current.description).toBe("US only field");
  });

  it("resolves $when false branch", () => {
    const contextValue: TestContextValue = {
      ...baseFieldContext,
      field: {
        ...baseFieldContext.field,
        label: {
          $when: { $data: "/country", eq: "UK" },
          $then: "UK Label",
          $else: "Non-UK Label",
        },
      },
    };

    const { result } = renderHook(() => useResolvedFieldText(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current.label).toBe("Non-UK Label");
  });

  it("$fn resolves via fns registry forwarded from context", () => {
    const contextValue: TestContextValue = {
      ...baseFieldContext,
      field: {
        ...baseFieldContext.field,
        label: { $fn: "getLabel" },
        placeholder: { $fn: "getPlaceholder" },
        description: { $fn: "getDescription" },
      },
      registries: {
        fns: {
          getLabel: () => "Computed Label",
          getPlaceholder: () => "Computed Placeholder",
          getDescription: () => "Computed Description",
        },
      },
    };

    const { result } = renderHook(() => useResolvedFieldText(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current.label).toBe("Computed Label");
    expect(result.current.placeholder).toBe("Computed Placeholder");
    expect(result.current.description).toBe("Computed Description");
  });
});
