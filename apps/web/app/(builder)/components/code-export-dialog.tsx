"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBuilderStore } from "../lib/store";
import { generateComponentCode } from "../lib/code-generator";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { HugeiconsIcon } from "@hugeicons/react";
import { SourceCodeIcon } from "@hugeicons/core-free-icons";
export function CodeExportDialog() {
  const nodes = useBuilderStore((s) => s.nodes);
  const rootIds = useBuilderStore((s) => s.rootIds);
  const [open, setOpen] = useState(false);

  // Generate code on the fly when dialog opens
  const code = open ? generateComponentCode(nodes, rootIds) : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-2">
            <HugeiconsIcon icon={SourceCodeIcon} />
            Export
          </Button>
        }
      />
      <DialogContent className="sm:max-w-4xl w-full flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Export Component</DialogTitle>
          <DialogDescription>
            Copy this code to use your form in your application.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <DynamicCodeBlock lang="tsx" code={code} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
