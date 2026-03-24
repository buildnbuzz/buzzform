"use client";

import type { ReactNode } from "react";
import type { GroupField as GroupFieldDef } from "@buildnbuzz/form-core";
import { useDataField } from "@buildnbuzz/form-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";

export function GroupField({ children }: { children?: ReactNode }) {
  const {
    fieldApi,
    isDisabled,
    isRequired,
    label,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
  } = useDataField<GroupFieldDef>();

  return (
    <FieldGroup data-field={fieldApi.name}>
      <Field data-invalid={isInvalid} data-disabled={isDisabled}>
        <FieldSet disabled={isDisabled} className="space-y-4">
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

          <div className="pl-4 border-l-2 border-border/50 flex flex-col gap-4">
            {children}
          </div>
        </FieldSet>
      </Field>
    </FieldGroup>
  );
}
