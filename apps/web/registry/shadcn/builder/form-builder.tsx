"use client";

import React from "react";
import {
  BuilderDndProvider,
  BuilderCanvas as HeadlessCanvas,
  useBuilderStore,
  useUndoRedo,
  DefaultBuilderProvider,
} from "@buildnbuzz/form-builder-react";
import { DEFAULT_FIELD_REGISTRY } from "@buildnbuzz/form-builder-core";
import { FieldSidebar } from "./field-sidebar";
import { NodeWrapper } from "./node-wrapper";
import { PropertyPanel } from "./property-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  ComputerIcon,
  SmartPhone01Icon,
  TabletIcon,
  PlayIcon,
  FloppyDiskIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

/**
 * Main Form Builder component that orchestrates the entire UI.
 */
export const FormBuilder = () => {
  return (
    <DefaultBuilderProvider registry={DEFAULT_FIELD_REGISTRY}>
      <BuilderDndProvider>
        <div className="flex flex-col h-screen w-full bg-muted/30 overflow-hidden text-foreground">
          {/* Top Header */}
          <header className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0 z-10">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg">
                <HugeiconsIcon
                  icon={PlayIcon}
                  className="size-5 fill-current"
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

            <BuilderToolbar />

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-2">
                <HugeiconsIcon icon={FloppyDiskIcon} className="size-3.5" />
                Save
              </Button>
              <Button size="sm" className="h-8 text-xs shadow-md">
                Publish
              </Button>
            </div>
          </header>

          {/* Main Layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar: Components */}
            <aside className="w-72 border-r bg-background flex flex-col shrink-0">
              <FieldSidebar />
            </aside>

            {/* Central Canvas */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
              <ScrollArea className="flex-1 min-h-0">
                <div className="min-h-full p-8 flex justify-center bg-muted/10">
                  <CanvasFrame />
                </div>
              </ScrollArea>
            </main>

            {/* Right Sidebar: Properties */}
            <aside className="w-80 border-l bg-background flex flex-col shrink-0">
              <PropertyPanel />
            </aside>
          </div>
        </div>
      </BuilderDndProvider>
    </DefaultBuilderProvider>
  );
};

/**
 * Centered frame for the canvas to simulate different viewports.
 */
const CanvasFrame = () => {
  const viewport = useBuilderStore((s) => s.viewport);
  const zoom = useBuilderStore((s) => s.zoom);
  const rootIds = useBuilderStore((s) => s.rootIds);

  const width =
    viewport === "mobile" ? "375px" : viewport === "tablet" ? "768px" : "100%";

  return (
    <div
      className={cn(
        "bg-background shadow-2xl rounded-xl border transition-all duration-300 origin-top flex flex-col relative",
        viewport !== "desktop" && "h-203",
      )}
      style={{
        width,
        transform: `scale(${zoom})`,
      }}
    >
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="min-h-125">
          <HeadlessCanvas
            nodeRenderer={({ node, content }) => (
              <NodeWrapper node={node}>{content}</NodeWrapper>
            )}
          />
        </div>

        {rootIds.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40 select-none">
            <div className="size-16 rounded-full border-2 border-dashed flex items-center justify-center mb-4">
              <HugeiconsIcon icon={PlayIcon} className="size-8 rotate-90" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-tight">
              Empty Canvas
            </h3>
            <p className="text-xs text-center px-12 mt-1">
              Drag components from the left sidebar to start building your form.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Shared toolbar for zoom, viewport, and undo/redo.
 */
const BuilderToolbar = () => {
  const viewport = useBuilderStore((s) => s.viewport);
  const setViewport = useBuilderStore((s) => s.setViewport);
  const zoom = useBuilderStore((s) => s.zoom);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const selectNode = useBuilderStore((s) => s.selectNode);

  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  return (
    <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border">
      <div className="flex items-center border-r pr-1 mr-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={!canUndo}
          onClick={() => undo()}
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={!canRedo}
          onClick={() => redo()}
        >
          <HugeiconsIcon icon={ArrowRight02Icon} className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-0.5 border-r pr-1 mr-1">
        <Button
          variant={viewport === "desktop" ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => setViewport("desktop")}
        >
          <HugeiconsIcon icon={ComputerIcon} className="size-4" />
        </Button>
        <Button
          variant={viewport === "tablet" ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => setViewport("tablet")}
        >
          <HugeiconsIcon icon={TabletIcon} className="size-4" />
        </Button>
        <Button
          variant={viewport === "mobile" ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => setViewport("mobile")}
        >
          <HugeiconsIcon icon={SmartPhone01Icon} className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 px-2">
        <span className="text-[10px] font-mono text-muted-foreground w-8 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Separator orientation="vertical" className="h-3" />
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[10px] px-1.5"
          onClick={() => selectNode(null)}
          disabled={!selectedId}
        >
          Deselect
        </Button>
      </div>
    </div>
  );
};
