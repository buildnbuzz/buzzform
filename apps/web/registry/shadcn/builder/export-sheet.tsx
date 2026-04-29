"use client";

import * as React from "react";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
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
import { IconPlaceholder } from "@/components/icon-placeholder";
import {
  generateComponentCode,
  nodesToFields,
  toSafeFileName,
} from "@buildnbuzz/form-builder-core";
import {
  useBuilderStore,
  downloadTextFile,
} from "@buildnbuzz/form-builder-react";

const starterCommand =
  "npx shadcn@latest add https://form.buildnbuzz.com/r/all.json";

export function ExportSheet() {
  const [open, setOpen] = React.useState(false);

  const nodes = useBuilderStore((state) => state.nodes);
  const rootIds = useBuilderStore((state) => state.rootIds);
  const formName = useBuilderStore((state) => state.formName);
  const outputConfig = useBuilderStore((state) => state.outputConfig);

  const componentCode = React.useMemo(() => {
    if (!open) return "";
    return generateComponentCode(nodes, rootIds, formName, outputConfig);
  }, [open, nodes, rootIds, formName, outputConfig]);

  const schemaJson = React.useMemo(() => {
    if (!open) return "";
    const fields = nodesToFields(nodes, rootIds);
    const schema = {
      title: formName || "BuzzForm Export",
      fields,
    };
    return JSON.stringify(schema, null, 2);
  }, [open, nodes, rootIds, formName]);

  const downloadSchema = React.useCallback(() => {
    if (!schemaJson) return;
    const fileName = `${toSafeFileName(formName)}.json`;
    downloadTextFile(schemaJson, fileName, "application/json");
    toast.success("BuzzForm schema exported");
  }, [schemaJson, formName]);

  const downloadCode = React.useCallback(() => {
    if (!componentCode) return;
    const fileName = `${toSafeFileName(formName)}.tsx`;
    downloadTextFile(componentCode, fileName, "text/plain;charset=utf-8");
    toast.success("Component code exported");
  }, [componentCode, formName]);

  const copyToClipboard = React.useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" className="gap-2">
            <IconPlaceholder
              hugeicons="FileExportIcon"
              lucide="FileDown"
              tabler="IconFileExport"
              phosphor="FileArrowDown"
              remixicon="RiFileDownloadLine"
              size={16}
              strokeWidth={2}
            />
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
            Export production-ready TSX or portable BuzzForm schema JSON.
          </SheetDescription>
        </SheetHeader>

        <Tabs
          defaultValue="tsx"
          className="flex h-full min-h-0 flex-1 flex-col p-4"
        >
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="tsx" className="gap-1.5">
              <IconPlaceholder
                hugeicons="SourceCodeIcon"
                lucide="Code"
                tabler="IconCode"
                phosphor="Code"
                remixicon="RiCodeLine"
                size={16}
                strokeWidth={2}
              />
              App Code
              <Badge variant="outline">.tsx</Badge>
            </TabsTrigger>
            <TabsTrigger value="schema" className="gap-1.5">
              <IconPlaceholder
                hugeicons="File02Icon"
                lucide="File"
                tabler="IconFile"
                phosphor="File"
                remixicon="RiFileCodeLine"
                size={16}
                strokeWidth={2}
              />
              BuzzForm Schema
              <Badge variant="outline">.json</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tsx" className="min-h-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full px-4 py-2">
              <div className="space-y-3 p-1">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <IconPlaceholder
                      hugeicons="SourceCodeIcon"
                      lucide="Code"
                      tabler="IconCode"
                      phosphor="Code"
                      remixicon="RiCodeLine"
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
                      <IconPlaceholder
                        hugeicons="Download01Icon"
                        lucide="Download"
                        tabler="IconDownload"
                        phosphor="DownloadSimple"
                        remixicon="RiDownload2Line"
                        size={16}
                        strokeWidth={2}
                      />
                      Download TSX File
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(componentCode, "App code")}
                    >
                      <IconPlaceholder
                        hugeicons="Copy01Icon"
                        lucide="Copy"
                        tabler="IconCopy"
                        phosphor="Copy"
                        remixicon="RiFileCopyLine"
                        size={16}
                        strokeWidth={2}
                      />
                      Copy Code
                    </Button>
                  </div>
                </div>

                <div className="[&_figure]:my-0!">
                  <DynamicCodeBlock lang="tsx" code={componentCode} />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent
            value="schema"
            className="min-h-0 flex-1 overflow-hidden"
          >
            <ScrollArea className="h-full px-4 py-2">
              <div className="space-y-3 p-1">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <IconPlaceholder
                      hugeicons="File02Icon"
                      lucide="File"
                      tabler="IconFile"
                      phosphor="File"
                      remixicon="RiFileCodeLine"
                      size={16}
                      strokeWidth={1.8}
                      className="text-muted-foreground"
                    />
                    BuzzForm schema
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pure schema JSON for copy/paste import and runtime form
                    generation.
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={downloadSchema}
                    >
                      <IconPlaceholder
                        hugeicons="Download01Icon"
                        lucide="Download"
                        tabler="IconDownload"
                        phosphor="DownloadSimple"
                        remixicon="RiDownload2Line"
                        size={16}
                        strokeWidth={2}
                      />
                      Download BuzzForm Schema
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(schemaJson, "Schema JSON")}
                    >
                      <IconPlaceholder
                        hugeicons="Copy01Icon"
                        lucide="Copy"
                        tabler="IconCopy"
                        phosphor="Copy"
                        remixicon="RiFileCopyLine"
                        size={16}
                        strokeWidth={2}
                      />
                      Copy JSON
                    </Button>
                  </div>
                </div>

                <div className="[&_figure]:my-0!">
                  <DynamicCodeBlock lang="json" code={schemaJson} />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
