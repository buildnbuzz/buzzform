"use client";

import React from "react";
import {
  DEFAULT_FIELD_REGISTRY,
  isDataField,
} from "@buildnbuzz/form-builder-core";
import { Field, type DataField } from "@buildnbuzz/form-react";
import { registry as shadcnRegistry } from "../registry";
import { RowRenderer } from "./layout/row-renderer";
import { GroupRenderer } from "./layout/group-renderer";
import { ArrayRenderer } from "./layout/array-renderer";
import { TabsRenderer } from "./layout/tabs-renderer";
import { CollapsibleRenderer } from "./layout/collapsible-renderer";
import {
  useBuilderFormContext,
  type BuilderNodeRendererProps,
  type BuilderFieldRegistry,
} from "@buildnbuzz/form-builder-react";

/**
 * Generic renderer for data fields that uses the runtime components.
 * Wraps the component in a Field to provide the necessary headless context.
 */
const DataFieldRenderer = ({ field }: BuilderNodeRendererProps) => {
  const { form } = useBuilderFormContext();
  const Component = shadcnRegistry[field.type];

  if (!Component || !isDataField(field)) {
    return null;
  }

  return (
    <Field field={field as DataField} form={form}>
      <Component />
    </Field>
  );
};

const specializedRenderers: Record<
  string,
  React.ComponentType<BuilderNodeRendererProps>
> = {
  row: RowRenderer,
  group: GroupRenderer,
  array: ArrayRenderer,
  tabs: TabsRenderer,
  collapsible: CollapsibleRenderer,
};

/**
 * Shadcn-specific builder registry.
 * Hydrates the core metadata registry with React renderers.
 */
export const SHADCN_BUILDER_REGISTRY: BuilderFieldRegistry = Object.entries(
  DEFAULT_FIELD_REGISTRY,
).reduce((acc, [type, entry]) => {
  if (!entry) return acc;

  acc[type] = {
    ...entry,
    renderer: (specializedRenderers[type] ??
      DataFieldRenderer) as React.ComponentType<BuilderNodeRendererProps>,
  };
  return acc;
}, {} as BuilderFieldRegistry);
