"use client";

import * as React from "react";
import { useRef, useCallback, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  createSchema,
  type Field,
  useForm,
  type FormAdapter,
} from "@buildnbuzz/buzzform";
import type { Node } from "../../lib/types";
import { useBuilderStore } from "../../lib/store";
import {
  unflattenFormValues,
  flattenFieldToFormValues,
  ensureMutableParents,
} from "../../lib/properties";
import { RenderFields } from "@/components/buzzform/fields/render";
import { FieldGroup } from "@/components/ui/field";

interface PropertiesFormProps {
  config: Field[];
  node: Node;
}

// Context
interface PropertiesFormContextValue {
  form: FormAdapter;
  fields: readonly Field[];
  debouncedUpdate: (updates: Record<string, unknown>) => void;
}

const PropertiesFormContext =
  React.createContext<PropertiesFormContextValue | null>(null);

function usePropertiesFormContext() {
  const ctx = React.useContext(PropertiesFormContext);
  if (!ctx)
    throw new Error(
      "usePropertiesFormContext must be used within PropertiesFormProvider",
    );
  return ctx;
}

function PropertiesFormInner({
  config,
  node,
}: {
  config: Field[];
  node: Node;
}) {
  const updateNode = useBuilderStore((state) => state.updateNode);
  const schema = useMemo(() => createSchema(config), [config]);
  const defaultValues = useMemo(
    () => flattenFieldToFormValues(node.field, config),
    [node.field, config],
  );

  const form = useForm({
    schema,
    defaultValues,
    mode: "onChange",
  });

  // Wrap form to intercept setValue for nested paths
  const wrappedForm = useMemo<FormAdapter>(
    () => ({
      ...form,
      setValue: (
        name: string,
        value: unknown,
        opts?: {
          shouldValidate?: boolean;
          shouldDirty?: boolean;
          shouldTouch?: boolean;
        },
      ) => {
        if (name.includes(".")) {
          ensureMutableParents(form, name);
        }
        form.setValue(name, value, opts);
      },
    }),
    [form],
  );

  // Debounced update
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedUpdate = useCallback(
    (updates: Record<string, unknown>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        updateNode(node.id, updates);
      }, 100);
    },
    [node.id, updateNode],
  );

  const contextValue = useMemo<PropertiesFormContextValue>(
    () => ({
      form: wrappedForm,
      fields: schema.fields,
      debouncedUpdate,
    }),
    [wrappedForm, schema.fields, debouncedUpdate],
  );

  return (
    <PropertiesFormContext.Provider value={contextValue}>
      <PropertiesFormWatcher />
      <PropertiesFormFields />
    </PropertiesFormContext.Provider>
  );
}

function PropertiesFormWatcher() {
  const { form, debouncedUpdate } = usePropertiesFormContext();
  const lastValuesRef = useRef<string>("");

  const currentValues = form.watch() as Record<string, unknown>;
  const currentValuesJson = JSON.stringify(currentValues);

  React.useEffect(() => {
    if (currentValuesJson !== lastValuesRef.current) {
      const isFirstRun = lastValuesRef.current === "";
      lastValuesRef.current = currentValuesJson;

      if (!isFirstRun) {
        const updates = unflattenFormValues(currentValues);
        debouncedUpdate(updates);
      }
    }
  }, [currentValuesJson, currentValues, debouncedUpdate]);

  return null;
}

function PropertiesFormFields() {
  const { form, fields } = usePropertiesFormContext();
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <FieldGroup className="gap-2">
        <RenderFields fields={fields} form={form} />
      </FieldGroup>
    </form>
  );
}

export function PropertiesForm({ config, node }: PropertiesFormProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea className="flex-1 h-full">
        <div className="px-4 py-2">
          {/* Key on node.id forces complete remount when selection changes */}
          <PropertiesFormInner key={node.id} config={config} node={node} />
        </div>
      </ScrollArea>
    </div>
  );
}
