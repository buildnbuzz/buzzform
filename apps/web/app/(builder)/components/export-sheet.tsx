"use client";

import * as React from "react";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Download01Icon,
  File02Icon,
  FileExportIcon,
  SourceCodeIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateComponentCode } from "../lib/code-generator";
import { toBuilderDocument } from "../lib/persistence";
import { downloadTextFile, toSafeFileName } from "../lib/utils";
import { useBuilderStore } from "../lib/store";

const starterCommand =
  "npx shadcn@latest add https://form.buildnbuzz.com/r/starter.json";

export function ExportSheet() {
  const [open, setOpen] = React.useState(false);
  const [snapshotUpdatedAt, setSnapshotUpdatedAt] = React.useState<
    number | null
  >(null);

  const nodes = useBuilderStore((state) => state.nodes);
  const rootIds = useBuilderStore((state) => state.rootIds);
  const formId = useBuilderStore((state) => state.formId);
  const formName = useBuilderStore((state) => state.formName);

  React.useEffect(() => {
    if (!open) return;
    setSnapshotUpdatedAt(Date.now());
  }, [open, nodes, rootIds, formId, formName]);

  const documentJson = React.useMemo(() => {
    if (!open || snapshotUpdatedAt === null) return "";

    const document = toBuilderDocument(
      {
        nodes,
        rootIds,
        formId,
        formName,
      },
      { updatedAt: snapshotUpdatedAt },
    );

    return JSON.stringify(document, null, 2);
  }, [open, nodes, rootIds, formId, formName, snapshotUpdatedAt]);

  const componentCode = React.useMemo(() => {
    if (!open) return "";
    return generateComponentCode(nodes, rootIds, formName);
  }, [open, nodes, rootIds, formName]);

  const downloadJson = React.useCallback(() => {
    if (!documentJson) return;
    const fileName = `${toSafeFileName(formName)}.json`;
    downloadTextFile(documentJson, fileName, "application/json");
    toast.success("Builder backup exported");
  }, [documentJson, formName]);

  const downloadCode = React.useCallback(() => {
    if (!componentCode) return;
    const fileName = `${toSafeFileName(formName)}.tsx`;
    downloadTextFile(componentCode, fileName, "text/plain;charset=utf-8");
    toast.success("Component code exported");
  }, [componentCode, formName]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" className="gap-2">
            <HugeiconsIcon icon={FileExportIcon} size={16} strokeWidth={2} />
            Export
          </Button>
        }
      />

      <SheetContent
        side="right"
        className="w-full p-0 gap-0 data-[side=right]:w-[min(96vw,1120px)] data-[side=right]:sm:max-w-280"
      >
        <SheetHeader className="border-b pr-12">
          <SheetTitle>Export Form</SheetTitle>
          <SheetDescription>
            Export production-ready TSX for your app, or a BuzzForm file for
            Builder import.
          </SheetDescription>
        </SheetHeader>

        <Tabs
          defaultValue="tsx"
          className="flex h-full min-h-0 flex-1 flex-col p-4"
        >
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="tsx" className="gap-1.5">
              <HugeiconsIcon icon={SourceCodeIcon} size={16} strokeWidth={2} />
              App Code
              <Badge variant="outline">.tsx</Badge>
            </TabsTrigger>
            <TabsTrigger value="json" className="gap-1.5">
              <HugeiconsIcon icon={File02Icon} size={16} strokeWidth={2} />
              BuzzForm File
              <Badge variant="outline">.json</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tsx" className="min-h-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full px-4 py-2">
              <div className="space-y-3 p-1">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <HugeiconsIcon
                      icon={SourceCodeIcon}
                      size={16}
                      strokeWidth={1.8}
                      className="text-muted-foreground"
                    />
                    Required setup
                  </div>
                  <div className="[&_figure]:my-0!">
                    <DynamicCodeBlock lang="bash" code={starterCommand} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={downloadCode}
                    >
                      <HugeiconsIcon
                        icon={Download01Icon}
                        size={16}
                        strokeWidth={2}
                      />
                      Download TSX File
                    </Button>
                  </div>
                </div>

                <div className="[&_figure]:my-0!">
                  <DynamicCodeBlock lang="tsx" code={componentCode} />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="json" className="min-h-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full px-4 py-2">
              <div className="space-y-3 p-1">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <HugeiconsIcon
                      icon={File02Icon}
                      size={16}
                      strokeWidth={1.8}
                      className="text-muted-foreground"
                    />
                    BuzzForm file
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Keep this as your editable BuzzForm source file to back up,
                    share, and continue work later in BuzzForm Builder.
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={downloadJson}
                    >
                      <HugeiconsIcon
                        icon={Download01Icon}
                        size={16}
                        strokeWidth={2}
                      />
                      Download BuzzForm File
                    </Button>
                  </div>
                </div>

                <div className="[&_figure]:my-0!">
                  <DynamicCodeBlock lang="json" code={documentJson} />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
