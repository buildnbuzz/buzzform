"use client";

import { BuilderProperties, useSyncProperty } from "@buildnbuzz/form-builder-react";
import { Form, FormContent, useFormContext } from "@/registry/shadcn/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  return (
    <div className="flex h-full flex-col bg-background border-l">
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
          Properties
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <BuilderProperties
          render={({ id, schema, data, update }) => {
            const defaultValues = flattenFieldToFormValues(
              data as unknown as Field,
              schema,
            );
            return (
              <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase opacity-50">
                    Target: {id === "form" ? "Settings" : `Node: ${id}`}
                  </span>
                  <Separator />
                </div>

                {schema.length > 0 ? (
                  <Form
                    key={id}
                    schema={{ fields: schema } as unknown as FormSchema}
                    defaultValues={defaultValues}
                  >
                    <FormContent autoRender as="div">
                      <SyncPropertyState
                        update={update}
                        data={data}
                        schema={schema}
                      />
                    </FormContent>
                  </Form>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center opacity-30">
                    <span className="text-[11px]">No properties available</span>
                  </div>
                )}
              </div>
            );
          }}
        />
      </ScrollArea>
    </div>
  );
};
