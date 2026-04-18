import { useMemo, type ReactNode } from "react";
import {
  resolveTabs,
  resolveCollapsible,
  type ResolvedTab,
  type ResolvedCollapsible,
  type TabsField,
  type CollapsibleField,
  type Field as CoreField,
} from "@buildnbuzz/form-core";
import type { UnknownData } from "../../types";
import { useFieldContext, type FieldContextValue } from "../field-context";
import {
  useResolvedFieldText,
  type ResolvedFieldTextOptions,
} from "./use-resolved-field-text";

/** Result payload returned by `useLayoutField`. */
export interface LayoutFieldState<
  TField extends CoreField = CoreField,
  TFormData extends UnknownData = UnknownData,
> extends FieldContextValue<TField, TFormData> {
  /** Resolved field label (if the layout field defines one). */
  label: ReactNode;
  /** Resolved field description (if the layout field defines one). */
  description: ReactNode;
  /** Resolved tab states (only for TabsField). */
  resolvedTabs: ResolvedTab[];
  /** Resolved collapsible state (only for CollapsibleField). */
  resolvedCollapsible?: ResolvedCollapsible;
}

/** Options for `useLayoutField`. */
export type LayoutFieldOptions = ResolvedFieldTextOptions;

/**
 * Aggregates common UI state for BuzzForm layout fields.
 *
 * Provides the field context and resolved text without error state or a11y ids,
 * since layout fields do not register with TanStack Form.
 */
export function useLayoutField<
  TField extends CoreField = CoreField,
  TFormData extends UnknownData = UnknownData,
>(options: LayoutFieldOptions = {}): LayoutFieldState<TField, TFormData> {
  const ctx = useFieldContext<TField, TFormData>();
  const { label, description } = useResolvedFieldText<TField, TFormData>(
    options,
  );

  const { formData, contextData, registries } = ctx;

  const resolvedTabs = useMemo(() => {
    if (ctx.field.type !== "tabs") return [];
    return resolveTabs(
      (ctx.field as TabsField).tabs,
      { data: formData, context: contextData },
      registries?.fns,
    );
  }, [ctx.field, formData, contextData, registries?.fns]);

  const resolvedCollapsible = useMemo(() => {
    if (ctx.field.type !== "collapsible") return undefined;
    return resolveCollapsible(
      ctx.field as CollapsibleField,
      { data: formData, context: contextData },
      registries?.fns,
    );
  }, [ctx.field, formData, contextData, registries?.fns]);

  return {
    ...ctx,
    label,
    description,
    resolvedTabs,
    resolvedCollapsible,
  };
}
