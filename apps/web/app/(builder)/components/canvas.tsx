"use client";

import { useRef, useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useBuilderStore } from "../lib/store";
import { useBuilderKeyboardShortcuts } from "../lib/use-keyboard-shortcuts";
import { Container } from "./container";
import { BuilderFormProvider } from "./builder-form-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WindowFrame } from "./canvas/window-frame";
import { CanvasToolbar } from "./canvas/canvas-toolbar";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DragDropIcon,
  Copy01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { PreviewForm } from "./preview/preview-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function Canvas() {
  useBuilderKeyboardShortcuts();
  const onSubmit = async (data: Record<string, unknown>) => {
    await new Promise((r) => setTimeout(r, 500));
    toast("Form Submitted!", {
      description: <SubmitToastContent data={data} />,
      duration: 10000,
    });
  };

  const mode = useBuilderStore((s) => s.mode);
  const isPreviewMode = mode === "preview";
  const containerRef = useRef<HTMLDivElement>(null);
  const rootIds = useBuilderStore((s) => s.rootIds);
  const selectNode = useBuilderStore((s) => s.selectNode);
  const zoom = useBuilderStore((state) => state.zoom);
  const setZoom = useBuilderStore((state) => state.setZoom);

  // Only use droppable in edit mode
  const { setNodeRef } = useDroppable({
    id: "root",
    data: { parentId: null, parentSlot: null },
    disabled: isPreviewMode,
  });

  // Handle Ctrl+Wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.002;
        const nextZoom = Math.round((zoom + delta) * 100) / 100;
        // Clamp zoom between 0.25 and 2
        const clampedZoom = Math.max(0.25, Math.min(2, nextZoom));
        setZoom(clampedZoom);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [zoom, setZoom]);

  const handleBackgroundClick = () => {
    if (!isPreviewMode) {
      selectNode(null);
    }
  };

  // Render form content based on mode
  const renderFormContent = () => {
    if (rootIds.length === 0) {
      return <EmptyCanvas />;
    }

    // Preview mode: Pure BuzzForm rendering
    if (isPreviewMode) {
      return <PreviewForm />;
    }

    // Edit mode: Builder with DnD support
    return <Container childrenIds={rootIds} />;
  };

  return (
    <BuilderFormProvider mode={mode} onSubmit={onSubmit}>
      <main className="flex-1 flex flex-col bg-muted/20 relative min-w-0">
        <CanvasToolbar />

        <div ref={containerRef} className="flex-1 min-h-0">
          <ScrollArea className="h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] bg-size-[20px_20px]">
            <div
              className="p-8 pt-10 flex justify-center items-start min-h-full"
              onClick={handleBackgroundClick}
            >
              <WindowFrame>
                <div
                  ref={isPreviewMode ? undefined : setNodeRef}
                  data-id="root"
                  className="p-8 max-w-2xl mx-auto min-h-full"
                >
                  {renderFormContent()}
                </div>
              </WindowFrame>
            </div>
          </ScrollArea>
        </div>
      </main>
    </BuilderFormProvider>
  );
}

const EmptyCanvas = () => {
  return (
    <Empty className="h-full border-0 bg-transparent min-h-60">
      <EmptyMedia>
        <HugeiconsIcon icon={DragDropIcon} size={24} />
      </EmptyMedia>
      <EmptyContent className="max-w-70">
        <EmptyTitle className="text-sm font-medium">Form is empty</EmptyTitle>
        <EmptyDescription className="text-xs">
          Drag fields from the sidebar and drop them here to start building your
          form.
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
};

function SubmitToastContent({ data }: { data: Record<string, unknown> }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mt-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="absolute right-2 top-2 h-7 w-7"
        title="Copy JSON"
      >
        {copied ? (
          <HugeiconsIcon icon={Tick01Icon} size={14} className="text-primary" />
        ) : (
          <HugeiconsIcon icon={Copy01Icon} size={14} />
        )}
      </Button>
      <pre className="max-h-72 overflow-auto rounded-md bg-muted p-3 pt-6 text-xs text-muted-foreground sm:p-3 sm:pr-10 sm:pt-3">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  );
}
