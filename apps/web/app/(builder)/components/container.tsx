"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { EditableNode } from "./editable-node";
import { FormActions, FormSubmit } from "@/registry/base/form";
import { useDropIndicatorIndex } from "../hooks/use-drop-indicator-index";

export function Container({
  childrenIds,
  parentId = null,
  parentSlot = null,
}: {
  childrenIds: string[];
  parentId?: string | null;
  parentSlot?: string | null;
}) {
  const indicatorIndex = useDropIndicatorIndex(parentId, parentSlot);

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
