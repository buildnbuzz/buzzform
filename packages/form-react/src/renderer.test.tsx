// @vitest-environment jsdom
import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { DataField, Field as CoreField } from "@buildnbuzz/form-core";
import { toDotNotation } from "@buildnbuzz/form-core";
import { FormProvider, useFieldContext } from "./contexts";
import { FieldRenderer, RenderFields } from "./renderer";
import type { FieldFormApi, UnknownData } from "./types";
import type { FieldRegistry } from "./contexts";

afterEach(() => cleanup());

function createFormHarness(values: UnknownData) {
  const form = {
    store: { state: { values } },
    deleteField: () => undefined,
    Field: (({
      name,
      children,
    }: {
      name: string;
      children: (field: unknown) => ReactNode;
    }) => children({ name })) as unknown as FieldFormApi["Field"],
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
  const dataField = field as DataField;
  return (
    <div
      data-testid="text-field"
      data-name={dataField.name}
      data-api-name={(fieldApi as { name?: string }).name ?? ""}
    />
  );
}

function RowRenderer({ children }: { children?: ReactNode }) {
  return (
    <div data-testid="row-field">
      {children}
    </div>
  );
}

function GroupRenderer({ children }: { children?: ReactNode }) {
  const { field } = useFieldContext();
  const dataField = field as DataField;
  return (
    <div
      data-testid="group-field"
      data-name={dataField.name}
    >
      {children}
    </div>
  );
}

function createTestRegistry(): FieldRegistry {
  let registry: FieldRegistry = {};

  function TabsRenderer() {
    const { field, fieldPath, form, contextData } = useFieldContext();
    if (field.type !== "tabs") return null;
    const basePath = toDotNotation(fieldPath);
    return (
      <div data-testid="tabs-field">
        {field.tabs.map((tab, index) => (
          <RenderFields
            key={`${tab.label}-${index}`}
            fields={tab.fields}
            form={form}
            contextData={contextData}
            registry={registry}
            basePath={basePath}
          />
        ))}
      </div>
    );
  }

  function ArrayRenderer() {
    const { field, fieldPath, form, contextData } = useFieldContext();
    if (field.type !== "array") return null;
    const arrayPointer = fieldPath || "";
    const itemPointer = arrayPointer ? `${arrayPointer}/*` : "/*";
    const basePath = toDotNotation(itemPointer);
    return (
      <div data-testid="array-field">
        <RenderFields
          fields={field.fields}
          form={form}
          contextData={contextData}
          registry={registry}
          basePath={basePath}
        />
      </div>
    );
  }

  registry = {
    text: TextRenderer,
    row: RowRenderer,
    group: GroupRenderer,
    tabs: TabsRenderer,
    array: ArrayRenderer,
  };

  return registry;
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

  it("resolves nested group child field names", () => {
    const { form } = createFormHarness({ profile: { email: "ada@example.com" } });
    const fields: CoreField[] = [
      {
        type: "group",
        name: "profile",
        fields: [{ type: "text", name: "email" }],
      },
    ];

    render(
      <RenderFields
        fields={fields}
        form={form}
        registry={{
          group: GroupRenderer,
          text: TextRenderer,
        }}
      />,
    );

    const group = screen.getByTestId("group-field");
    expect(group.getAttribute("data-name")).toBe("profile");

    const text = screen.getByTestId("text-field");
    expect(text.getAttribute("data-name")).toBe("profile.email");
    expect(text.getAttribute("data-api-name")).toBe("profile.email");
  });

  it("traverses tabs and rows with inherited base path", () => {
    const { form } = createFormHarness({
      profile: { details: { email: "ada@example.com" } },
    });
    const registry = createTestRegistry();
    const fields: CoreField[] = [
      {
        type: "group",
        name: "profile",
        fields: [
          {
            type: "tabs",
            tabs: [
              {
                label: "Details",
                fields: [
                  {
                    type: "row",
                    fields: [{ type: "text", name: "details.email" }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    render(
      <RenderFields
        fields={fields}
        form={form}
        registry={registry}
      />,
    );

    const text = screen.getByTestId("text-field");
    expect(text.getAttribute("data-name")).toBe("profile.details.email");
    expect(text.getAttribute("data-api-name")).toBe("profile.details.email");
    const row = screen.getByTestId("row-field");
    expect(row).not.toBeNull();
    expect(row.contains(text)).toBe(true);
  });

  it("uses wildcard base path when traversing array item fields", () => {
    const { form } = createFormHarness({
      addresses: [{ city: "Toronto" }],
    });
    const registry = createTestRegistry();
    const fields: CoreField[] = [
      {
        type: "array",
        name: "addresses",
        fields: [{ type: "text", name: "city" }],
      },
    ];

    render(
      <RenderFields
        fields={fields}
        form={form}
        registry={registry}
      />,
    );

    const text = screen.getByTestId("text-field");
    expect(text.getAttribute("data-name")).toBe("addresses.*.city");
    expect(text.getAttribute("data-api-name")).toBe("addresses.*.city");
  });

  it("hides layout fields when hidden evaluates true using relative data paths", () => {
    const { form } = createFormHarness({
      profile: { hideRow: true, email: "ada@example.com" },
    });
    const fields: CoreField[] = [
      {
        type: "group",
        name: "profile",
        fields: [
          {
            type: "row",
            hidden: { $data: "hideRow", eq: true },
            fields: [{ type: "text", name: "email" }],
          },
        ],
      },
    ];

    render(
      <RenderFields
        fields={fields}
        form={form}
        registry={{
          row: RowRenderer,
          text: TextRenderer,
        }}
      />,
    );

    expect(screen.queryByTestId("row-field")).toBeNull();
    expect(screen.queryByTestId("text-field")).toBeNull();
  });

  it("removes layout fields when condition evaluates false", () => {
    const { form } = createFormHarness({
      profile: { showRow: false, email: "ada@example.com" },
    });
    const fields: CoreField[] = [
      {
        type: "group",
        name: "profile",
        fields: [
          {
            type: "row",
            condition: { $data: "showRow", eq: true },
            fields: [{ type: "text", name: "email" }],
          },
        ],
      },
    ];

    render(
      <RenderFields
        fields={fields}
        form={form}
        registry={{
          row: RowRenderer,
          text: TextRenderer,
        }}
      />,
    );

    expect(screen.queryByTestId("row-field")).toBeNull();
    expect(screen.queryByTestId("text-field")).toBeNull();
  });

  it("renders layout fields when condition evaluates true with relative data path", () => {
    const { form } = createFormHarness({
      profile: { showRow: true, email: "ada@example.com" },
    });
    const fields: CoreField[] = [
      {
        type: "group",
        name: "profile",
        fields: [
          {
            type: "row",
            condition: { $data: "showRow", eq: true },
            fields: [{ type: "text", name: "email" }],
          },
        ],
      },
    ];

    render(
      <RenderFields
        fields={fields}
        form={form}
        registry={{
          row: RowRenderer,
          text: TextRenderer,
        }}
      />,
    );

    expect(screen.getByTestId("row-field")).not.toBeNull();
    expect(screen.getByTestId("text-field")).not.toBeNull();
  });
});
