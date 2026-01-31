"use client";

import { useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useBuilderStore } from "../lib/store";
import { Container } from "./container";
import { BuilderFormProvider, type BuilderMode } from "./builder-form-context";
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
import { DragDropIcon } from "@hugeicons/core-free-icons";

interface CanvasProps {
  mode?: BuilderMode;
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
}

export function Canvas({ mode = "edit", onSubmit }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootIds = useBuilderStore((s) => s.rootIds);
  const selectNode = useBuilderStore((s) => s.selectNode);
  const zoom = useBuilderStore((state) => state.zoom);
  const setZoom = useBuilderStore((state) => state.setZoom);

  const { setNodeRef } = useDroppable({ id: "root" });

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
    selectNode(null);
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
                  ref={setNodeRef}
                  data-id="root"
                  className="p-8 max-w-2xl mx-auto min-h-full"
                >
                  {rootIds.length === 0 ? (
                    <Empty className="h-full border-0 bg-transparent min-h-60">
                      <EmptyMedia>
                        <HugeiconsIcon icon={DragDropIcon} size={24} />
                      </EmptyMedia>
                      <EmptyContent className="max-w-70">
                        <EmptyTitle className="text-sm font-medium">
                          Form is empty
                        </EmptyTitle>
                        <EmptyDescription className="text-xs">
                          Drag fields from the sidebar and drop them here to
                          start building your form.
                        </EmptyDescription>
                      </EmptyContent>
                    </Empty>
                  ) : (
                    <Container childrenIds={rootIds} />
                  )}
                </div>
              </WindowFrame>
            </div>
          </ScrollArea>
        </div>
      </main>
    </BuilderFormProvider>
  );
}
