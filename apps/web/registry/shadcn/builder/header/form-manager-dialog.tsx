"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconPlaceholder } from "@/components/icon-placeholder";
import { FormManagerNewPanel } from "./form-manager-new-panel";
import { FormManagerSavedPanel } from "./form-manager-saved-panel";
import type { BuilderStorageProvider } from "@buildnbuzz/form-builder-core";

export function FormManagerDialog({
  storageProvider,
}: {
  storageProvider: BuilderStorageProvider | null;
}) {
  const [open, setOpen] = React.useState(false);

  const handleDone = React.useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="group gap-2">
            <IconPlaceholder
              hugeicons="Add01Icon"
              lucide="Plus"
              tabler="IconPlus"
              phosphor="Plus"
              remixicon="RiAddLine"
              size={16}
              strokeWidth={2}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
            New
          </Button>
        }
      />

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Forms</DialogTitle>
          <DialogDescription>
            Create a new form, import a file, or open a previously saved form.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="new">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-xs grid-cols-2 rounded-full bg-muted">
              <TabsTrigger value="new" className="gap-2 rounded-full">
                <IconPlaceholder
                  hugeicons="Add01Icon"
                  lucide="Plus"
                  tabler="IconPlus"
                  phosphor="Plus"
                  remixicon="RiAddLine"
                  size={16}
                  strokeWidth={2}
                />
                New
              </TabsTrigger>
              <TabsTrigger value="saved" className="gap-2 rounded-full">
                <IconPlaceholder
                  hugeicons="FolderIcon"
                  lucide="Folder"
                  tabler="IconFolder"
                  phosphor="Folder"
                  remixicon="RiFolderLine"
                  size={16}
                  strokeWidth={2}
                />
                Saved Forms
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="new">
            <FormManagerNewPanel onDone={handleDone} />
          </TabsContent>

          <TabsContent value="saved">
            <FormManagerSavedPanel
              onDone={handleDone}
              storageProvider={storageProvider}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
