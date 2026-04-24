"use client";

import { useEffect } from "react";
import { useWatch } from "@buildnbuzz/form-react";
import type { AnyReactFormExtendedApi } from "@buildnbuzz/form-react";
import type { Field } from "@buildnbuzz/form-core";
import {
  flattenFieldToFormValues,
  unflattenFormValues,
} from "@buildnbuzz/form-builder-core";

/** Options for the `useSyncProperty` hook. */
export interface UseSyncPropertyOptions {
  /** The form instance to synchronize. */
  form: AnyReactFormExtendedApi<Record<string, unknown>>;
  /** Current node/form data from the builder store (unflattened). */
  data: Record<string, unknown>;
  /** Property schema fields used for flattening. */
  schema: Field[];
  /** Callback to push updated values back to the builder store. */
  update: (data: Record<string, unknown>) => void;
  /** Debounce interval (ms) for outbound form → store sync. @default 100 */
  debounceMs?: number;
}

/**
 * Bidirectional sync between a property editor form and the builder store.
 *
 * - **Outbound** (form → store): Watches form value changes via `useWatch`
 *   and pushes unflattened values to the store through `update`.
 * - **Inbound** (store → form): Detects external data changes (e.g. undo/redo)
 *   by comparing the form's current values against the expected flattened data.
 *   Resets the form only when they diverge.
 */
export function useSyncProperty({
  form,
  data,
  schema,
  update,
  debounceMs = 100,
}: UseSyncPropertyOptions): void {
  // Outbound: form → store
  useWatch({
    form,
    debounceMs,
    onChange: (values: Record<string, unknown>) => {
      update(unflattenFormValues(values));
    },
  });

  // Inbound: store → form (undo/redo or external mutation)
  useEffect(() => {
    const expected = flattenFieldToFormValues(
      data as unknown as Field,
      schema,
    );
    if (JSON.stringify(form.state.values) !== JSON.stringify(expected)) {
      form.reset(expected);
    }
  }, [data, form, schema]);
}
