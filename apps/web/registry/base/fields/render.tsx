"use client";

import * as React from "react";
import type {
  Field,
  FormAdapter,
  DataField,
  FieldInputProps,
  FieldComponentProps,
  FieldType,
} from "@buildnbuzz/buzzform";
import { generateFieldId, getNestedValue } from "@buildnbuzz/buzzform";

import type { ComponentType } from "react";
import {
  TextField,
  TextFieldSkeleton,
} from "@/components/buzzform/fields/text";

export interface FieldRendererComponentProps {
  field: Field;
  path: string;
  form: FormAdapter;
  autoFocus?: boolean;
  formValues: Record<string, unknown>;
  siblingData: Record<string, unknown>;
}

export interface FieldRegistryEntry {
  kind: "data" | "layout";
  renderer: ComponentType<FieldRendererComponentProps>;
  skeleton?: ComponentType<{ field: Field }>;
}

export type FieldRegistry = Partial<Record<FieldType, FieldRegistryEntry>>;

export function createFieldRegistry(entries: FieldRegistry): FieldRegistry {
  return entries;
}

export function mergeRegistries(...registries: FieldRegistry[]): FieldRegistry {
  return Object.assign({}, ...registries);
}

export const defaultFieldRegistry: FieldRegistry = createFieldRegistry({
  text: {
    kind: "data",
    renderer: TextField as ComponentType<FieldRendererComponentProps>,
    skeleton: TextFieldSkeleton as ComponentType<{ field: Field }>,
  },
  email: {
    kind: "data",
    renderer: TextField as ComponentType<FieldRendererComponentProps>,
    skeleton: TextFieldSkeleton as ComponentType<{ field: Field }>,
  },
});

// Types
export interface FieldRendererProps {
  field: Field;
  path: string;
  form: FormAdapter;
  registry?: FieldRegistry;
  isFirstField?: boolean;
}

export interface RenderFieldsProps {
  fields: readonly Field[];
  form: FormAdapter;
  basePath?: string;
  registry?: FieldRegistry;
}

// Helpers
function isDataField(field: Field): field is DataField {
  return "name" in field && field.name !== undefined;
}

function getSiblingData(
  formValues: Record<string, unknown>,
  path: string
): Record<string, unknown> {
  const pathParts = path.split(".");
  const parentParts = pathParts.slice(0, -1);
  if (parentParts.length === 0) return formValues;
  const parent = getNestedValue(formValues, parentParts.join("."));
  return (parent as Record<string, unknown>) ?? formValues;
}

function getErrorMessage(
  errors: Record<string, string | string[] | undefined>,
  path: string
): string | undefined {
  const error = errors[path];
  if (typeof error === "string") return error;
  if (Array.isArray(error)) return error[0];
  return undefined;
}

// Default skeleton
function DefaultFieldSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

// Custom component renderer (field.component)
function CustomComponentRenderer({
  field,
  path,
  form,
  formValues,
  siblingData,
  autoFocus,
}: {
  field: DataField;
  path: string;
  form: FormAdapter;
  formValues: Record<string, unknown>;
  siblingData: Record<string, unknown>;
  autoFocus?: boolean;
}) {
  const CustomComponent = field.component as React.ComponentType<
    FieldComponentProps<unknown, DataField>
  >;
  const value = getNestedValue(formValues, path);
  const fieldId = field.id ?? generateFieldId(path);

  const isDisabled =
    (typeof field.disabled === "function"
      ? field.disabled(formValues, siblingData)
      : (field.disabled ?? false)) || form.formState.isSubmitting;

  const isReadOnly =
    typeof field.readOnly === "function"
      ? field.readOnly(formValues, siblingData)
      : (field.readOnly ?? false);

  const errorMessage = getErrorMessage(form.formState.errors, path);

  return (
    <CustomComponent
      field={field}
      path={path}
      id={fieldId}
      form={form}
      value={value}
      onChange={(val: unknown) =>
        form.setValue(path, val, { shouldDirty: true })
      }
      onBlur={() => {
        form.onBlur?.(path);
      }}
      disabled={isDisabled}
      readOnly={isReadOnly}
      error={errorMessage}
      autoFocus={autoFocus}
    />
  );
}

// Custom input renderer (field.input)
function CustomInputRenderer({
  field,
  path,
  form,
  formValues,
  siblingData,
  autoFocus,
}: {
  field: DataField;
  path: string;
  form: FormAdapter;
  formValues: Record<string, unknown>;
  siblingData: Record<string, unknown>;
  autoFocus?: boolean;
}) {
  const value = getNestedValue(formValues, path);
  const fieldId = field.id ?? generateFieldId(path);

  const isDisabled =
    typeof field.disabled === "function"
      ? field.disabled(formValues, siblingData)
      : (field.disabled ?? false);

  const isReadOnly =
    typeof field.readOnly === "function"
      ? field.readOnly(formValues, siblingData)
      : (field.readOnly ?? false);

  const errorMessage = getErrorMessage(form.formState.errors, path);

  const inputProps: FieldInputProps = {
    field,
    path,
    id: fieldId,
    name: field.name,
    value,
    onChange: (val: unknown) => form.setValue(path, val, { shouldDirty: true }),
    onBlur: () => {
      form.onBlur?.(path);
    },
    disabled: isDisabled || form.formState.isSubmitting,
    readOnly: isReadOnly,
    error: errorMessage,
    autoFocus,
    validation: {
      isChecking: form.formState.isValidating,
      isValid: !errorMessage,
      message: errorMessage,
    },
  };

  const CustomInput = field.input;
  const inputElement =
    typeof CustomInput === "function" && !React.isValidElement(CustomInput)
      ? (CustomInput as (props: FieldInputProps) => React.ReactNode)(inputProps)
      : React.createElement(
          CustomInput as React.ComponentType<FieldInputProps>,
          inputProps
        );

  const label = field.label !== false ? field.label || field.name : null;

  return (
    <div
      className={field.style?.className}
      style={field.style?.width ? { width: field.style.width } : undefined}
    >
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium mb-1.5">
          {label}
          {field.required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}

      <div
        ref={(el) => {
          if (autoFocus && el) {
            const focusable = el.querySelector<HTMLElement>(
              'input, textarea, select, button, [tabindex]:not([tabindex="-1"])'
            );
            focusable?.focus();
          }
        }}
      >
        {inputElement}
      </div>

      {field.description && (
        <p className="text-sm text-muted-foreground mt-1.5">
          {field.description}
        </p>
      )}

      {errorMessage && (
        <p className="text-sm text-destructive mt-1.5" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

// FieldRenderer
export function FieldRenderer({
  field,
  path,
  form,
  registry = defaultFieldRegistry,
  isFirstField = false,
}: FieldRendererProps) {
  const formValues = form.getValues();
  const siblingData = getSiblingData(formValues, path);

  const isHidden = React.useMemo(() => {
    if (!isDataField(field)) return false;
    if (typeof field.hidden === "function")
      return field.hidden(formValues, siblingData);
    return field.hidden ?? false;
  }, [field, formValues, siblingData]);

  const isConditionMet = React.useMemo(() => {
    if (!isDataField(field)) return true;
    if (field.condition) {
      return field.condition(formValues, siblingData, {
        operation: "update",
        path: path.split("."),
      });
    }
    return true;
  }, [field, formValues, siblingData, path]);

  const shouldAutoFocus = React.useMemo(() => {
    if (!isDataField(field)) return false;
    const isDisabled =
      typeof field.disabled === "function"
        ? field.disabled(formValues, siblingData)
        : (field.disabled ?? false);

    const isReadOnly =
      typeof field.readOnly === "function"
        ? field.readOnly(formValues, siblingData)
        : (field.readOnly ?? false);

    return (
      isFirstField && form.settings?.autoFocus && !isDisabled && !isReadOnly
    );
  }, [field, form, formValues, siblingData, isFirstField]);

  if (isHidden || !isConditionMet) return null;

  const registryEntry = registry[field.type];

  if (form.formState.isLoading) {
    if (registryEntry?.skeleton) {
      const Skeleton = registryEntry.skeleton;
      return <Skeleton field={field} />;
    }
    return <DefaultFieldSkeleton />;
  }

  if (isDataField(field) && field.component) {
    return (
      <CustomComponentRenderer
        field={field}
        path={path}
        form={form}
        formValues={formValues}
        siblingData={siblingData}
        autoFocus={shouldAutoFocus}
      />
    );
  }

  if (isDataField(field) && field.input) {
    return (
      <CustomInputRenderer
        field={field}
        path={path}
        form={form}
        formValues={formValues}
        siblingData={siblingData}
        autoFocus={shouldAutoFocus}
      />
    );
  }

  if (!registryEntry) {
    return (
      <div className="rounded border border-destructive bg-destructive/10 p-2 text-xs text-destructive">
        Unsupported field type: <code className="font-mono">{field.type}</code>
      </div>
    );
  }

  const Renderer = registryEntry.renderer;
  return (
    <Renderer
      field={field}
      path={path}
      form={form}
      autoFocus={shouldAutoFocus}
      formValues={formValues}
      siblingData={siblingData}
    />
  );
}

// RenderFields
export function RenderFields({
  fields,
  form,
  basePath = "",
  registry,
}: RenderFieldsProps) {
  const firstFieldName = React.useMemo(() => {
    for (const field of fields) {
      if ("name" in field && field.name) return field.name;
    }
    return null;
  }, [fields]);

  return (
    <>
      {fields.map((field, index) => {
        const hasName = "name" in field && field.name;
        const fieldPath = hasName
          ? basePath
            ? `${basePath}.${field.name}`
            : field.name
          : basePath;

        const key = hasName ? field.name : `${field.type}-${index}`;
        const isFirstField = !!(hasName && field.name === firstFieldName);

        return (
          <FieldRenderer
            key={key}
            field={field}
            path={fieldPath}
            form={form}
            registry={registry}
            isFirstField={isFirstField}
          />
        );
      })}
    </>
  );
}

export default FieldRenderer;
