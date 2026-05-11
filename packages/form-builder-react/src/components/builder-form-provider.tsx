"use client";

import * as React from "react";
import { useMemo } from "react";
import {
  Form,
  useForm,
  extractDefaults,
  type FieldFormApi,
} from "@buildnbuzz/form-react";
import type { FormSchema } from "@buildnbuzz/form-react";
import {
  nodesToFields,
  computeSchemaSignature,
} from "@buildnbuzz/form-builder-core";
import { useBuilderStore } from "../context/builder-context";
import { BuilderFormStateSync } from "./builder-form-state-sync";

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
  /** The active form instance. */
  form: FieldFormApi;
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

  // Reset form state when switching back to edit mode to ensure fresh preview data
  React.useEffect(() => {
    if (mode === "edit") {
      form.reset();
    }
  }, [mode, form]);

  const builderFormValue = useMemo<BuilderFormContextValue>(
    () => ({ mode, fields, form }),
    [mode, fields, form],
  );

  return (
    <BuilderFormContext.Provider value={builderFormValue}>
      <Form form={form} fields={fields} as="div">
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
