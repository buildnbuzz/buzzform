"use client";

import type {
  Field,
  FieldComponentProps,
  SelectField as SelectFieldType,
} from "@buildnbuzz/buzzform";
import { getNestedValue } from "@buildnbuzz/buzzform";
import { SelectField } from "@/components/buzzform/fields/select";

function getSiblingData(
  formValues: Record<string, unknown>,
  path: string,
): Record<string, unknown> {
  const pathParts = path.split(".");
  const parentParts = pathParts.slice(0, -1);
  if (parentParts.length === 0) return formValues;
  const parent = getNestedValue(formValues, parentParts.join("."));
  return (parent as Record<string, unknown>) ?? formValues;
}

export function DefaultValueSelect(
  props: FieldComponentProps<
    NonNullable<SelectFieldType["defaultValue"]>,
    Field
  >,
) {
  const { field, path, form, autoFocus, id, disabled, readOnly, error } = props;

  if (field.type !== "select") {
    return null;
  }

  const hasMany = !!form.watch("hasMany");
  const options = form.watch("options");

  const selectField: SelectFieldType = {
    ...(field as SelectFieldType),
    options: Array.isArray(options) ? options : [],
    hasMany,
  };

  const formValues = form.getValues() as Record<string, unknown>;
  const siblingData = getSiblingData(formValues, path);

  const label =
    field.label === false ? null : (field.label ?? field.name ?? null);

  return (
    <SelectField
      field={selectField}
      path={path}
      form={form}
      autoFocus={autoFocus}
      formValues={formValues}
      siblingData={siblingData}
      fieldId={id}
      label={label}
      isDisabled={disabled}
      isReadOnly={readOnly}
      error={error}
    />
  );
}
