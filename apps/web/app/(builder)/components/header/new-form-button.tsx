"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useBuilderStore } from "../../lib/store";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";

export function NewFormButton() {
  const [open, setOpen] = useState(false);
  const clearState = useBuilderStore((state) => state.clearState);
  const hasContent = useBuilderStore((state) => state.rootIds.length > 0);

  const handleNewForm = () => {
    clearState();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button size="sm" disabled={!hasContent} className="gap-2 h-8">
            <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2} />
            New Form
          </Button>
        }
      ></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Form?</AlertDialogTitle>
          <AlertDialogDescription>
            This will clear the current form and start fresh. Your current work
            will be lost. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleNewForm}>
            Create New Form
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
