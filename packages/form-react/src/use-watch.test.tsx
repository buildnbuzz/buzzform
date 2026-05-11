/**
 * @vitest-environment jsdom
 */
import React, { type PropsWithChildren } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWatch } from "./use-watch";
import { useForm } from "./use-form";
import type { AnyReactFormExtendedApi } from "./types";
import type { FormSchema } from "@buildnbuzz/form-core";

type TestData = { name: string; age?: number };

function createFormWrapper() {
  let formRef: AnyReactFormExtendedApi<TestData> | null = null;

  const Wrapper = ({ children }: PropsWithChildren) => {
    const form = useForm<TestData>({
      schema: { fields: [] } as unknown as FormSchema,
      defaultValues: { name: "initial", age: 0 },
    });
    formRef = form;
    return <>{children}</>;
  };

  return {
    Wrapper,
    getForm: () => formRef!,
  };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("useWatch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should not fire onChange on initial render", () => {
    const onChange = vi.fn();
    const { Wrapper, getForm } = createFormWrapper();

    renderHook(
      () =>
        useWatch({
          form: getForm(),
          onChange,
        }),
      { wrapper: Wrapper },
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it("should fire onChange immediately when debounceMs is 0", () => {
    const onChange = vi.fn();
    const { Wrapper, getForm } = createFormWrapper();

    renderHook(
      () =>
        useWatch({
          form: getForm(),
          onChange,
          debounceMs: 0,
        }),
      { wrapper: Wrapper },
    );

    act(() => {
      getForm().setFieldValue("name", "changed");
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ name: "changed" }),
    );
  });

  it("should debounce onChange when debounceMs > 0", async () => {
    const onChange = vi.fn();
    const { Wrapper, getForm } = createFormWrapper();

    renderHook(
      () =>
        useWatch({
          form: getForm(),
          onChange,
          debounceMs: 50,
        }),
      { wrapper: Wrapper },
    );

    act(() => {
      getForm().setFieldValue("name", "debounced");
    });

    // Not fired yet — still within debounce window
    expect(onChange).not.toHaveBeenCalled();

    await act(async () => {
      await wait(80);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ name: "debounced" }),
    );
  });

  it("should coalesce rapid changes during debounce window", async () => {
    const onChange = vi.fn();
    const { Wrapper, getForm } = createFormWrapper();

    renderHook(
      () =>
        useWatch({
          form: getForm(),
          onChange,
          debounceMs: 50,
        }),
      { wrapper: Wrapper },
    );

    act(() => {
      getForm().setFieldValue("name", "a");
    });
    act(() => {
      getForm().setFieldValue("name", "ab");
    });
    act(() => {
      getForm().setFieldValue("name", "abc");
    });

    await act(async () => {
      await wait(80);
    });

    // Only last value fires
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ name: "abc" }),
    );
  });

  it("should cleanup pending timeout on unmount", async () => {
    const onChange = vi.fn();
    const { Wrapper, getForm } = createFormWrapper();

    const { unmount } = renderHook(
      () =>
        useWatch({
          form: getForm(),
          onChange,
          debounceMs: 100,
        }),
      { wrapper: Wrapper },
    );

    act(() => {
      getForm().setFieldValue("name", "pending");
    });

    unmount();

    await act(async () => {
      await wait(150);
    });

    // Should NOT fire after unmount
    expect(onChange).not.toHaveBeenCalled();
  });
});
