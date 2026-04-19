"use client";

import React, { ReactNode } from "react";
import { useBuilderStore } from "../context/BuilderContext";
import { BuilderNode, type BuilderNodeProps } from "./BuilderNode";

export interface BuilderCanvasProps {
  /** 
   * Custom renderer for the whole canvas area.
   * Useful for adding a droppable root area or consistent styling.
   */
  render?: (props: {
    rootIds: string[];
    /** Renders all root nodes using the default logic. */
    renderRoots: () => ReactNode;
  }) => ReactNode;
  
  /** 
   * Passed down to each BuilderNode. 
   * Allows consistent wrapping of all nodes on the canvas.
   */
  nodeRenderer?: BuilderNodeProps["render"];
}

/**
 * The top-level entry point for rendering the form builder canvas.
 */
export const BuilderCanvas = ({ render, nodeRenderer }: BuilderCanvasProps) => {
  const rootIds = useBuilderStore((state) => state.rootIds);

  const renderRoots = () => (
    <>
      {rootIds.map((id) => (
        <BuilderNode key={id} id={id} render={nodeRenderer} />
      ))}
    </>
  );

  if (render) {
    return render({ rootIds, renderRoots });
  }

  return <>{renderRoots()}</>;
};
