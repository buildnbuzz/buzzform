"use client";

import type { ArrayField as ArrayFieldDef } from "@buildnbuzz/form-core";
import { useDataField, RenderFields } from "@buildnbuzz/form-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export function ArrayField() {
  const {
    fieldApi,
    field,
    form,
    isDisabled,
    isRequired,
    label,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
  } = useDataField<ArrayFieldDef>();

  const items = Array.isArray(fieldApi.state.value) ? fieldApi.state.value : [];

  return (
    <FieldGroup data-field={fieldApi.name}>
      <Field data-invalid={isInvalid} data-disabled={isDisabled}>
        <FieldSet disabled={isDisabled} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {label && (
                <FieldLegend>
                  {label}
                  {isRequired ? (
                    <span className="text-destructive ml-1">*</span>
                  ) : null}
                </FieldLegend>
              )}
              {description && !isInvalid && (
                <FieldDescription id={descriptionId}>
                  {description}
                </FieldDescription>
              )}
              {isInvalid && <FieldError id={errorId} errors={errors} />}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fieldApi.pushValue(undefined)}
              disabled={isDisabled}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((_, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 border p-4 rounded-lg relative group bg-muted/30"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Item #{index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => fieldApi.removeValue(index)}
                    disabled={isDisabled}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>

                <div className="grid gap-4">
                  <RenderFields
                    fields={field.fields}
                    form={form}
                    basePath={`${fieldApi.name}.${index}`}
                  />
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/20">
                <p className="text-sm text-muted-foreground">No items added yet.</p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => fieldApi.pushValue(undefined)}
                  disabled={isDisabled}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first item
                </Button>
              </div>
            )}
          </div>
        </FieldSet>
      </Field>
    </FieldGroup>
  );
}
