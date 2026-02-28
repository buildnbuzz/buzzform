"use client";

import * as React from "react";
import { useEffect, useMemo, useRef } from "react";
import {
  createSchema,
  useForm,
  type FormAdapter,
  type OutputConfig,
  type PathDelimiter,
} from "@buildnbuzz/buzzform";
import { useBuilderStore } from "../../lib/store";
import { formSettingsProperties } from "../../lib/properties/form";
import { RenderFields } from "@/components/buzzform/fields/render";
import { FieldGroup } from "@/components/ui/field";
import { unflattenFormValues } from "../../lib/properties";

export function GlobalSettingsForm() {
  const outputConfig = useBuilderStore((s) => s.outputConfig);
  const updateFormSettings = useBuilderStore((s) => s.updateFormSettings);

  const schema = useMemo(() => createSchema(formSettingsProperties), []);

  const defaultValues = useMemo(() => {
    return {
      outputConfig: {
        type: outputConfig?.type ?? "default",
        delimiter: outputConfig?.delimiter ?? ".",
      },
    };
  }, [outputConfig]);

  const form = useForm({
    schema,
    defaultValues,
    mode: "onBlur",
    output: undefined,
  });

  const currentValues = form.watch() as Record<string, unknown>;

  // Update store when form changes
  useEffect(() => {
    const nested = unflattenFormValues(currentValues);
    const formOutputConfig = nested.outputConfig as
      | { type: string; delimiter?: string }
      | undefined;

    const storeValue: OutputConfig | undefined =
      formOutputConfig?.type === "path"
        ? {
            type: "path",
            delimiter: (formOutputConfig.delimiter as PathDelimiter) ?? ".",
          }
        : undefined;

    // Compare with current store value
    const currentStoreJson = JSON.stringify(outputConfig);
    const newStoreJson = JSON.stringify(storeValue);

    if (currentStoreJson !== newStoreJson) {
      updateFormSettings({ outputConfig: storeValue });
    }
  }, [currentValues, outputConfig, updateFormSettings]);

  // Sync form when store changes externally (undo/redo)
  const prevOutputConfigRef = useRef(outputConfig);
  useEffect(() => {
    const prevJson = JSON.stringify(prevOutputConfigRef.current);
    const currentJson = JSON.stringify(outputConfig);

    if (prevJson !== currentJson) {
      prevOutputConfigRef.current = outputConfig;

      const nextValues = {
        outputConfig: {
          type: outputConfig?.type ?? "default",
          delimiter: outputConfig?.delimiter ?? ".",
        },
      };

      form.reset(nextValues);
    }
  }, [outputConfig, form]);

  return (
    <div className="px-4 py-2">
      <form onSubmit={(e) => e.preventDefault()}>
        <FieldGroup className="gap-2">
          <RenderFields
            fields={schema.fields}
            form={form as unknown as FormAdapter}
          />
        </FieldGroup>
      </form>
    </div>
  );
}
