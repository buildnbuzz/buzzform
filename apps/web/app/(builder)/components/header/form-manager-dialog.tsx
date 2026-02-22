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
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, FolderIcon } from "@hugeicons/core-free-icons";
import { FormManagerNewPanel } from "./form-manager-new-panel";
import { FormManagerSavedPanel } from "./form-manager-saved-panel";

export function FormManagerDialog() {
  const [open, setOpen] = React.useState(false);

  const handleDone = React.useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="group gap-2">
            <HugeiconsIcon
              icon={Add01Icon}
              size={16}
              strokeWidth={2}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
            New
          </Button>
        }
      />

      <DialogContent className="sm:max-w-2xl">
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
                <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2} />
                New
              </TabsTrigger>
              <TabsTrigger value="saved" className="gap-2 rounded-full">
                <HugeiconsIcon icon={FolderIcon} size={16} strokeWidth={2} />
                Saved Forms
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="new">
            <FormManagerNewPanel onDone={handleDone} />
          </TabsContent>

          <TabsContent value="saved">
            <FormManagerSavedPanel onDone={handleDone} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
