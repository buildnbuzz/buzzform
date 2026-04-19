"use client";

import { ReactNode, useMemo } from "react";
import { useBuilderStore, useBuilderContext } from "../context/BuilderContext";
import { getRegistryEntry } from "../registry";
import type { Node } from "@buildnbuzz/form-builder-core";
import { formSettingsProperties } from "@buildnbuzz/form-builder-core";
import type { Field } from "@buildnbuzz/form-core";

export interface BuilderPropertiesProps {
  /** 
   * Render prop that receives the currently selected node and its property schema.
   */
  render: (props: { 
    /** The currently selected node, if any. */
    node: Node | null; 
    /** The target ID being edited (node ID or 'form'). */
    id: string;
    /** 
     * The property editor schema.
     * - Returns field properties if a node is selected.
     * - Returns form-level settings if no node is selected.
     */
    schema: Field[];
    /**
     * The current values of the selected node's fields or form settings.
     */
    data: Record<string, unknown>;
    /** 
     * Helper to update properties.
     * - Patches the selected node if one exists.
     * - Patches form settings if no node is selected.
     */
    update: (updates: Record<string, unknown>) => void;
  }) => ReactNode;
}

/**
 * Headless component that orchestrates property editing.
 * Falls back to global form settings when no node is selected.
 */
export const BuilderProperties = ({ render }: BuilderPropertiesProps) => {
  const selectedId = useBuilderStore((s) => s.selectedId);
  const node = useBuilderStore((s) => selectedId ? s.nodes[selectedId] : null);
  const { registry } = useBuilderContext();
  const updateNode = useBuilderStore((s) => s.updateNode);
  const updateFormSettings = useBuilderStore((s) => s.updateFormSettings);
  
  const formName = useBuilderStore((s) => s.formName);
  const formId = useBuilderStore((s) => s.formId);
  const outputConfig = useBuilderStore((s) => s.outputConfig);
  
  const schema = useMemo(() => {
    if (node) {
      const entry = getRegistryEntry(registry, node.field.type);
      return entry?.properties ?? [];
    }
    return formSettingsProperties;
  }, [node, registry]);

  const data = useMemo(() => {
    if (node) return (node.field as unknown) as Record<string, unknown>;
    return {
      title: formName,
      id: formId,
      output: outputConfig
    } as Record<string, unknown>;
  }, [node, formName, formId, outputConfig]);

  const update = (updates: Record<string, unknown>) => {
    if (selectedId) {
      updateNode(selectedId, updates as Partial<Field>);
    } else {
      updateFormSettings(updates);
    }
  };

  return <>{render({ node: node || null, id: selectedId || "form", schema, data, update })}</>;
};
