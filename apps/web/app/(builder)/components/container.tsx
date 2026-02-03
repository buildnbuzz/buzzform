"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { EditableNode } from "./editable-node";
import { useBuilderStore } from "../lib/store";
import { FormActions, FormSubmit } from "@/registry/base/form";

export function Container({
  childrenIds,
  parentId = null,
}: {
  childrenIds: string[];
  parentId?: string | null;
}) {
  const indicatorIndex = useBuilderStore((s) =>
    s.dropIndicator?.parentId === parentId ? s.dropIndicator.index : null,
  );

  // Only show submit button for root container
  const isRootContainer = parentId === null;

  return (
    <>
      <SortableContext
        items={childrenIds}
        strategy={verticalListSortingStrategy}
      >
        {childrenIds.map((id, index) => (
          <div key={id}>
            {indicatorIndex === index && <DropLine />}

            <EditableNode id={id} />
          </div>
        ))}

        {indicatorIndex === childrenIds.length && <DropLine />}
      </SortableContext>

      {isRootContainer && (
        <FormActions className="mt-4" align="start">
          <FormSubmit>Submit</FormSubmit>
        </FormActions>
      )}
    </>
  );
}

function DropLine() {
  return <div className="h-1 bg-primary my-1" />;
}
