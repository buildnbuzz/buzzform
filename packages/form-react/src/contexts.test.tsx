import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DataField } from "@buildnbuzz/form-core";
import type { ReactNode } from "react";
import { Field } from "./field";
import { useFieldApi, useFieldContext, useFormContext } from "./contexts";
import type { FieldFormApi, UnknownData } from "./types";

function createFormHarness(values: UnknownData) {
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

describe("field context hooks", () => {
  it("throws when useFieldContext is used outside Field", () => {
    expect(() => render(<OutsideConsumer />)).toThrow(
      "useFieldContext must be used within a <Field> component",
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
});
