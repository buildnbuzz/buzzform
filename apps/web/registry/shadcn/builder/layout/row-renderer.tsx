"use client";

import { BuilderNode, DEFAULT_SLOT } from "@buildnbuzz/form-builder-react";
import type { RowField } from "@buildnbuzz/form-react";

interface RowRendererProps {
  id: string;
  field: RowField;
}

/**
 * Visual renderer for 'row' layout fields.
 * Displays children in a horizontal grid.
 */
export const RowRenderer = ({ id }: RowRendererProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
      <BuilderNode 
        id={id} 
        render={({ renderSlot }) => renderSlot(DEFAULT_SLOT)}
      />
    </div>
  );
};
