"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  BuilderDndProvider,
  BuilderCanvas as HeadlessCanvas,
  useBuilderStore,
  DefaultBuilderProvider,
  BuilderFormProvider,
} from "@buildnbuzz/form-builder-react";
import { DEFAULT_FIELD_REGISTRY } from "@buildnbuzz/form-builder-core";
import { FieldSidebar } from "./field-sidebar";
import { NodeWrapper } from "./node-wrapper";
import { PropertyPanel } from "./property-panel";
import { DragOverlayItem } from "./drag-overlay";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CanvasToolbar } from "./canvas/canvas-toolbar";
import { toast } from "sonner";
import { IconPlaceholder } from "@/components/icon-placeholder";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

// Inline SubmitToastContent
function SubmitToastContent({ data }: { data: Record<string, unknown> }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mt-2 w-full">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="absolute right-2 top-2 h-7 w-7"
        title="Copy JSON"
      >
        {copied ? (
          <IconPlaceholder
            lucide="Check"
            hugeicons="Tick01Icon"
            tabler="IconCheck"
            phosphor="Check"
            remixicon="RiCheckLine"
            size={14}
            className="text-primary"
          />
        ) : (
          <IconPlaceholder
            lucide="Copy"
            hugeicons="Copy01Icon"
            tabler="IconCopy"
            phosphor="Copy"
            remixicon="RiFileCopyLine"
            size={14}
          />
        )}
      </Button>
      <pre className="max-h-75 overflow-auto rounded-md bg-muted p-3 pt-6 text-xs text-muted-foreground sm:p-3 sm:pr-10 sm:pt-3">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  );
}

const EmptyCanvas = () => {
  return (
    <Empty className="relative z-10 h-full border-0 bg-transparent min-h-60 pointer-events-none select-none">
      <EmptyMedia>
        <IconPlaceholder
          lucide="MousePointerClick"
          hugeicons="DragDropIcon"
          tabler="IconHandClick"
          phosphor="HandArrowUp"
          remixicon="RiDragDropLine"
          size={24}
        />
      </EmptyMedia>
      <EmptyContent className="max-w-[70%]">
        <EmptyTitle className="text-sm font-medium">Empty Canvas</EmptyTitle>
        <EmptyDescription className="text-xs">
          Drag components from the left sidebar to start building your form.
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
};

interface WindowFrameProps {
  children: React.ReactNode;
  className?: string;
}

export function WindowFrame({ children, className }: WindowFrameProps) {
  const viewport = useBuilderStore((state) => state.viewport);
  const zoom = useBuilderStore((state) => state.zoom);
  const mode = useBuilderStore((state) => state.mode);

  const getViewportWidth = () => {
    switch (viewport) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      default:
        return "100%";
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-2xl h-160 bg-background border border-border rounded-xl shadow-[0_0_60px_-5px_hsl(var(--primary)/0.4)] flex flex-col relative transition-all duration-300 ease-in-out origin-top overflow-hidden",
        className,
      )}
      style={{
        transform: `scale(${zoom})`,
        width: getViewportWidth(),
        maxWidth: viewport === "desktop" ? "896px" : "none",
      }}
    >
      <div className="h-10 bg-muted/50 border-b flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-1.5 w-20">
          <div className="w-3 h-3 rounded-full bg-destructive/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="text-xs text-muted-foreground font-medium flex-1 text-center">
          {mode === "preview" ? "Preview Mode" : "Edit Mode"}
        </div>
        <div className="w-20" />
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1 overflow-hidden">{children}</ScrollArea>
    </div>
  );
}

/**
 * Centered frame for the canvas to simulate different viewports.
 */
const CanvasFrame = () => {
  const rootIds = useBuilderStore((s) => s.rootIds);
  const mode = useBuilderStore((s) => s.mode);
  const selectNode = useBuilderStore((s) => s.selectNode);

  const isPreviewMode = mode === "preview";

  const { setNodeRef } = useDroppable({
    id: "root",
    disabled: isPreviewMode,
  });

  const handleBackgroundClick = () => {
    if (!isPreviewMode) {
      selectNode(null);
    }
  };

  return (
    <div
      className="p-8 pt-10 flex justify-center items-start min-h-full"
      onClick={handleBackgroundClick}
    >
      <WindowFrame>
        <div
          ref={isPreviewMode ? undefined : setNodeRef}
          className="p-8 max-w-2xl mx-auto min-h-full relative"
          data-id="root"
        >
          {rootIds.length === 0 ? (
            <EmptyCanvas />
          ) : isPreviewMode ? (
            <div className="p-4 border rounded-md bg-muted/50 text-center text-sm text-muted-foreground">
              PreviewForm is stubbed in Phase 3.5. Will be implemented in Phase
              6.
            </div>
          ) : (
            <div className="min-h-120 relative">
              <SortableContext
                items={rootIds}
                strategy={verticalListSortingStrategy}
              >
                <HeadlessCanvas
                  nodeRenderer={({ node, content }) => (
                    <NodeWrapper node={node}>{content}</NodeWrapper>
                  )}
                />
              </SortableContext>
            </div>
          )}
        </div>
      </WindowFrame>
    </div>
  );
};

/**
 * Main Form Builder component that orchestrates the entire UI.
 */
export const FormBuilder = () => {
  return (
    <DefaultBuilderProvider registry={DEFAULT_FIELD_REGISTRY}>
      <FormBuilderContent />
    </DefaultBuilderProvider>
  );
};

/**
 * Inner component that uses builder hooks.
 */
const FormBuilderContent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const zoom = useBuilderStore((state) => state.zoom);
  const setZoom = useBuilderStore((state) => state.setZoom);
  const mode = useBuilderStore((s) => s.mode);

  const onSubmit = async (data: Record<string, unknown>) => {
    await new Promise((r) => setTimeout(r, 500));
    toast("Form Submitted!", {
      description: <SubmitToastContent data={data} />,
      duration: 10000,
    });
  };

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

  return (
    <BuilderDndProvider
      renderOverlay={({ activeId, activeData }) => (
        <DragOverlayItem activeId={activeId} activeData={activeData} />
      )}
    >
      <BuilderFormProvider mode={mode} onSubmit={onSubmit}>
        <div className="flex flex-col h-screen w-full bg-muted/30 overflow-hidden text-foreground">
          {/* Top Header */}
          <header className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0 z-10">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg">
                <IconPlaceholder
                  lucide="Play"
                  hugeicons="PlayIcon"
                  tabler="IconPlayerPlay"
                  phosphor="Play"
                  remixicon="RiPlayFill"
                  size={20}
                  className="fill-current"
                />
              </div>
              <div>
                <h1 className="text-sm font-bold leading-tight">
                  BuzzForm Builder
                </h1>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  v0.1 Premium
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-2">
                <IconPlaceholder
                  lucide="Save"
                  hugeicons="FloppyDiskIcon"
                  tabler="IconDeviceFloppy"
                  phosphor="FloppyDisk"
                  remixicon="RiSaveLine"
                  size={14}
                />
                Save
              </Button>
              <Button size="sm" className="h-8 text-xs shadow-md">
                Publish
              </Button>
            </div>
          </header>

          {/* Main Layout */}
          <SidebarProvider className="flex-1 overflow-hidden min-h-0 min-w-0">
            <div className="flex h-full w-full">
              {/* Left Sidebar: Components */}
              <FieldSidebar />

              {/* Central Canvas */}
              <main className="flex-1 flex flex-col relative overflow-hidden bg-muted/20 min-w-0">
                <CanvasToolbar />
                <div ref={containerRef} className="flex-1 min-h-0">
                  <ScrollArea className="h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] bg-size-[20px_20px]">
                    <CanvasFrame />
                  </ScrollArea>
                </div>
              </main>

              {/* Right Sidebar: Properties */}
              <aside className="w-80 border-l bg-background flex flex-col shrink-0 overflow-y-auto">
                <PropertyPanel />
              </aside>
            </div>
          </SidebarProvider>
        </div>
      </BuilderFormProvider>
    </BuilderDndProvider>
  );
};
