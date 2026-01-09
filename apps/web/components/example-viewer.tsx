"use client";

import * as React from "react";
import * as Examples from "@/components/examples";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CodeIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import type { Example } from "@/lib/examples";

interface ExampleViewerProps {
  example: Example;
  code: string | null;
}

/**
 * Client component for displaying an example form and its code.
 * Receives pre-fetched code from the RSC parent.
 */
export function ExampleViewer({ example, code }: ExampleViewerProps) {
  // Dynamically get the component from the Examples module
  const Component =
    Examples[example.id as keyof typeof Examples] ||
    Examples.ContactFormExample;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight">{example.name}</h2>
          <p className="text-muted-foreground">{example.description}</p>
        </div>
        <CodeDialog code={code} exampleName={example.name} />
      </div>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm bg-background/50 backdrop-blur-[2px] p-4 md:p-8 lg:p-12 min-h-100 md:min-h-125">
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center [&>div]:w-full">
          <Component />
        </div>
      </div>
    </div>
  );
}

interface CodeDialogProps {
  code: string | null;
  exampleName: string;
}

/**
 * Dialog for viewing source code.
 * Code is already pre-fetched - no loading needed!
 */
function CodeDialog({ code, exampleName }: CodeDialogProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2">
            <HugeiconsIcon icon={CodeIcon} size={16} />
            View Code
          </Button>
        }
      />
      <DialogContent className="sm:max-w-300 h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Component Code</DialogTitle>
          <DialogDescription>Source code for {exampleName}</DialogDescription>
        </DialogHeader>
        <div className="bg-muted">
          {code ? (
            <div className="text-sm p-4">
              <DynamicCodeBlock lang="tsx" code={code} />
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No code available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
