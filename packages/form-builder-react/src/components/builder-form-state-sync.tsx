"use client";

import * as React from "react";
import type { AnyReactFormExtendedApi } from "@buildnbuzz/form-react";
import {
  syncRuntimeForm,
  type nodesToFields,
} from "@buildnbuzz/form-builder-core";

type TanstackFormApi = AnyReactFormExtendedApi<Record<string, unknown>>;

export interface BuilderFormStateSyncProps {
  form: TanstackFormApi;
  fields: ReturnType<typeof nodesToFields>;
  defaultValues: Record<string, unknown>;
  schemaSignature: string;
}

/**
 * Syncs TanStack form state with document changes without remounting.
 *
 * - First mount: records the signature without resetting.
 * - Subsequent changes: deterministically merges current values with the new schema.
 *
 * @internal
 */
export function BuilderFormStateSync({
  form,
  fields,
  defaultValues,
  schemaSignature,
}: BuilderFormStateSyncProps) {
  const previousSignatureRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    // First mount: record signature without resetting
    if (previousSignatureRef.current === null) {
      previousSignatureRef.current = schemaSignature;
      return;
    }

    // No structural change — skip
    if (previousSignatureRef.current === schemaSignature) {
      return;
    }

    previousSignatureRef.current = schemaSignature;

    // Deterministic merge: preserve current values, apply new defaults, prune removed fields
    const currentValues = form.store.state.values;
    const nextValues = syncRuntimeForm(currentValues, fields, defaultValues);
    form.reset(nextValues);
  }, [defaultValues, fields, form, schemaSignature]);

  return null;
}
