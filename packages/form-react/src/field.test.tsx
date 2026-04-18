// @vitest-environment jsdom
import type { ReactNode } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineValidators, type DataField } from "@buildnbuzz/form-core";
import { Field } from "./field";
import type { AnyFieldValidators, FieldFormApi, UnknownData } from "./types";
import {
  useFieldContext,
  useResolvedFieldText,
  type FieldContextValue,
} from "./contexts";

afterEach(() => cleanup());

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
    Field: (({
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
    }) as unknown as FieldFormApi["Field"],
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
    label: ReactNode;
    placeholder: string;
    description: ReactNode;
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
      required: { $data: "/requireEmail", eq: true },
    };

    renderField({
      field,
      values: {
        email: "ada@example.com",
        disableEmail: true,
        requireEmail: true,
      },
      contextData: { readOnlyEmail: true },
      child: <ContextReader spy={ctxSpy} />,
    });

    const ctx = ctxSpy.mock.calls[0]?.[0] as FieldContextValue;
    const dataField = ctx.field as DataField;
    expect(dataField.name).toBe("email");
    expect(ctx.formData).toEqual({
      email: "ada@example.com",
      disableEmail: true,
      requireEmail: true,
    });
    expect(ctx.fieldPath).toBe("/email");
    expect(ctx.contextData).toEqual({ readOnlyEmail: true });
    expect(ctx.isConditionMet).toBe(true);
    expect(ctx.isHidden).toBe(false);
    expect(ctx.isDisabled).toBe(true);
    expect(ctx.isReadOnly).toBe(true);
    expect(ctx.isRequired).toBe(true);
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

// ============================================================================
// Expr<boolean> variants for condition / hidden / readOnly / disabled
// ============================================================================

function renderFieldWithRegistries({
  field,
  values = {},
  contextData,
  registries,
  child,
}: {
  field: DataField;
  values?: UnknownData;
  contextData?: UnknownData;
  registries?: import("@buildnbuzz/form-core").FormRegistries;
  child?: ReactNode;
}) {
  const harness = createFormHarness(values);
  render(
    <Field
      field={field}
      form={harness.form}
      contextData={contextData}
      registries={registries}
    >
      {child ?? <div data-testid="field-child">child</div>}
    </Field>,
  );
  return harness;
}

describe("Field — condition Expr<boolean> variants", () => {
  it("literal true — renders field", () => {
    const { fieldSpy } = renderFieldWithRegistries({
      field: { type: "text", name: "x", condition: true },
    });
    expect(fieldSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("field-child")).toBeTruthy();
  });

  it("literal false — removes field", async () => {
    const { fieldSpy, deleteFieldSpy } = renderFieldWithRegistries({
      field: { type: "text", name: "x", condition: false },
    });
    expect(fieldSpy).not.toHaveBeenCalled();
    await waitFor(() => expect(deleteFieldSpy).toHaveBeenCalledWith("x"));
  });

  it("$context path — false removes field", async () => {
    const { fieldSpy, deleteFieldSpy } = renderFieldWithRegistries({
      field: { type: "text", name: "x", condition: { $context: "/show" } },
      contextData: { show: false },
    });
    expect(fieldSpy).not.toHaveBeenCalled();
    await waitFor(() => expect(deleteFieldSpy).toHaveBeenCalledWith("x"));
  });

  it("$context path — true renders field", () => {
    const { fieldSpy } = renderFieldWithRegistries({
      field: { type: "text", name: "x", condition: { $context: "/show" } },
      contextData: { show: true },
    });
    expect(fieldSpy).toHaveBeenCalledTimes(1);
  });

  it("inline fn — true renders field", () => {
    const { fieldSpy } = renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        condition: (ctx) => Boolean(ctx.data.flag),
      },
      values: { flag: true },
    });
    expect(fieldSpy).toHaveBeenCalledTimes(1);
  });

  it("inline fn — false removes field", async () => {
    const { fieldSpy, deleteFieldSpy } = renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        condition: (ctx) => Boolean(ctx.data.flag),
      },
      values: { flag: false },
    });
    expect(fieldSpy).not.toHaveBeenCalled();
    await waitFor(() => expect(deleteFieldSpy).toHaveBeenCalledWith("x"));
  });

  it("inline fn receives contextData", async () => {
    const { fieldSpy, deleteFieldSpy } = renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        condition: (ctx) => ctx.context?.["role"] === "admin",
      },
      contextData: { role: "guest" },
    });
    expect(fieldSpy).not.toHaveBeenCalled();
    await waitFor(() => expect(deleteFieldSpy).toHaveBeenCalledWith("x"));
  });

  it("$fn — true renders field", () => {
    const { fieldSpy } = renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        condition: { $fn: "isActive", args: { key: "/flag" } },
      },
      values: { flag: true },
      registries: {
        fns: { isActive: ({ data }) => Boolean(data.flag) },
      },
    });
    expect(fieldSpy).toHaveBeenCalledTimes(1);
  });

  it("$fn — false removes field", async () => {
    const { fieldSpy, deleteFieldSpy } = renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        condition: { $fn: "isActive" },
      },
      values: { flag: false },
      registries: {
        fns: { isActive: ({ data }) => Boolean(data.flag) },
      },
    });
    expect(fieldSpy).not.toHaveBeenCalled();
    await waitFor(() => expect(deleteFieldSpy).toHaveBeenCalledWith("x"));
  });

  it("$when/$then/$else — true branch renders field", () => {
    const { fieldSpy } = renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        condition: {
          $when: { $data: "/role", eq: "admin" },
          $then: true,
          $else: false,
        },
      },
      values: { role: "admin" },
    });
    expect(fieldSpy).toHaveBeenCalledTimes(1);
  });

  it("$when/$then/$else — false branch removes field", async () => {
    const { fieldSpy, deleteFieldSpy } = renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        condition: {
          $when: { $data: "/role", eq: "admin" },
          $then: true,
          $else: false,
        },
      },
      values: { role: "guest" },
    });
    expect(fieldSpy).not.toHaveBeenCalled();
    await waitFor(() => expect(deleteFieldSpy).toHaveBeenCalledWith("x"));
  });

  it("$and — all true renders field", () => {
    const { fieldSpy } = renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        condition: {
          $and: [{ $data: "/active" }, { $data: "/role", eq: "admin" }],
        },
      },
      values: { active: true, role: "admin" },
    });
    expect(fieldSpy).toHaveBeenCalledTimes(1);
  });

  it("$and — any false removes field", async () => {
    const { deleteFieldSpy } = renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        condition: {
          $and: [{ $data: "/active" }, { $data: "/role", eq: "admin" }],
        },
      },
      values: { active: true, role: "guest" },
    });
    await waitFor(() => expect(deleteFieldSpy).toHaveBeenCalledWith("x"));
  });

  it("$or — any true renders field", () => {
    const { fieldSpy } = renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        condition: {
          $or: [{ $data: "/inactive" }, { $data: "/role", eq: "admin" }],
        },
      },
      values: { inactive: false, role: "admin" },
    });
    expect(fieldSpy).toHaveBeenCalledTimes(1);
  });

  it("$or — all false removes field", async () => {
    const { deleteFieldSpy } = renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        condition: {
          $or: [{ $data: "/inactive" }, { $data: "/role", eq: "admin" }],
        },
      },
      values: { inactive: false, role: "guest" },
    });
    await waitFor(() => expect(deleteFieldSpy).toHaveBeenCalledWith("x"));
  });
});

describe("Field — hidden Expr<boolean> variants", () => {
  it("literal true — registers but hides child", () => {
    const { fieldSpy } = renderFieldWithRegistries({
      field: { type: "text", name: "x", hidden: true },
    });
    expect(fieldSpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("field-child")).toBeNull();
  });

  it("literal false — shows child", () => {
    const { fieldSpy } = renderFieldWithRegistries({
      field: { type: "text", name: "x", hidden: false },
    });
    expect(fieldSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("field-child")).toBeTruthy();
  });

  it("$context path — true hides child", () => {
    const { fieldSpy } = renderFieldWithRegistries({
      field: { type: "text", name: "x", hidden: { $context: "/isHidden" } },
      contextData: { isHidden: true },
    });
    expect(fieldSpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("field-child")).toBeNull();
  });

  it("inline fn — true hides child", () => {
    const { fieldSpy } = renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        hidden: (ctx) => ctx.data.hide === true,
      },
      values: { hide: true },
    });
    expect(fieldSpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("field-child")).toBeNull();
  });

  it("inline fn — false shows child", () => {
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        hidden: (ctx) => ctx.data.hide === true,
      },
      values: { hide: false },
    });
    expect(screen.getByTestId("field-child")).toBeTruthy();
  });

  it("$fn — true hides child", () => {
    const { fieldSpy } = renderFieldWithRegistries({
      field: { type: "text", name: "x", hidden: { $fn: "shouldHide" } },
      values: { hide: true },
      registries: {
        fns: { shouldHide: ({ data }) => Boolean(data.hide) },
      },
    });
    expect(fieldSpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("field-child")).toBeNull();
  });

  it("$when — true branch hides child", () => {
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        hidden: {
          $when: { $data: "/mode", eq: "preview" },
          $then: true,
          $else: false,
        },
      },
      values: { mode: "preview" },
    });
    expect(screen.queryByTestId("field-child")).toBeNull();
  });

  it("$and — all true hides child", () => {
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        hidden: { $and: [{ $data: "/a" }, { $data: "/b" }] },
      },
      values: { a: true, b: true },
    });
    expect(screen.queryByTestId("field-child")).toBeNull();
  });

  it("$or — any true hides child", () => {
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        hidden: { $or: [{ $data: "/a" }, { $data: "/b" }] },
      },
      values: { a: false, b: true },
    });
    expect(screen.queryByTestId("field-child")).toBeNull();
  });
});

describe("Field — disabled Expr<boolean> variants", () => {
  function readCtx(spy: ReturnType<typeof vi.fn>): FieldContextValue {
    return spy.mock.calls[0]?.[0] as FieldContextValue;
  }

  it("literal true — isDisabled true", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: { type: "text", name: "x", disabled: true },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isDisabled).toBe(true);
  });

  it("literal false — isDisabled false", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: { type: "text", name: "x", disabled: false },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isDisabled).toBe(false);
  });

  it("$data path — isDisabled true", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: { type: "text", name: "x", disabled: { $data: "/lock" } },
      values: { lock: true },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isDisabled).toBe(true);
  });

  it("$context path — isDisabled true", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: { type: "text", name: "x", disabled: { $context: "/lock" } },
      contextData: { lock: true },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isDisabled).toBe(true);
  });

  it("inline fn — isDisabled from data", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        disabled: (ctx) => ctx.data.lock === true,
      },
      values: { lock: true },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isDisabled).toBe(true);
  });

  it("inline fn — isDisabled false when condition fails", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        disabled: (ctx) => ctx.data.lock === true,
      },
      values: { lock: false },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isDisabled).toBe(false);
  });

  it("inline fn receives contextData for disabled", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        disabled: (ctx) => ctx.context?.["perm"] === "readonly",
      },
      contextData: { perm: "readonly" },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isDisabled).toBe(true);
  });

  it("$fn — isDisabled true", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: { type: "text", name: "x", disabled: { $fn: "checkLock" } },
      values: { lock: true },
      registries: {
        fns: { checkLock: ({ data }) => Boolean(data.lock) },
      },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isDisabled).toBe(true);
  });

  it("$when — isDisabled from branch", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        disabled: {
          $when: { $data: "/role", eq: "viewer" },
          $then: true,
          $else: false,
        },
      },
      values: { role: "viewer" },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isDisabled).toBe(true);
  });

  it("$and — all true → isDisabled true", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        disabled: { $and: [{ $data: "/a" }, { $data: "/b" }] },
      },
      values: { a: true, b: true },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isDisabled).toBe(true);
  });

  it("$or — any true → isDisabled true", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        disabled: { $or: [{ $data: "/a" }, { $data: "/b" }] },
      },
      values: { a: false, b: true },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isDisabled).toBe(true);
  });
});

describe("Field — readOnly Expr<boolean> variants", () => {
  function readCtx(spy: ReturnType<typeof vi.fn>): FieldContextValue {
    return spy.mock.calls[0]?.[0] as FieldContextValue;
  }

  it("literal true — isReadOnly true", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: { type: "text", name: "x", readOnly: true },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isReadOnly).toBe(true);
  });

  it("literal false — isReadOnly false", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: { type: "text", name: "x", readOnly: false },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isReadOnly).toBe(false);
  });

  it("$data path — isReadOnly true", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: { type: "text", name: "x", readOnly: { $data: "/ro" } },
      values: { ro: true },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isReadOnly).toBe(true);
  });

  it("$context path — isReadOnly true", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: { type: "text", name: "x", readOnly: { $context: "/ro" } },
      contextData: { ro: true },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isReadOnly).toBe(true);
  });

  it("inline fn — isReadOnly from data", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        readOnly: (ctx) => ctx.data.ro === true,
      },
      values: { ro: true },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isReadOnly).toBe(true);
  });

  it("inline fn receives contextData for readOnly", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        readOnly: (ctx) => ctx.context?.["perm"] === "view",
      },
      contextData: { perm: "view" },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isReadOnly).toBe(true);
  });

  it("$fn — isReadOnly true", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: { type: "text", name: "x", readOnly: { $fn: "checkReadOnly" } },
      values: { ro: true },
      registries: {
        fns: { checkReadOnly: ({ data }) => Boolean(data.ro) },
      },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isReadOnly).toBe(true);
  });

  it("$when — isReadOnly from branch", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        readOnly: {
          $when: { $data: "/status", eq: "locked" },
          $then: true,
          $else: false,
        },
      },
      values: { status: "locked" },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isReadOnly).toBe(true);
  });

  it("$and — all true → isReadOnly true", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        readOnly: { $and: [{ $data: "/a" }, { $data: "/b" }] },
      },
      values: { a: true, b: true },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isReadOnly).toBe(true);
  });

  it("$or — any true → isReadOnly true", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        readOnly: { $or: [{ $data: "/a" }, { $data: "/b" }] },
      },
      values: { a: false, b: true },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isReadOnly).toBe(true);
  });
});

describe("Field — required Expr<boolean> variants", () => {
  function readCtx(spy: ReturnType<typeof vi.fn>): FieldContextValue {
    return spy.mock.calls[0]?.[0] as FieldContextValue;
  }

  it("literal true — isRequired true", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: { type: "text", name: "x", required: true },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isRequired).toBe(true);
  });

  it("literal false — isRequired false", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: { type: "text", name: "x", required: false },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isRequired).toBe(false);
  });

  it("$data path — isRequired true", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: { type: "text", name: "x", required: { $data: "/mustFill" } },
      values: { mustFill: true },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isRequired).toBe(true);
  });

  it("$data path with eq — isRequired true when match", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: { type: "text", name: "x", required: { $data: "/tier", eq: "pro" } },
      values: { tier: "pro" },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isRequired).toBe(true);
  });

  it("$data path with eq — isRequired false when no match", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: { type: "text", name: "x", required: { $data: "/tier", eq: "pro" } },
      values: { tier: "free" },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isRequired).toBe(false);
  });

  it("$context path — isRequired true", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: { type: "text", name: "x", required: { $context: "/enforce" } },
      contextData: { enforce: true },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isRequired).toBe(true);
  });

  it("$context path — isRequired false", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: { type: "text", name: "x", required: { $context: "/enforce" } },
      contextData: { enforce: false },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isRequired).toBe(false);
  });

  it("inline fn — isRequired from data", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        required: (ctx) => ctx.data.plan === "enterprise",
      },
      values: { plan: "enterprise" },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isRequired).toBe(true);
  });

  it("inline fn — isRequired false when condition fails", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        required: (ctx) => ctx.data.plan === "enterprise",
      },
      values: { plan: "free" },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isRequired).toBe(false);
  });

  it("inline fn receives contextData for required", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        required: (ctx) => ctx.context?.["strictMode"] === true,
      },
      contextData: { strictMode: true },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isRequired).toBe(true);
  });

  it("$fn — isRequired true", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: { type: "text", name: "x", required: { $fn: "isPremium" } },
      values: { plan: "premium" },
      registries: {
        fns: { isPremium: ({ data }) => data.plan === "premium" },
      },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isRequired).toBe(true);
  });

  it("$fn — isRequired false", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: { type: "text", name: "x", required: { $fn: "isPremium" } },
      values: { plan: "free" },
      registries: {
        fns: { isPremium: ({ data }) => data.plan === "premium" },
      },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isRequired).toBe(false);
  });

  it("$when — isRequired from true branch", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        required: {
          $when: { $data: "/subscribed", eq: true },
          $then: true,
          $else: false,
        },
      },
      values: { subscribed: true },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isRequired).toBe(true);
  });

  it("$when — isRequired from false branch", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        required: {
          $when: { $data: "/subscribed", eq: true },
          $then: true,
          $else: false,
        },
      },
      values: { subscribed: false },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isRequired).toBe(false);
  });

  it("$and — all true → isRequired true", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        required: { $and: [{ $data: "/a" }, { $data: "/b" }] },
      },
      values: { a: true, b: true },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isRequired).toBe(true);
  });

  it("$and — any false → isRequired false", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        required: { $and: [{ $data: "/a" }, { $data: "/b" }] },
      },
      values: { a: true, b: false },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isRequired).toBe(false);
  });

  it("$or — any true → isRequired true", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        required: { $or: [{ $data: "/a" }, { $data: "/b" }] },
      },
      values: { a: false, b: true },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isRequired).toBe(true);
  });

  it("$or — all false → isRequired false", () => {
    const spy = vi.fn();
    renderFieldWithRegistries({
      field: {
        type: "text",
        name: "x",
        required: { $or: [{ $data: "/a" }, { $data: "/b" }] },
      },
      values: { a: false, b: false },
      child: <ContextReader spy={spy} />,
    });
    expect(readCtx(spy).isRequired).toBe(false);
  });
});
