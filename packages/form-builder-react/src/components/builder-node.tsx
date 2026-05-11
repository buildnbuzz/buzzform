"use client";

import React, { ReactNode } from "react";
import { useBuilderStore, useBuilderContext } from "../context/builder-context";
import { getRegistryEntry } from "../registry";
import type { Node } from "@buildnbuzz/form-builder-core";
import { DEFAULT_SLOT } from "@buildnbuzz/form-builder-core";
import { SortableContext, verticalListSortingStrategy, type SortingStrategy } from "@dnd-kit/sortable";

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
    renderSlot: (slotKey: string, strategy?: SortingStrategy) => ReactNode;
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
  
  /** Renders all children in a specific slot, optionally specifying a sorting strategy. */
  const renderSlot = (slotKey: string, strategy: SortingStrategy = verticalListSortingStrategy): ReactNode => {
    const childrenIds = node.children[slotKey] || [];
    return (
      <SortableContext items={childrenIds} strategy={strategy}>
        {childrenIds.map((childId) => (
          <BuilderNode key={childId} id={childId} render={render} />
        ))}
      </SortableContext>
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
        renderSlot={renderSlot}
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
