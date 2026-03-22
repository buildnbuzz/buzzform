import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { defineValidators, type DataField } from "@buildnbuzz/form-core";
import { Field } from "./field";
import type { AnyFieldValidators, FieldFormApi, UnknownData } from "./types";

function createFormHarness(values: UnknownData) {
  const fieldSpy = vi.fn();
  const subscribeSpy = vi.fn();
  const deleteFieldSpy = vi.fn();

  const form = {
    store: {
      state: {
        values,
      },
    },
    deleteField: deleteFieldSpy,
    Field: ({
      name,
      validators,
      children,
    }: {
      name: string;
      validators?: AnyFieldValidators;
      children: (field: unknown) => ReactNode;
    }) => {
      fieldSpy({ name, validators });
      return children({ name });
    },
    Subscribe: ({
      selector,
      children,
    }: {
      selector: (state: { values: UnknownData }) => unknown;
      children: (value: unknown) => ReactNode;
    }) => {
      const selected = selector({ values });
      subscribeSpy(selected);
      return children(selected);
    },
  } as unknown as FieldFormApi;

  return {
    form,
    fieldSpy,
    subscribeSpy,
    deleteFieldSpy,
  };
}

function renderField({
  field,
  values = {},
  validators,
  derivedValidationMode,
}: {
  field: DataField;
  values?: UnknownData;
  validators?: AnyFieldValidators;
  derivedValidationMode?: "change" | "blur" | "submit";
}) {
  const harness = createFormHarness(values);
  render(
    <Field
      field={field}
      form={harness.form}
      validators={validators}
      derivedValidationMode={derivedValidationMode}
    >
      <div data-testid="field-child">child</div>
    </Field>,
  );
  return harness;
}

describe("Field", () => {
  it("builds generated validators and supports derived checks on configured run", async () => {
    const field: DataField = {
      type: "text",
      name: "username",
      minLength: 3,
    };

    const { fieldSpy } = renderField({
      field,
      values: { username: "aa" },
      derivedValidationMode: "change",
    });

    const call = fieldSpy.mock.calls[0]?.[0] as { validators: AnyFieldValidators };
    expect(call.validators.onChangeAsync).toBeTypeOf("function");
    await expect(call.validators.onChangeAsync!("aa")).resolves.toBe(
      "Must be at least 3 characters.",
    );
    await expect(call.validators.onChangeAsync!("abcd")).resolves.toBeUndefined();
  });

  it("lets explicit validators override generated hooks", () => {
    const explicit = vi.fn();
    const field: DataField = {
      type: "text",
      name: "email",
      validate: {
        onBlur: {
          checks: [{ type: "email", message: "Invalid email" }],
        },
      },
    };

    const { fieldSpy } = renderField({
      field,
      validators: { onBlurAsync: explicit },
    });

    const call = fieldSpy.mock.calls[0]?.[0] as { validators: AnyFieldValidators };
    expect(call.validators.onBlurAsync).toBe(explicit);
  });

  it("renders null and deletes field when condition is false", async () => {
    const field: DataField = {
      type: "text",
      name: "nickname",
      condition: { $data: "/showNickname" },
    };

    const { fieldSpy, subscribeSpy, deleteFieldSpy } = renderField({
      field,
      values: { showNickname: false },
    });

    expect(subscribeSpy).toHaveBeenCalledWith([false]);
    expect(fieldSpy).not.toHaveBeenCalled();
    expect(screen.queryByTestId("field-child")).toBeNull();
    await waitFor(() => expect(deleteFieldSpy).toHaveBeenCalledWith("nickname"));
  });

  it("registers field but renders null when hidden is true", () => {
    const field: DataField = {
      type: "text",
      name: "nickname",
      hidden: { $data: "/hideNickname" },
    };

    const { fieldSpy } = renderField({
      field,
      values: { hideNickname: true },
    });

    expect(fieldSpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("field-child")).toBeNull();
  });

  it("subscribes when dependencies are present", () => {
    const field: DataField = {
      type: "text",
      name: "email",
      condition: { $data: "/showEmail" },
    };

    const { subscribeSpy } = renderField({
      field,
      values: { showEmail: true },
    });

    expect(subscribeSpy).toHaveBeenCalledWith([true]);
  });

  it("renders without subscribe when there are no dependencies", () => {
    const field: DataField = {
      type: "text",
      name: "name",
      validate: {
        onSubmit: {
          checks: [{ type: "required", message: "Name required" }],
        },
      },
    };

    const { subscribeSpy } = renderField({
      field,
      values: { name: "" },
    });

    expect(subscribeSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId("field-child").textContent).toBe("child");
  });

  it("runs custom validators through generated checks", async () => {
    const field: DataField = {
      type: "text",
      name: "confirm",
      validate: {
        onChange: {
          checks: [
            {
              type: "matchesContext",
              args: { other: { $context: "/expected" } },
              message: "No match",
            },
          ],
        },
      },
    };

    const harness = createFormHarness({ confirm: "wrong" });
    render(
      <Field
        field={field}
        form={harness.form}
        contextData={{ expected: "ok" }}
        customValidators={defineValidators({
          matchesContext: (value: string, args?: { other?: string }) =>
            value === args?.other,
        })}
      >
        <div />
      </Field>,
    );

    const call = harness.fieldSpy.mock.calls[0]?.[0] as {
      validators: AnyFieldValidators;
    };
    await expect(call.validators.onChangeAsync!("wrong")).resolves.toBe("No match");
    await expect(call.validators.onChangeAsync!("ok")).resolves.toBeUndefined();
  });
});
