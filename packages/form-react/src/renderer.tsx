import { useContext } from "react";
import type { ReactNode } from "react";
import type {
  Field as CoreField,
  DataField,
  UnnamedDataField,
  ValidationRegistry,
  ValidationRun,
} from "@buildnbuzz/form-core";
import {
  escapePointer,
  fromDotNotation,
  toDotNotation,
} from "@buildnbuzz/form-core";
import { Field, LayoutField } from "./field";
import { FormConfigContext, type FieldRegistry } from "./contexts";
import type { FieldFormApi, UnknownData } from "./types";

type FallbackRenderer = (field: CoreField) => ReactNode;

/** Props for rendering one schema field with a registry component. */
export interface FieldRendererProps<
  TFormData extends UnknownData = UnknownData,
> {
  /** Field schema node to render. */
  field: CoreField;
  /** TanStack form instance created by `useForm`. */
  form: FieldFormApi<TFormData>;
  /** External context data used by dynamic runtime checks. */
  contextData?: UnknownData;
  /** Optional custom validator registry passed through to `Field`. */
  customValidators?: ValidationRegistry;
  /** Which run includes derived checks for generated field validators. */
  derivedValidationMode?: ValidationRun;
  /** Optional registry override for this render call. */
  registry?: FieldRegistry;
  /** Optional fallback when a field type has no renderer. */
  renderFallback?: FallbackRenderer;
  /** Optional parent data path used to resolve nested field names. */
  basePath?: string;
}

/** Renders a single schema field by looking up a renderer from the registry. */
export function FieldRenderer<TFormData extends UnknownData = UnknownData>({
  field,
  form,
  contextData,
  customValidators,
  derivedValidationMode,
  registry,
  renderFallback,
  basePath,
}: FieldRendererProps<TFormData>) {
  const config = useContext(FormConfigContext);
  const resolvedRegistry = registry ?? config?.registry;
  const resolvedDerivedValidationMode =
    derivedValidationMode ?? config?.derivedValidationMode;
  const Component = resolvedRegistry?.[field.type];
  const basePointer = toPointer(basePath);
  const resolvedField = isDataField(field)
    ? resolveDataFieldName(field, basePointer)
    : field;
  const nestedContent = renderNestedFields({
    field,
    form,
    contextData,
    customValidators,
    derivedValidationMode: resolvedDerivedValidationMode,
    registry: resolvedRegistry,
    renderFallback,
    basePointer,
  });
  const componentNode = Component ? (
    <Component>{nestedContent}</Component>
  ) : null;

  if (!Component) {
    if (renderFallback) {
      return (
        <>
          {renderFallback(field)}
          {nestedContent}
        </>
      );
    }
    return nestedContent;
  }

  if (!isDataField(resolvedField)) {
    return (
      <LayoutField
        field={resolvedField}
        form={form}
        contextData={contextData}
        basePath={basePath}
      >
        {componentNode}
      </LayoutField>
    );
  }

  return (
    <Field
      field={resolvedField}
      form={form}
      contextData={contextData}
      customValidators={customValidators}
      derivedValidationMode={resolvedDerivedValidationMode}
    >
      <Component>{nestedContent}</Component>
    </Field>
  );
}

/** Props for rendering a list of schema fields. */
export interface RenderFieldsProps<
  TFormData extends UnknownData = UnknownData,
> {
  /** Ordered field nodes to render. */
  fields: readonly CoreField[];
  /** TanStack form instance created by `useForm`. */
  form: FieldFormApi<TFormData>;
  /** External context data used by dynamic runtime checks. */
  contextData?: UnknownData;
  /** Optional custom validator registry passed through to each field. */
  customValidators?: ValidationRegistry;
  /** Which run includes derived checks for generated field validators. */
  derivedValidationMode?: ValidationRun;
  /** Optional registry override for this render call. */
  registry?: FieldRegistry;
  /** Optional fallback when a field type has no renderer. */
  renderFallback?: FallbackRenderer;
  /** Optional parent data path used to resolve nested field names. */
  basePath?: string;
}

/** Renders a list of schema fields using `FieldRenderer`. */
export function RenderFields<TFormData extends UnknownData = UnknownData>({
  fields,
  form,
  contextData,
  customValidators,
  derivedValidationMode,
  registry,
  renderFallback,
  basePath,
}: RenderFieldsProps<TFormData>) {
  const config = useContext(FormConfigContext);
  const resolvedRegistry = registry ?? config?.registry;
  const resolvedDerivedValidationMode =
    derivedValidationMode ?? config?.derivedValidationMode;

  return (
    <>
      {fields.map((field, index) => {
        const key =
          "name" in field && typeof field.name === "string"
            ? field.name
            : `${field.type}-${index}`;
        return (
          <FieldRenderer
            key={key}
            field={field}
            form={form}
            contextData={contextData}
            customValidators={customValidators}
            derivedValidationMode={resolvedDerivedValidationMode}
            registry={resolvedRegistry}
            renderFallback={renderFallback}
            basePath={basePath}
          />
        );
      })}
    </>
  );
}

type DataFieldLike = DataField | UnnamedDataField;

function isLayoutField(field: CoreField): boolean {
  return field.type === "row" || field.type === "tabs" || field.type === "collapsible";
}

function isDataField(field: CoreField): field is DataFieldLike {
  return !isLayoutField(field);
}

function renderNestedFields<TFormData extends UnknownData>({
  field,
  form,
  contextData,
  customValidators,
  derivedValidationMode,
  registry,
  renderFallback,
  basePointer,
}: {
  field: CoreField;
  form: FieldFormApi<TFormData>;
  contextData?: UnknownData;
  customValidators?: ValidationRegistry;
  derivedValidationMode?: ValidationRun;
  registry?: FieldRegistry;
  renderFallback?: FallbackRenderer;
  basePointer: string;
}): ReactNode {
  if (field.type === "tabs") {
    // Tabs component handles its own nested rendering per-tab via RenderFields.
    // Returning null here prevents double-rendering — the component receives
    // children={null} and calls RenderFields itself for each TabsContent.
    return null;
  }

  if (field.type === "row" || field.type === "collapsible") {
    return (
      <RenderFields
        fields={field.fields}
        form={form}
        contextData={contextData}
        customValidators={customValidators}
        derivedValidationMode={derivedValidationMode}
        registry={registry}
        renderFallback={renderFallback}
        basePath={toDotNotation(basePointer)}
      />
    );
  }

  if (field.type === "group") {
    const nextPointer = joinPointer(basePointer, field.name);
    return (
      <RenderFields
        fields={field.fields}
        form={form}
        contextData={contextData}
        customValidators={customValidators}
        derivedValidationMode={derivedValidationMode}
        registry={registry}
        renderFallback={renderFallback}
        basePath={toDotNotation(nextPointer)}
      />
    );
  }

  if (field.type === "array") {
    // Array component handles its own per-row rendering via RenderFields with concrete indices.
    // Returning null here prevents double-rendering — the component calls RenderFields itself.
    return null;
  }

  return null;
}

function toPointer(path?: string): string {
  if (!path) return "";
  return fromDotNotation(path);
}

function joinPointer(basePointer: string, segment?: string): string {
  if (!segment) return basePointer;
  const escaped = escapePointer(segment);
  if (basePointer === "") return `/${escaped}`;
  return `${basePointer}/${escaped}`;
}

function resolveDataFieldName(
  field: DataFieldLike,
  basePointer: string,
): DataField {
  const nextName = toDotNotation(joinPointer(basePointer, field.name));
  if (typeof field.name === "string" && nextName === field.name) {
    return field as DataField;
  }
  return {
    ...field,
    name: nextName,
  } as DataField;
}
