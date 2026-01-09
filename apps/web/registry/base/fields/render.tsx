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
import {
  TextareaField,
  TextareaFieldSkeleton,
} from "@/components/buzzform/fields/textarea";
import {
  CheckboxField,
  CheckboxFieldSkeleton,
} from "@/components/buzzform/fields/checkbox";
import {
  PasswordField,
  PasswordFieldSkeleton,
} from "@/components/buzzform/fields/password";
import {
  SwitchField,
  SwitchFieldSkeleton,
} from "@/components/buzzform/fields/switch";
import {
  RadioField,
  RadioFieldSkeleton,
} from "@/components/buzzform/fields/radio";
import {
  NumberField,
  NumberFieldSkeleton,
} from "@/components/buzzform/fields/number";
import {
  TagsField,
  TagsFieldSkeleton,
} from "@/components/buzzform/fields/tags";
import {
  DateField,
  DateFieldSkeleton,
} from "@/components/buzzform/fields/date";
import {
  SelectField,
  SelectFieldSkeleton,
} from "@/components/buzzform/fields/select";
import {
  UploadField,
  UploadFieldSkeleton,
} from "@/components/buzzform/fields/upload";
import { RowField, RowFieldSkeleton } from "@/components/buzzform/fields/row";
import {
  GroupField,
  GroupFieldSkeleton,
} from "@/components/buzzform/fields/group";
import {
  CollapsibleField,
  CollapsibleFieldSkeleton,
} from "@/components/buzzform/fields/collapsible";
import {
  TabsField,
  TabsFieldSkeleton,
} from "@/components/buzzform/fields/tabs";
import {
  ArrayField,
  ArrayFieldSkeleton,
} from "@/components/buzzform/fields/array";

export interface FieldRendererComponentProps {
  field: Field;
  path: string;
  form: FormAdapter;
  autoFocus?: boolean;
  formValues: Record<string, unknown>;
  siblingData: Record<string, unknown>;
  // Computed props
  fieldId: string;
  label: React.ReactNode | null;
  isDisabled: boolean;
  isReadOnly: boolean;
  error?: string;
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
  textarea: {
    kind: "data",
    renderer: TextareaField as ComponentType<FieldRendererComponentProps>,
    skeleton: TextareaFieldSkeleton as ComponentType<{ field: Field }>,
  },
  checkbox: {
    kind: "data",
    renderer: CheckboxField as ComponentType<FieldRendererComponentProps>,
    skeleton: CheckboxFieldSkeleton as ComponentType<{ field: Field }>,
  },
  password: {
    kind: "data",
    renderer: PasswordField as ComponentType<FieldRendererComponentProps>,
    skeleton: PasswordFieldSkeleton as ComponentType<{ field: Field }>,
  },
  switch: {
    kind: "data",
    renderer: SwitchField as ComponentType<FieldRendererComponentProps>,
    skeleton: SwitchFieldSkeleton as ComponentType<{ field: Field }>,
  },
  radio: {
    kind: "data",
    renderer: RadioField as ComponentType<FieldRendererComponentProps>,
    skeleton: RadioFieldSkeleton as ComponentType<{ field: Field }>,
  },
  number: {
    kind: "data",
    renderer: NumberField as ComponentType<FieldRendererComponentProps>,
    skeleton: NumberFieldSkeleton as ComponentType<{ field: Field }>,
  },
  tags: {
    kind: "data",
    renderer: TagsField as ComponentType<FieldRendererComponentProps>,
    skeleton: TagsFieldSkeleton as ComponentType<{ field: Field }>,
  },
  date: {
    kind: "data",
    renderer: DateField as ComponentType<FieldRendererComponentProps>,
    skeleton: DateFieldSkeleton as ComponentType<{ field: Field }>,
  },
  datetime: {
    kind: "data",
    renderer: DateField as ComponentType<FieldRendererComponentProps>,
    skeleton: DateFieldSkeleton as ComponentType<{ field: Field }>,
  },
  select: {
    kind: "data",
    renderer: SelectField as ComponentType<FieldRendererComponentProps>,
    skeleton: SelectFieldSkeleton as ComponentType<{ field: Field }>,
  },
  upload: {
    kind: "data",
    renderer: UploadField as ComponentType<FieldRendererComponentProps>,
    skeleton: UploadFieldSkeleton as ComponentType<{ field: Field }>,
  },
  row: {
    kind: "layout",
    renderer: RowField as ComponentType<FieldRendererComponentProps>,
    skeleton: RowFieldSkeleton as ComponentType<{ field: Field }>,
  },
  group: {
    kind: "data",
    renderer: GroupField as ComponentType<FieldRendererComponentProps>,
    skeleton: GroupFieldSkeleton as ComponentType<{ field: Field }>,
  },
  collapsible: {
    kind: "layout",
    renderer: CollapsibleField as ComponentType<FieldRendererComponentProps>,
    skeleton: CollapsibleFieldSkeleton as ComponentType<{ field: Field }>,
  },
  tabs: {
    kind: "layout",
    renderer: TabsField as ComponentType<FieldRendererComponentProps>,
    skeleton: TabsFieldSkeleton as ComponentType<{ field: Field }>,
  },
  array: {
    kind: "data",
    renderer: ArrayField as ComponentType<FieldRendererComponentProps>,
    skeleton: ArrayFieldSkeleton as ComponentType<{ field: Field }>,
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
  autoFocus,
  fieldId,
  isDisabled,
  isReadOnly,
  error,
}: FieldRendererComponentProps & { field: DataField }) {
  const CustomComponent = field.component as React.ComponentType<
    FieldComponentProps<unknown, DataField>
  >;
  const value = getNestedValue(formValues, path);

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
      error={error}
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
  autoFocus,
  fieldId,
  label,
  isDisabled,
  isReadOnly,
  error,
}: FieldRendererComponentProps & { field: DataField }) {
  const value = getNestedValue(formValues, path);

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
    disabled: isDisabled,
    readOnly: isReadOnly,
    error: error,
    autoFocus,
    validation: {
      isChecking: form.formState.isValidating,
      isValid: !error,
      message: error,
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

      {error && (
        <p className="text-sm text-destructive mt-1.5" role="alert">
          {error}
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

  const isHidden = (() => {
    if (!isDataField(field)) return false;
    if (typeof field.hidden === "function")
      return field.hidden(formValues, siblingData);
    return field.hidden ?? false;
  })();

  const isConditionMet = (() => {
    if (!isDataField(field)) return true;
    if (field.condition) {
      return field.condition(formValues, siblingData, {
        operation: "update",
        path: path.split("."),
      });
    }
    return true;
  })();

  // Derived properties calculation
  const fieldId =
    isDataField(field) && field.id ? field.id : generateFieldId(path);

  const label = (() => {
    // Layout fields (like collapsible, tabs) have label but no name
    if ("label" in field && field.label !== false) {
      return field.label ?? null;
    }
    // Data fields use label or fallback to name
    if (isDataField(field) && field.label !== false) {
      return field.label ?? field.name ?? null;
    }
    return null;
  })();

  const isDisabled = (() => {
    if (!isDataField(field)) return false;
    const disabled =
      typeof field.disabled === "function"
        ? field.disabled(formValues, siblingData)
        : (field.disabled ?? false);
    return disabled || form.formState.isSubmitting;
  })();

  const isReadOnly = (() => {
    if (!isDataField(field)) return false;
    return typeof field.readOnly === "function"
      ? field.readOnly(formValues, siblingData)
      : (field.readOnly ?? false);
  })();

  const error = getErrorMessage(form.formState.errors, path);

  const shouldAutoFocus = (() => {
    if (!isDataField(field)) return false;
    return (
      isFirstField && form.settings?.autoFocus && !isDisabled && !isReadOnly
    );
  })();

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
        fieldId={fieldId}
        label={label}
        isDisabled={isDisabled}
        isReadOnly={isReadOnly}
        error={error}
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
        fieldId={fieldId}
        label={label}
        isDisabled={isDisabled}
        isReadOnly={isReadOnly}
        error={error}
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
      fieldId={fieldId}
      label={label}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      error={error}
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
  let firstFieldName: string | null = null;
  for (const field of fields) {
    if ("name" in field && field.name) {
      firstFieldName = field.name;
      break;
    }
  }

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
