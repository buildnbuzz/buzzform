"use client";

import * as React from "react";
import { createContext, useContext } from "react";
import { createSchema, type Field } from "@buildnbuzz/buzzform";
import { Form, useFormContext } from "@/registry/base/form";
import { useBuilderStore } from "../lib/store";
import { nodesToFields } from "../lib/schema-builder";
import { extractDefaults } from "../lib/properties";
import { syncRuntimeForm, computeSchemaSignature } from "../lib/core/sync";

export type BuilderMode = "edit" | "preview";

interface BuilderContextValue {
  mode: BuilderMode;
  fields: readonly Field[];
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function useBuilderContext() {
  const ctx = useContext(BuilderContext);
  if (!ctx) {
    throw new Error(
      "useBuilderContext must be used within <BuilderFormProvider>",
    );
  }
  return ctx;
}

export function useBuilderFormContext() {
  const builderCtx = useBuilderContext();
  const formCtx = useFormContext();
  return { ...builderCtx, ...formCtx };
}

export { useFormContext } from "@/registry/base/form";

interface BuilderFormProviderProps {
  children: React.ReactNode;
  mode?: BuilderMode;
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
}

export function BuilderFormProvider({
  children,
  mode = "edit",
  onSubmit,
}: BuilderFormProviderProps) {
  const nodes = useBuilderStore((s) => s.nodes);
  const rootIds = useBuilderStore((s) => s.rootIds);

  // Memoize derivation pipeline to prevent recomputation on unrelated store updates
  const fields = React.useMemo(
    () => nodesToFields(nodes, rootIds),
    [nodes, rootIds],
  );
  const schema = React.useMemo(() => createSchema(fields), [fields]);
  const defaultValues = React.useMemo(() => extractDefaults(fields), [fields]);

  // Deterministic signature triggers sync only on structural changes
  const schemaSignature = React.useMemo(
    () => computeSchemaSignature(fields, defaultValues),
    [fields, defaultValues],
  );

  const builderValue = React.useMemo<BuilderContextValue>(
    () => ({ mode, fields }),
    [mode, fields],
  );

  return (
    <BuilderContext.Provider value={builderValue}>
      <Form
        schema={schema}
        fields={fields}
        defaultValues={defaultValues}
        onSubmit={onSubmit ?? (() => {})}
        mode="onBlur"
        showSubmit={false}
      >
        <BuilderFormStateSync
          fields={fields}
          defaultValues={defaultValues}
          schemaSignature={schemaSignature}
        />
        {children}
      </Form>
    </BuilderContext.Provider>
  );
}

/**
 * Syncs RHF form state with document changes without remounting.
 * Preserves scroll position and internal state.
 */
function BuilderFormStateSync({
  fields,
  defaultValues,
  schemaSignature,
}: {
  fields: readonly Field[];
  defaultValues: Record<string, unknown>;
  schemaSignature: string;
}) {
  const { form } = useFormContext();
  const previousSignatureRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    // First mount: record signature, don't reset
    if (previousSignatureRef.current === null) {
      previousSignatureRef.current = schemaSignature;
      return;
    }

    // Skip sync if signature matches (cosmetic changes)
    if (previousSignatureRef.current === schemaSignature) {
      return;
    }

    previousSignatureRef.current = schemaSignature;

    // Deterministic sync: preserve values, apply defaults, prune helpers
    const currentValues = form.getValues() as Record<string, unknown>;
    const nextValues = syncRuntimeForm(currentValues, fields, defaultValues);

    form.reset(nextValues);
  }, [defaultValues, fields, form, schemaSignature]);

  return null;
}
