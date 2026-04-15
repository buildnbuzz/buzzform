"use client";

import React, { ReactNode } from "react";
import { useBuilderStore, useBuilderContext } from "../context/BuilderContext";
import type { Node } from "@buildnbuzz/form-builder-core";
import { DEFAULT_SLOT } from "@buildnbuzz/form-builder-core";

export interface BuilderNodeProps {
  /** The unique ID of the node to render. */
  id: string;
  /** 
   * Optional custom renderer for the node.
   * Enables adding DnD, selection borders, toolbars, etc.
   */
  render?: (props: {
    node: Node;
    /** The rendered content (either field preview or layout children). */
    content: ReactNode;
    /** Helper to render a specific slot's children. */
    renderSlot: (slot: string) => ReactNode;
  }) => ReactNode;
}

/**
 * Headless recursive component that orchestrates node rendering.
 * 
 * It handles:
 * 1. Store lookup.
 * 2. Slot discovery.
 * 3. Recursive child rendering.
 * 4. Registry-based renderer dispatch.
 */
export const BuilderNode = ({ id, render }: BuilderNodeProps) => {
  const node = useBuilderStore((state) => state.nodes[id]);
  const { registry } = useBuilderContext();

  if (!node) return null;

  const entry = registry[node.field.type];
  
  /** Renders all children in a specific slot. */
  const renderSlot = (slotKey: string): ReactNode => {
    const childrenIds = node.children[slotKey] || [];
    return (
      <>
        {childrenIds.map((childId) => (
          <BuilderNode key={childId} id={childId} render={render} />
        ))}
      </>
    );
  };

  // Determine what to render as "content"
  let content: ReactNode = null;

  if (entry?.renderer) {
    // Layout/Container components use their own renderer (e.g. Row, Tabs)
    const Renderer = entry.renderer;
    // Flatten children for simple renderers, but provide renderSlot for complex ones
    const allChildrenIds = Object.values(node.children).flat();
    
    content = (
      <Renderer 
        id={id} 
        field={node.field} 
        childrenIds={allChildrenIds}
      />
    );
  } else {
    // Data fields or fields without a special builder renderer.
    // In a real implementation, this might render a 'FieldRenderer' or similar.
    // Since this package is headless, we leave the "how it looks" to the consumer
    // or provide a default placeholder.
    content = null; 
  }

  // If a renderer is provided, use it. Otherwise, return the content directly.
  if (render) {
    return render({ 
      node, 
      content,
      renderSlot
    });
  }

  // Default behavior: render the entry renderer or the default slot children
  return content || renderSlot(DEFAULT_SLOT);
};
