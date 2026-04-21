"use client";

import * as React from "react";
import { useMemo } from "react";
import { Form, useForm, extractDefaults } from "@buildnbuzz/form-react";
import type {
  AnyReactFormExtendedApi,
  FormSchema,
} from "@buildnbuzz/form-react";
import {
  nodesToFields,
  computeSchemaSignature,
  syncRuntimeForm,
} from "@buildnbuzz/form-builder-core";
import { useBuilderStore } from "../context/BuilderContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Controls whether the embedded form is editable or rendered for preview. */
export type FormBuilderMode = "edit" | "preview";

export interface BuilderFormProviderProps {
  /** Edit or preview mode. Defaults to "edit". */
  mode?: FormBuilderMode;
  /** Called when the preview form is submitted. */
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface BuilderFormContextValue {
  /** Current mode of the embedded form. */
  mode: FormBuilderMode;
  /** Derived field schema from the current builder node tree. */
  fields: ReturnType<typeof nodesToFields>;
}

const BuilderFormContext = React.createContext<BuilderFormContextValue | null>(
  null,
);

/** Access the builder form context (mode + derived fields). */
export function useBuilderFormContext(): BuilderFormContextValue {
  const ctx = React.useContext(BuilderFormContext);
  if (!ctx) {
    throw new Error(
      "useBuilderFormContext must be used within <BuilderFormProvider>",
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Inner component (owns the TanStack form instance)
// ---------------------------------------------------------------------------

interface BuilderFormInnerProps extends BuilderFormProviderProps {
  fields: ReturnType<typeof nodesToFields>;
  defaultValues: Record<string, unknown>;
  schemaSignature: string;
}

function BuilderFormInner({
  mode = "edit",
  onSubmit,
  children,
  fields,
  defaultValues,
  schemaSignature,
}: BuilderFormInnerProps) {
  // Wrap fields into a schema object required by form-react useForm
  const schema = useMemo<FormSchema>(() => ({ fields }), [fields]);

  // Create form once using form-react useForm.
  // We pass the live schema so validation/defaults reflect changes,
  // but we rely on BuilderFormStateSync for value preservation during structural updates.
  const form = useForm<FormSchema, Record<string, unknown>>({
    schema,
    defaultValues,
    onSubmit: async ({ value }) => {
      await onSubmit?.(value);
    },
  });

  const builderFormValue = useMemo<BuilderFormContextValue>(
    () => ({ mode, fields }),
    [mode, fields],
  );

  return (
    <BuilderFormContext.Provider value={builderFormValue}>
      <Form form={form} fields={fields}>
        <BuilderFormStateSync
          form={form}
          fields={fields}
          defaultValues={defaultValues}
          schemaSignature={schemaSignature}
        />
        {children}
      </Form>
    </BuilderFormContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Public provider
// ---------------------------------------------------------------------------

/**
 * Wraps the builder canvas with a live `@buildnbuzz/form-react` form instance.
 *
 * Derives the field schema from the builder node tree and keeps it in sync
 * as the user edits the canvas without requiring a full remount.
 * Supports "edit" and "preview" modes.
 */
export function BuilderFormProvider({
  mode = "edit",
  onSubmit,
  children,
}: BuilderFormProviderProps) {
  const nodes = useBuilderStore((s) => s.nodes);
  const rootIds = useBuilderStore((s) => s.rootIds);

  // Derive field schema + defaults from the live node tree
  const fields = useMemo(() => nodesToFields(nodes, rootIds), [nodes, rootIds]);
  const defaultValues = useMemo(() => extractDefaults(fields), [fields]);

  // Stable signature to drive sync without full form remounts
  const schemaSignature = useMemo(
    () => computeSchemaSignature(fields, defaultValues),
    [fields, defaultValues],
  );

  return (
    <BuilderFormInner
      mode={mode}
      onSubmit={onSubmit}
      fields={fields}
      defaultValues={defaultValues}
      schemaSignature={schemaSignature}
    >
      {children}
    </BuilderFormInner>
  );
}

// ---------------------------------------------------------------------------
// Internal state sync
// ---------------------------------------------------------------------------

type TanstackFormApi = AnyReactFormExtendedApi<Record<string, unknown>>;

interface BuilderFormStateSyncProps {
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
function BuilderFormStateSync({
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
