import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Field as CoreField } from "@buildnbuzz/form-core";
import { FormProvider, useFieldContext } from "./contexts";
import { Form } from "./form";
import type { FieldFormApi, UnknownData } from "./types";

function createFormHarness(values: UnknownData) {
  const handleSubmit = vi.fn();
  const form = {
    handleSubmit,
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

  return { form, handleSubmit };
}

function TextRenderer() {
  const { field } = useFieldContext();
  return <div data-testid="text-field" data-name={field.name} />;
}

describe("Form", () => {
  it("renders children when provided", () => {
    const { form } = createFormHarness({});
    const fields: CoreField[] = [{ type: "text", name: "email" }];

    render(
      <FormProvider registry={{ text: TextRenderer }}>
        <Form form={form} fields={fields}>
          <div data-testid="child">Hello</div>
        </Form>
      </FormProvider>,
    );

    expect(screen.getByTestId("child")).not.toBeNull();
    expect(screen.queryByTestId("text-field")).toBeNull();
  });

  it("renders fields when children are omitted", () => {
    const { form } = createFormHarness({ email: "ada@example.com" });
    const fields: CoreField[] = [{ type: "text", name: "email" }];

    render(
      <FormProvider registry={{ text: TextRenderer }}>
        <Form form={form} fields={fields} />
      </FormProvider>,
    );

    const node = screen.getByTestId("text-field");
    expect(node.getAttribute("data-name")).toBe("email");
  });

  it("calls form.handleSubmit on submit", () => {
    const { form, handleSubmit } = createFormHarness({});

    render(<Form form={form} data-testid="form" />);

    fireEvent.submit(screen.getByTestId("form"));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("respects user submit cancellation", () => {
    const { form, handleSubmit } = createFormHarness({});
    const onSubmit = vi.fn((event) => event.preventDefault());

    render(<Form form={form} onSubmit={onSubmit} data-testid="form" />);

    fireEvent.submit(screen.getByTestId("form"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
