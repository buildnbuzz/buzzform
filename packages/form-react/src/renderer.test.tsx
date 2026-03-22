import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Field as CoreField } from "@buildnbuzz/form-core";
import { FormProvider, useFieldContext } from "./contexts";
import { FieldRenderer, RenderFields } from "./renderer";
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

function TextRenderer() {
  const { field, fieldApi } = useFieldContext();
  return (
    <div
      data-testid="text-field"
      data-name={field.name}
      data-api-name={(fieldApi as { name?: string }).name ?? ""}
    />
  );
}

function RowRenderer() {
  return <div data-testid="row-field" />;
}

describe("FieldRenderer", () => {
  it("renders data fields through Field wrapper and exposes context", () => {
    const { form } = createFormHarness({ email: "ada@example.com" });
    const field: CoreField = { type: "text", name: "email" };

    render(
      <FieldRenderer
        field={field}
        form={form}
        registry={{ text: TextRenderer }}
      />,
    );

    const node = screen.getByTestId("text-field");
    expect(node.getAttribute("data-name")).toBe("email");
    expect(node.getAttribute("data-api-name")).toBe("email");
  });

  it("renders layout fields directly from registry", () => {
    const { form } = createFormHarness({});
    const field: CoreField = { type: "row", fields: [] };

    render(
      <FieldRenderer
        field={field}
        form={form}
        registry={{ row: RowRenderer }}
      />,
    );

    expect(screen.getByTestId("row-field")).not.toBeNull();
  });

  it("uses fallback when field type is missing in registry", () => {
    const { form } = createFormHarness({});
    const field = { type: "missing" } as unknown as CoreField;

    render(
      <FieldRenderer
        field={field}
        form={form}
        registry={{}}
        renderFallback={(node) => (
          <div data-testid="fallback">{String(node.type)}</div>
        )}
      />,
    );

    expect(screen.getByTestId("fallback").textContent).toBe("missing");
  });
});

describe("RenderFields", () => {
  it("renders all fields using registry", () => {
    const { form } = createFormHarness({ email: "ada@example.com" });
    const fields: CoreField[] = [
      { type: "text", name: "email" },
      { type: "row", fields: [] },
    ];

    render(
      <RenderFields
        fields={fields}
        form={form}
        registry={{
          text: TextRenderer,
          row: RowRenderer,
        }}
      />,
    );

    expect(screen.getByTestId("text-field")).not.toBeNull();
    expect(screen.getByTestId("row-field")).not.toBeNull();
  });

  it("reads registry from FormProvider when prop is omitted", () => {
    const { form } = createFormHarness({ email: "ada@example.com" });
    const fields: CoreField[] = [{ type: "text", name: "email" }];

    render(
      <FormProvider registry={{ text: TextRenderer }}>
        <RenderFields fields={fields} form={form} />
      </FormProvider>,
    );

    expect(screen.getByTestId("text-field")).not.toBeNull();
  });
});
