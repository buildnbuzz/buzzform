"use client";

import React, { ReactNode } from "react";
import { useBuilderStore, useBuilderContext } from "../context/BuilderContext";
import { getRegistryEntry } from "../registry";
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
 */
export const BuilderNode = ({ id, render }: BuilderNodeProps) => {
  const node = useBuilderStore((state) => state.nodes[id]);
  const { registry } = useBuilderContext();

  if (!node) return null;

  const entry = getRegistryEntry(registry, node.field.type);
  
  /** Renders all children in a specific slot. */
  const renderSlot = (slotKey: string): ReactNode => {
    const childrenIds = node.children[slotKey] || [];
    return (
      <React.Fragment>
        {childrenIds.map((childId) => (
          <BuilderNode key={childId} id={childId} render={render} />
        ))}
      </React.Fragment>
    );
  };

  // Determine what to render as "content"
  let content: ReactNode = null;

  if (entry?.renderer) {
    const Renderer = entry.renderer;
    // Safely flatten children IDs
    const allChildrenIds: string[] = Object.values(node.children).reduce<string[]>(
      (acc, list) => [...acc, ...list], 
      []
    );
    
    content = (
      <Renderer 
        id={id} 
        field={node.field} 
        childrenIds={allChildrenIds}
      />
    );
  }

  if (render) {
    return render({ 
      node, 
      content,
      renderSlot
    });
  }

  return content || renderSlot(DEFAULT_SLOT);
};
