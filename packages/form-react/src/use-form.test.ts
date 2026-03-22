import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { useForm as tanstackUseForm } from "@tanstack/react-form";
import type { FormSchema } from "@buildnbuzz/form-core";
import { useForm } from "./use-form";
import type { AnyReactFormExtendedApi, AnyTanstackFormOptions } from "./types";
import { buildStandardSchemaValidator } from "./validator";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useMemo: <T>(factory: () => T): T => factory(),
  };
});

vi.mock("@tanstack/react-form", () => ({
  useForm: vi.fn(() => ({ mocked: true })),
}));

vi.mock("./validator", () => ({
  buildStandardSchemaValidator: vi.fn(),
}));

const mockValidator = {
  "~standard": {
    version: 1 as const,
    vendor: "test",
    validate: async () => ({ value: {} }),
  },
};

describe("useForm", () => {
  beforeEach(() => {
    vi.mocked(tanstackUseForm).mockClear();
    vi.mocked(buildStandardSchemaValidator).mockClear();
  });

  it("merges schema defaults with caller overrides", () => {
    const schema: FormSchema = {
      fields: [
        { type: "text", name: "name", defaultValue: "Ada" },
        { type: "number", name: "age", defaultValue: 20 },
      ],
    };

    useForm({
      schema,
      defaultValues: { age: 30 },
    });

    const call = vi.mocked(tanstackUseForm).mock
      .calls[0]?.[0] as AnyTanstackFormOptions<Record<string, unknown>>;
    expect(call.defaultValues).toEqual({ name: "Ada", age: 30 });
  });

  it("injects schema submit validator when user does not provide one", () => {
    const schema: FormSchema = {
      fields: [{ type: "text", name: "email" }],
    };

    vi.mocked(buildStandardSchemaValidator).mockReturnValue(mockValidator);
    useForm({ schema });

    const call = vi.mocked(tanstackUseForm).mock
      .calls[0]?.[0] as AnyTanstackFormOptions<Record<string, unknown>>;
    expect(call.validators?.onSubmitAsync).toBe(mockValidator);
  });

  it("keeps user-provided onSubmitAsync validator", () => {
    const schema: FormSchema = {
      fields: [{ type: "text", name: "email" }],
    };
    const userValidator = { onSubmitAsync: vi.fn() };

    useForm({ schema, validators: userValidator });

    const call = vi.mocked(tanstackUseForm).mock
      .calls[0]?.[0] as AnyTanstackFormOptions<Record<string, unknown>>;
    expect(call.validators).toBe(userValidator);
  });

  it("transforms onSubmit value when output config is provided", () => {
    const schema: FormSchema = {
      fields: [{ type: "text", name: "name" }],
    };
    const onSubmit = vi.fn();

    useForm({
      schema,
      output: { type: "path" },
      onSubmit,
    });

    const call = vi.mocked(tanstackUseForm).mock
      .calls[0]?.[0] as AnyTanstackFormOptions<Record<string, unknown>>;
    call.onSubmit?.({
      value: { user: { name: "Ada" } },
      formApi: {} as AnyReactFormExtendedApi<Record<string, unknown>>,
      meta: undefined as unknown,
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        value: { "user.name": "Ada" },
      }),
    );
  });

  it("passes through onSubmit when output config is not provided", () => {
    const schema: FormSchema = {
      fields: [{ type: "text", name: "name" }],
    };
    const onSubmit = vi.fn();

    useForm({
      schema,
      onSubmit,
    });

    const call = vi.mocked(tanstackUseForm).mock
      .calls[0]?.[0] as AnyTanstackFormOptions<Record<string, unknown>>;
    expect(call.onSubmit).toBe(onSubmit);
  });

  it("supports explicit form data type", () => {
    const schema: FormSchema = {
      fields: [{ type: "text", name: "name" }],
    };

    type FormData = { name: string; extra?: number };
    const result = useForm<FormData>({ schema });
    expectTypeOf(result).toEqualTypeOf<AnyReactFormExtendedApi<FormData>>();
  });
});
