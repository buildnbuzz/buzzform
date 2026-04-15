"use client";

import { ReactNode } from "react";
import { useBuilderStore, useBuilderContext } from "../context/BuilderContext";
import type { Node } from "@buildnbuzz/form-builder-core";
import type { Field } from "@buildnbuzz/form-core";

export interface BuilderPropertiesProps {
  /** 
   * Render prop that receives the currently selected node and its property schema.
   */
  render: (props: { 
    /** The currently selected node, if any. */
    node: Node | null; 
    /** The property editor schema (array of fields) defined in the registry for this node type. */
    schema: Field[] | null;
    /** Helper to update the properties of the selected node. */
    update: (updates: Partial<Field>) => void;
  }) => ReactNode;
}

/**
 * Headless component that orchestrates property editing for the selected node.
 */
export const BuilderProperties = ({ render }: BuilderPropertiesProps) => {
  const selectedId = useBuilderStore((s) => s.selectedId);
  const node = useBuilderStore((s) => selectedId ? s.nodes[selectedId] : null);
  const { registry } = useBuilderContext();
  const updateNode = useBuilderStore((s) => s.updateNode);
  
  const entry = node ? registry[node.field.type] : null;
  const schema = entry?.properties ?? null;

  const update = (updates: Partial<Field>) => {
    if (selectedId) {
      updateNode(selectedId, updates);
    }
  };

  return <>{render({ node: node || null, schema, update })}</>;
};
