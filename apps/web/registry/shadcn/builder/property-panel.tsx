"use client";

import {
  useBuilderContext,
  BuilderProperties,
  useSyncProperty,
} from "@buildnbuzz/form-builder-react";
import { Form, FormContent, useFormContext } from "@/registry/shadcn/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconPlaceholder } from "@/components/icon-placeholder";
import { getRegistryEntry } from "@buildnbuzz/form-builder-react";
import { flattenFieldToFormValues } from "@buildnbuzz/form-builder-core";
import type { Field, FormSchema } from "@buildnbuzz/form-core";

/** Renders nothing — syncs form state ↔ builder store bidirectionally. */
function SyncPropertyState({
  update,
  data,
  schema,
}: {
  update: (data: Record<string, unknown>) => void;
  data: Record<string, unknown>;
  schema: Field[];
}) {
  const { form } = useFormContext();
  useSyncProperty({ form, data, schema, update });
  return null;
}

/**
 * Side panel for editing node or global form properties.
 */
export const PropertyPanel = () => {
  const { registry } = useBuilderContext();

  return (
    <div className="flex h-full flex-col bg-background border-l overflow-hidden">
      <BuilderProperties
        render={({ node, id, schema, data, update }) => {
          const entry = node
            ? getRegistryEntry(registry, node.field.type)
            : null;
          const label =
            entry?.sidebar.label ??
            (id === "form" ? "Form Settings" : "Properties");
          const icon = entry?.sidebar.icon;

          const defaultValues = flattenFieldToFormValues(
            data as unknown as Field,
            schema,
          );

          return (
            <>
              <div className="p-4 border-b h-header flex items-center">
                {node && entry ? (
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-secondary/30 shadow-sm">
                      {icon && (
                        <IconPlaceholder
                          {...icon}
                          size={20}
                          className="text-foreground"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="font-semibold text-sm truncate">
                        {label}
                      </span>
                      <span className="text-[11px] text-muted-foreground/80 truncate">
                        Properties
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-secondary/30 shadow-sm">
                      <IconPlaceholder
                        lucide="Settings"
                        hugeicons="Settings01Icon"
                        size={20}
                        className="text-muted-foreground"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="font-semibold text-sm">
                        Form Settings
                      </span>
                      <span className="text-[11px] text-muted-foreground/80 truncate">
                        Configuration
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <div className="flex flex-col gap-6 p-4">
                    {schema.length > 0 ? (
                      <Form
                        key={id}
                        schema={{ fields: schema } as unknown as FormSchema}
                        defaultValues={defaultValues}
                      >
                        <FormContent autoRender as="div" className="gap-6">
                          <SyncPropertyState
                            update={update}
                            data={data}
                            schema={schema}
                          />
                        </FormContent>
                      </Form>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center opacity-30">
                        <span className="text-[11px]">
                          No properties available
                        </span>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </>
          );
        }}
      />
    </div>
  );
};
