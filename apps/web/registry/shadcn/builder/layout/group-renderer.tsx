"use client";

import { BuilderNode, DEFAULT_SLOT } from "@buildnbuzz/form-builder-react";
import type { GroupField } from "@buildnbuzz/form-react";

interface GroupRendererProps {
  id: string;
  field: GroupField;
}

/**
 * Visual renderer for 'group' container fields.
 */
export const GroupRenderer = ({ field, id }: GroupRendererProps) => {
  return (
    <div className="rounded-xl border bg-card/30 p-5 shadow-sm">
      {field.label && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground/80">
            {typeof field.label === "string" ? field.label : "Expression Label"}
          </h3>
          {field.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {typeof field.description === "string"
                ? field.description
                : "Expression Description"}
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* Render children in the default slot */}
        <BuilderNode
          id={id}
          render={({ renderSlot }) => renderSlot(DEFAULT_SLOT)}
        />
      </div>
    </div>
  );
};
