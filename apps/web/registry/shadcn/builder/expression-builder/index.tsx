"use client";

import React, { useState } from "react";
import { DndContext, closestCorners } from "@dnd-kit/core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconPlaceholder } from "@/components/icon-placeholder";

import type { ExpressionGroup } from "@buildnbuzz/form-builder-core";
import {
  useExpressionStore,
  useExpressionDnd,
} from "@buildnbuzz/form-builder-react";

import { ExpressionGroupItem } from "./expression-group";

export { ExpressionGroupItem } from "./expression-group";
export { ExpressionRuleItem } from "./expression-rule";
export { SortableItem } from "./sortable-item";

export interface ExpressionBuilderProps {
  initialValue?: ExpressionGroup;
  onSave: (group: ExpressionGroup) => void;
  trigger?: React.ReactElement;
}

export function ExpressionBuilder({
  initialValue,
  onSave,
  trigger,
}: ExpressionBuilderProps) {
  const [open, setOpen] = useState(false);

  const { store, rootGroup } = useExpressionStore(initialValue, open);
  const { sensors, handleDragOver, handleDragEnd } = useExpressionDnd(store);

  const handleSave = () => {
    onSave(store.getState().rootGroup);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger || (
            <Button variant="outline">
              <span className="mr-2 flex items-center justify-center">
                <IconPlaceholder
                  lucide="Settings"
                  hugeicons="Settings01Icon"
                  tabler="IconSettings"
                  phosphor="Gear"
                  remixicon="RiSettings4Line"
                  size={16}
                />
              </span>
              Expression Logic
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-4xl md:max-w-5xl lg:max-w-6xl w-[95vw] h-[80vh] flex flex-col p-0 overflow-hidden bg-background/80">
        <DialogHeader className="p-6 pb-4 bg-card border-b shrink-0 flex flex-row items-start gap-4 space-y-0 text-left">
          <div className="text-primary flex items-center justify-center p-2 rounded-xl bg-primary/10">
            <IconPlaceholder
              lucide="Settings"
              hugeicons="Settings01Icon"
              tabler="IconSettings"
              phosphor="Gear"
              remixicon="RiSettings4Line"
              size={24}
            />
          </div>
          <div className="flex flex-col gap-1">
            <DialogTitle>Expression Builder</DialogTitle>
            <DialogDescription>
              Define the logical expression for this property.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <ExpressionGroupItem
              group={rootGroup}
              isRoot={true}
              store={store}
            />
          </DndContext>
        </div>

        <DialogFooter className="border-t shrink-0 m-0 rounded-none">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Save Expression
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
