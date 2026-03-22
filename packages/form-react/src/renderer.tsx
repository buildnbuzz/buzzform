import { useContext } from "react";
import type { ReactNode } from "react";
import type {
  Field as CoreField,
  DataField,
  ValidationRegistry,
  ValidationRun,
} from "@buildnbuzz/form-core";
import { Field } from "./field";
import { RegistryContext, type FieldRegistry } from "./contexts";
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
}: FieldRendererProps<TFormData>) {
  const contextRegistry = useContext(RegistryContext);
  const resolvedRegistry = registry ?? contextRegistry;
  const Component = resolvedRegistry?.[field.type];

  if (!Component) {
    return renderFallback ? renderFallback(field) : null;
  }

  if (!isDataField(field)) {
    return <Component />;
  }

  return (
    <Field
      field={field}
      form={form}
      contextData={contextData}
      customValidators={customValidators}
      derivedValidationMode={derivedValidationMode}
    >
      <Component />
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
}: RenderFieldsProps<TFormData>) {
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
            derivedValidationMode={derivedValidationMode}
            registry={registry}
            renderFallback={renderFallback}
          />
        );
      })}
    </>
  );
}

function isDataField(field: CoreField): field is DataField {
  return "name" in field && typeof field.name === "string";
}
