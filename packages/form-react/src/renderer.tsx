import { useContext } from "react";
import type { ReactNode } from "react";
import type {
  Field as CoreField,
  FieldInput,
  DataField,
  FormRegistries,
  ValidationRegistry,
  OptionResolverRegistry,
  ValidationRun,
  GroupField,
  RowField,
  CollapsibleField,
} from "@buildnbuzz/form-core";
import { fromDotNotation, joinPointer, toDotNotation, isDataField } from "@buildnbuzz/form-core";
import { Field, LayoutField } from "./field";
import { FormConfigContext, type FieldRegistry } from "./contexts";
import type { FieldFormApi, UnknownData } from "./types";
import { mergeRegistries } from "./utils/merge-registries";

type FallbackRenderer = (field: FieldInput) => ReactNode;

/** Props for rendering one schema field with a registry component. */
export interface FieldRendererProps<
  TFormData extends UnknownData = UnknownData,
> {
  /** Field schema node to render. */
  field: FieldInput;
  /** TanStack form instance created by `useForm`. */
  form: FieldFormApi<TFormData>;
  /** External context data used by dynamic runtime checks. */
  contextData?: UnknownData;
  /** Optional runtime registries (validators, resolvers, fns, fields). */
  registries?: FormRegistries;
  /** @deprecated Use `registries.validators` instead. */
  customValidators?: ValidationRegistry;
  /** @deprecated Use `registries.resolvers` instead. */
  optionResolvers?: OptionResolverRegistry;
  /** @deprecated Use `registries.fields` instead. */
  registry?: FieldRegistry;
  /** Which run includes derived checks for generated field validators. */
  derivedValidationMode?: ValidationRun;
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
  registries,
  customValidators,
  optionResolvers,
  registry,
  derivedValidationMode,
  renderFallback,
  basePath,
}: FieldRendererProps<TFormData>) {
  const config = useContext(FormConfigContext);

  // Normalize all deprecated shims into registries at the entry point.
  // Everything downstream only sees `normalizedRegistries`.
  const normalizedRegistries = mergeRegistries(config?.registries, {
    ...registries,
    fields: (registries?.fields ?? registry) as FormRegistries["fields"],
    validators: { ...registries?.validators, ...customValidators } as FormRegistries["validators"],
    resolvers: { ...registries?.resolvers, ...optionResolvers } as FormRegistries["resolvers"],
  });

  const resolvedDerivedValidationMode =
    derivedValidationMode ?? config?.derivedValidationMode;
  const resolvedRegistry = normalizedRegistries?.fields as FieldRegistry | undefined;
  const Component = resolvedRegistry?.[field.type];
  const basePointer = toPointer(basePath);
  let resolvedField: FieldInput = field;
  if (isDataField(field)) {
    resolvedField = resolveDataFieldName(field, basePointer);
  }
  const nestedContent = renderNestedFields({
    field,
    form,
    contextData,
    registries: normalizedRegistries,
    derivedValidationMode: resolvedDerivedValidationMode,
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
        field={resolvedField as CoreField}
        form={form}
        contextData={contextData}
        registries={normalizedRegistries}
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
      registries={normalizedRegistries}
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
  fields: readonly FieldInput[];
  /** TanStack form instance created by `useForm`. */
  form: FieldFormApi<TFormData>;
  /** External context data used by dynamic runtime checks. */
  contextData?: UnknownData;
  /** Optional runtime registries (validators, resolvers, fns, fields). */
  registries?: FormRegistries;
  /** @deprecated Use `registries.validators` instead. */
  customValidators?: ValidationRegistry;
  /** @deprecated Use `registries.resolvers` instead. */
  optionResolvers?: OptionResolverRegistry;
  /** @deprecated Use `registries.fields` instead. */
  registry?: FieldRegistry;
  /** Which run includes derived checks for generated field validators. */
  derivedValidationMode?: ValidationRun;
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
  registries,
  customValidators,
  optionResolvers,
  registry,
  derivedValidationMode,
  renderFallback,
  basePath,
}: RenderFieldsProps<TFormData>) {
  const config = useContext(FormConfigContext);

  // Normalize all deprecated shims into registries at the entry point.
  const normalizedRegistries = mergeRegistries(config?.registries, {
    ...registries,
    fields: (registries?.fields ?? registry) as FormRegistries["fields"],
    validators: { ...registries?.validators, ...customValidators } as FormRegistries["validators"],
    resolvers: { ...registries?.resolvers, ...optionResolvers } as FormRegistries["resolvers"],
  });

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
            registries={normalizedRegistries}
            derivedValidationMode={resolvedDerivedValidationMode}
            renderFallback={renderFallback}
            basePath={basePath}
          />
        );
      })}
    </>
  );
}

// Internal — only called after normalization, so no deprecated props needed.
function renderNestedFields<TFormData extends UnknownData>({
  field,
  form,
  contextData,
  registries,
  derivedValidationMode,
  renderFallback,
  basePointer,
}: {
  field: FieldInput;
  form: FieldFormApi<TFormData>;
  contextData?: UnknownData;
  registries?: FormRegistries;
  derivedValidationMode?: ValidationRun;
  renderFallback?: FallbackRenderer;
  basePointer: string;
}): ReactNode {
  switch (field.type) {
    case "tabs":
      // Tabs component handles its own nested rendering per-tab via RenderFields.
      return null;

    case "row":
    case "collapsible": {
      const f = field as RowField | CollapsibleField;
      return (
        <RenderFields
          fields={f.fields}
          form={form}
          contextData={contextData}
          registries={registries}
          derivedValidationMode={derivedValidationMode}
          renderFallback={renderFallback}
          basePath={toDotNotation(basePointer)}
        />
      );
    }

    case "group": {
      const f = field as GroupField;
      const nextPointer = joinPointer(basePointer, f.name);
      return (
        <RenderFields
          fields={f.fields}
          form={form}
          contextData={contextData}
          registries={registries}
          derivedValidationMode={derivedValidationMode}
          renderFallback={renderFallback}
          basePath={toDotNotation(nextPointer)}
        />
      );
    }

    case "array":
      // Array component handles its own per-row rendering via RenderFields with concrete indices.
      return null;

    default:
      return null;
  }
}

function toPointer(path?: string): string {
  if (!path) return "";
  return fromDotNotation(path);
}

function resolveDataFieldName(
  field: DataField,
  basePointer: string,
): DataField {
  const name = field.name ?? "";
  const nextName = toDotNotation(joinPointer(basePointer, name));
  if (nextName === name) {
    return field;
  }
  return {
    ...field,
    name: nextName,
  };
}
