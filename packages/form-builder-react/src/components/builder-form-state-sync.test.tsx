import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BuilderFormStateSync } from "./builder-form-state-sync";
import { syncRuntimeForm } from "@buildnbuzz/form-builder-core";

import type { AnyReactFormExtendedApi } from "@buildnbuzz/form-react";

vi.mock("@buildnbuzz/form-builder-core", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@buildnbuzz/form-builder-core")>();
  return {
    ...actual,
    syncRuntimeForm: vi.fn((currentValues, fields, defaultValues) => ({
      ...currentValues,
      ...defaultValues,
      mockedSyncValue: true,
    })),
  };
});

describe("BuilderFormStateSync", () => {
  it("syncs form deterministically on signature updates", () => {
    const mockReset = vi.fn();
    const mockForm = {
      store: { state: { values: { existingKey: "oldValue" } } },
      reset: mockReset,
    } as unknown as AnyReactFormExtendedApi<Record<string, unknown>>;

    const props = {
      form: mockForm,
      fields: [],
      defaultValues: { newKey: "newValue" },
      schemaSignature: "sig1",
    };

    const { rerender } = render(<BuilderFormStateSync {...props} />);

    // Initial mount doesn't reset
    expect(mockReset).not.toHaveBeenCalled();

    // Rerender with SAME signature -> doesn't reset
    rerender(<BuilderFormStateSync {...props} />);
    expect(mockReset).not.toHaveBeenCalled();

    // Rerender with NEW signature -> sync logic kicks in
    rerender(<BuilderFormStateSync {...props} schemaSignature="sig2" />);

    expect(syncRuntimeForm).toHaveBeenCalledWith(
      { existingKey: "oldValue" },
      [],
      { newKey: "newValue" },
    );
    expect(mockReset).toHaveBeenCalledWith({
      existingKey: "oldValue",
      newKey: "newValue",
      mockedSyncValue: true,
    });
  });
});
