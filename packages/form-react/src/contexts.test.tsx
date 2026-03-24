import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DataField, Field as CoreField } from "@buildnbuzz/form-core";
import type { ReactNode } from "react";
import { Field, LayoutField } from "./field";
import {
  useFieldA11yIds,
  useFieldApi,
  useFieldContext,
  useDataFieldContext,
  useFieldErrorState,
  useDataField,
  useFormContext,
} from "./contexts";
import type { FieldFormApi, UnknownData } from "./types";

function createFormHarness(
  values: UnknownData,
  metaOverrides: {
    isTouched?: boolean;
    isDirty?: boolean;
    isValid?: boolean;
    errors?: unknown[];
  } = {},
  submissionAttempts = 0,
) {
  const form = {
    store: { state: { values } },
    deleteField: () => undefined,
    Field: ({
      name,
      children,
    }: {
      name: string;
      children: (field: unknown) => ReactNode;
    }) => children({ name }),
    Subscribe: ({
      selector,
      children,
    }: {
      selector: (state: { values: UnknownData }) => unknown;
      children: (value: unknown) => ReactNode;
    }) => children(selector({ values })),
  } as unknown as FieldFormApi;

  const fieldApi = {
    name: "email",
    state: {
      meta: {
        isTouched: false,
        isDirty: false,
        isValid: true,
        errors: [],
        ...metaOverrides,
      },
    },
    form: {
      state: {
        submissionAttempts,
      },
    },
  };

  (form as FieldFormApi).Field = ({
    name,
    children,
  }: {
    name: string;
    children: (field: unknown) => ReactNode;
  }) => {
    fieldApi.name = name;
    return children(fieldApi);
  };

  return { form };
}

function HookConsumer() {
  const ctx = useFieldContext();
  const fieldApi = useFieldApi();
  const form = useFormContext();
  return (
    <div
      data-testid="ctx"
      data-name={ctx.field.name}
      data-api-name={(fieldApi as { name?: string }).name ?? ""}
      data-has-form={String(Boolean(form))}
    />
  );
}

function OutsideConsumer() {
  useFieldContext();
  return null;
}

function DataFieldConsumer({
  spy,
}: {
  spy: (value: ReturnType<typeof useDataFieldContext>) => void;
}) {
  const value = useDataFieldContext();
  spy(value);
  return null;
}

function ErrorStateConsumer({
  spy,
}: {
  spy: (value: ReturnType<typeof useFieldErrorState>) => void;
}) {
  const value = useFieldErrorState();
  spy(value);
  return null;
}

function UiStateConsumer({
  spy,
}: {
  spy: (value: ReturnType<typeof useDataField>) => void;
}) {
  const value = useDataField({ labelFallback: "Email" });
  spy(value);
  return null;
}

function A11yIdsConsumer({
  fieldId,
  description,
  isInvalid,
  spy,
}: {
  fieldId: string;
  description?: string;
  isInvalid?: boolean;
  spy: (value: ReturnType<typeof useFieldA11yIds>) => void;
}) {
  const value = useFieldA11yIds({ fieldId, description, isInvalid });
  spy(value);
  return null;
}

describe("field context hooks", () => {
  it("throws when useFieldContext is used outside Field", () => {
    expect(() => render(<OutsideConsumer />)).toThrow(
      "useFieldContext must be used within a BuzzForm <Field> or <LayoutField> component",
    );
  });

  it("exposes context values through convenience hooks", () => {
    const field: DataField = { type: "text", name: "email" };
    const { form } = createFormHarness({ email: "ada@example.com" });

    const { getByTestId } = render(
      <Field
        field={field}
        form={form}
      >
        <HookConsumer />
      </Field>,
    );

    const node = getByTestId("ctx");
    expect(node.getAttribute("data-name")).toBe("email");
    expect(node.getAttribute("data-api-name")).toBe("email");
    expect(node.getAttribute("data-has-form")).toBe("true");
  });

  it("throws when useDataFieldContext is used without field api", () => {
    const { form } = createFormHarness({ email: "ada@example.com" });
    const field: CoreField = { type: "row", fields: [] };
    expect(() =>
      render(
        <LayoutField
          field={field}
          form={form}
          basePath=""
        >
          <DataFieldConsumer spy={vi.fn()} />
        </LayoutField>,
      ),
    ).toThrow("useDataFieldContext must be used within a BuzzForm data field");
  });

  it("normalizes errors and computes invalid state", () => {
    const field: DataField = { type: "text", name: "email" };
    const { form } = createFormHarness(
      { email: "" },
      {
        isTouched: true,
        isValid: false,
        errors: ["Required", { message: "Too short" }, undefined],
      },
    );
    const spy = vi.fn();

    render(
      <Field
        field={field}
        form={form}
      >
        <ErrorStateConsumer spy={spy} />
      </Field>,
    );

    const value = spy.mock.calls[0]?.[0];
    expect(value.shouldShowErrors).toBe(true);
    expect(value.isInvalid).toBe(true);
    expect(value.errors).toEqual([
      { message: "Required" },
      { message: "Too short" },
    ]);
  });

  it("aggregates ui state for data fields", () => {
    const field: DataField = { type: "text", name: "email", label: "Email" };
    const { form } = createFormHarness(
      { email: "ada@example.com" },
      {
        isTouched: true,
        isValid: false,
        errors: ["Required"],
      },
    );
    const spy = vi.fn();

    render(
      <Field
        field={field}
        form={form}
      >
        <UiStateConsumer spy={spy} />
      </Field>,
    );

    const value = spy.mock.calls[0]?.[0];
    expect(value.label).toBe("Email");
    expect(value.description).toBe("");
    expect(value.isInvalid).toBe(true);
    expect(value.descriptionId).toBeUndefined();
    expect(value.errorId).toBe("email-error");
    expect(value.ariaDescribedBy).toBe("email-error");
  });

  it("builds aria-describedby ids from helper", () => {
    const spy = vi.fn();
    render(
      <A11yIdsConsumer
        fieldId="email"
        description="Helpful"
        isInvalid
        spy={spy}
      />,
    );

    expect(spy).toHaveBeenCalledWith({
      descriptionId: "email-description",
      errorId: "email-error",
      ariaDescribedBy: "email-description email-error",
    });
  });
});
