import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { defineValidators, type DataField } from "@buildnbuzz/form-core";
import { Field } from "./field";
import type { AnyFieldValidators, FieldFormApi, UnknownData } from "./types";
import {
  useFieldContext,
  useResolvedFieldText,
  type FieldContextValue,
} from "./contexts";

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

function ContextReader({
  spy,
}: {
  spy: (ctx: FieldContextValue) => void;
}) {
  const ctx = useFieldContext();
  spy(ctx);
  return <div data-testid="ctx-reader" />;
}

function TextResolverReader({
  spy,
}: {
  spy: (values: {
    label: string;
    placeholder: string;
    description: string;
  }) => void;
}) {
  const resolved = useResolvedFieldText();
  spy(resolved);
  return <div data-testid="text-resolver" />;
}

function renderField({
  field,
  values = {},
  validators,
  contextData,
  derivedValidationMode,
  child,
}: {
  field: DataField;
  values?: UnknownData;
  validators?: AnyFieldValidators;
  contextData?: UnknownData;
  derivedValidationMode?: "change" | "blur" | "submit";
  child?: ReactNode;
}) {
  const harness = createFormHarness(values);
  render(
    <Field
      field={field}
      form={harness.form}
      validators={validators}
      contextData={contextData}
      derivedValidationMode={derivedValidationMode}
    >
      {child ?? <div data-testid="field-child">child</div>}
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

  it("auto-wires onChange/onBlur listenTo from schema dependencies", () => {
    const field: DataField = {
      type: "text",
      name: "confirmPassword",
      validate: {
        onChange: {
          checks: [
            {
              type: "matches",
              message: "Must match password",
              args: { other: { $data: "/password" } },
            },
          ],
        },
        onBlur: {
          checks: [
            {
              type: "matches",
              message: "Must match password",
              args: { other: { $data: "/password" } },
            },
          ],
        },
      },
    };

    const { fieldSpy } = renderField({ field });
    const call = fieldSpy.mock.calls[0]?.[0] as { validators: AnyFieldValidators };

    expect(call.validators.onChangeListenTo).toEqual(["password"]);
    expect(call.validators.onBlurListenTo).toEqual(["password"]);
  });

  it("merges generated and explicit listenTo values", () => {
    const field: DataField = {
      type: "text",
      name: "confirmPassword",
      validate: {
        onChange: {
          checks: [
            {
              type: "matches",
              message: "Must match password",
              args: { other: { $data: "/password" } },
            },
          ],
        },
      },
    };

    const { fieldSpy } = renderField({
      field,
      validators: { onChangeListenTo: ["email", "password"] },
    });
    const call = fieldSpy.mock.calls[0]?.[0] as { validators: AnyFieldValidators };

    expect(call.validators.onChangeListenTo).toEqual(["password", "email"]);
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

  it("resolves relative $data paths against the field parent", () => {
    const field: DataField = {
      type: "text",
      name: "profile.email",
      condition: { $data: "showEmail" },
    };

    const { subscribeSpy } = renderField({
      field,
      values: { profile: { showEmail: true } },
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

  it("provides field context with runtime flags and data", () => {
    const ctxSpy = vi.fn();
    const field: DataField = {
      type: "text",
      name: "email",
      disabled: { $data: "/disableEmail" },
      readOnly: { $context: "/readOnlyEmail" },
    };

    renderField({
      field,
      values: { email: "ada@example.com", disableEmail: true },
      contextData: { readOnlyEmail: true },
      child: <ContextReader spy={ctxSpy} />,
    });

    const ctx = ctxSpy.mock.calls[0]?.[0] as FieldContextValue;
    expect(ctx.field.name).toBe("email");
    expect(ctx.formData).toEqual({
      email: "ada@example.com",
      disableEmail: true,
    });
    expect(ctx.contextData).toEqual({ readOnlyEmail: true });
    expect(ctx.isConditionMet).toBe(true);
    expect(ctx.isHidden).toBe(false);
    expect(ctx.isDisabled).toBe(true);
    expect(ctx.isReadOnly).toBe(true);
    expect(ctx.fieldApi).toEqual({ name: "email" });
  });

  it("resolves dynamic label/placeholder/description values", () => {
    const spy = vi.fn();
    const field: DataField = {
      type: "text",
      name: "email",
      label: { $data: "/labelValue" },
      placeholder: { $context: "/placeholderValue" },
      description: "Static description",
    };

    renderField({
      field,
      values: { labelValue: "Email" },
      contextData: { placeholderValue: "Type your email" },
      child: <TextResolverReader spy={spy} />,
    });

    const resolved = spy.mock.calls[0]?.[0] as {
      label: string;
      placeholder: string;
      description: string;
    };
    expect(resolved.label).toBe("Email");
    expect(resolved.placeholder).toBe("Type your email");
    expect(resolved.description).toBe("Static description");
  });
});
