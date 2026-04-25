"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useBuilderStore, useUndoRedo } from "@buildnbuzz/form-builder-react";
import { IconPlaceholder } from "@/components/icon-placeholder";

/**
 * Floating canvas toolbar at bottom-center of the canvas area.
 * Provides undo/redo, mode toggle, viewport switching, and zoom controls.
 */
export function CanvasToolbar() {
  const viewport = useBuilderStore((state) => state.viewport);
  const setViewport = useBuilderStore((state) => state.setViewport);
  const zoom = useBuilderStore((state) => state.zoom);
  const setZoom = useBuilderStore((state) => state.setZoom);
  const mode = useBuilderStore((state) => state.mode);
  const setMode = useBuilderStore((state) => state.setMode);
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  const isPreview = mode === "preview";

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1.5 rounded-full border border-border/50 bg-card/80 backdrop-blur-xl shadow-xl shadow-black/5 supports-backdrop-filter:bg-card/40">
      <TooltipProvider delay={0}>
        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => undo()}
                  disabled={!canUndo}
                  className={cn(
                    "h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    !canUndo && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <IconPlaceholder
                    lucide="Undo"
                    hugeicons="UndoIcon"
                    tabler="IconArrowBackUp"
                    phosphor="ArrowCounterClockwise"
                    remixicon="RiArrowGoBackLine"
                    size={16}
                  />
                </Button>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              <p className="text-xs font-medium">Undo</p>
              <p className="text-[10px] text-muted-foreground">Ctrl+Z</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => redo()}
                  disabled={!canRedo}
                  className={cn(
                    "h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    !canRedo && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <IconPlaceholder
                    lucide="Redo"
                    hugeicons="RedoIcon"
                    tabler="IconArrowForwardUp"
                    phosphor="ArrowClockwise"
                    remixicon="RiArrowGoForwardLine"
                    size={16}
                  />
                </Button>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              <p className="text-xs font-medium">Redo</p>
              <p className="text-[10px] text-muted-foreground">Ctrl+Shift+Z</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="mx-1.5 h-6 w-px bg-border/50" />

        {/* Mode Toggle */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant={isPreview ? "default" : "ghost"}
                size="icon"
                onClick={() => setMode(isPreview ? "edit" : "preview")}
                className={cn(
                  "h-8 w-8 rounded-full",
                  !isPreview &&
                    "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                {isPreview ? (
                  <IconPlaceholder
                    lucide="Pencil"
                    hugeicons="PencilEdit01Icon"
                    tabler="IconPencil"
                    phosphor="Pencil"
                    remixicon="RiPencilLine"
                    size={16}
                  />
                ) : (
                  <IconPlaceholder
                    lucide="Eye"
                    hugeicons="ViewIcon"
                    tabler="IconEye"
                    phosphor="Eye"
                    remixicon="RiEyeLine"
                    size={16}
                  />
                )}
              </Button>
            }
          />
          <TooltipContent side="top" sideOffset={8}>
            <p className="text-xs font-medium">
              {isPreview ? "Back to Edit Mode" : "Preview Form"}
            </p>
          </TooltipContent>
        </Tooltip>

        <div className="mx-1.5 h-6 w-px bg-border/50" />

        {/* Viewport Toggles */}
        <div className="flex items-center gap-0.5">
          {/* Desktop */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant={viewport === "desktop" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewport("desktop")}
                  className={cn(
                    "h-8 w-8 rounded-full",
                    viewport !== "desktop" &&
                      "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <IconPlaceholder
                    lucide="Monitor"
                    hugeicons="ComputerIcon"
                    tabler="IconDeviceDesktop"
                    phosphor="Monitor"
                    remixicon="RiComputerLine"
                    size={16}
                  />
                </Button>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              <p className="text-xs font-medium">Desktop (100%)</p>
            </TooltipContent>
          </Tooltip>

          {/* Tablet */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant={viewport === "tablet" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewport("tablet")}
                  className={cn(
                    "h-8 w-8 rounded-full",
                    viewport !== "tablet" &&
                      "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <IconPlaceholder
                    lucide="Tablet"
                    hugeicons="Tablet01Icon"
                    tabler="IconDeviceTablet"
                    phosphor="DeviceTabletIcon"
                    remixicon="RiTabletLine"
                    size={16}
                  />
                </Button>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              <p className="text-xs font-medium">Tablet (768px)</p>
            </TooltipContent>
          </Tooltip>

          {/* Mobile */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant={viewport === "mobile" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewport("mobile")}
                  className={cn(
                    "h-8 w-8 rounded-full",
                    viewport !== "mobile" &&
                      "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <IconPlaceholder
                    lucide="Smartphone"
                    hugeicons="SmartPhone01Icon"
                    tabler="IconDeviceMobile"
                    phosphor="DeviceMobile"
                    remixicon="RiSmartphoneLine"
                    size={16}
                  />
                </Button>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              <p className="text-xs font-medium">Mobile (375px)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="mx-1.5 h-6 w-px bg-border/50" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  onClick={() => setZoom(zoom - 0.1)}
                >
                  <IconPlaceholder
                    lucide="Minus"
                    hugeicons="MinusSignIcon"
                    tabler="IconMinus"
                    phosphor="Minus"
                    remixicon="RiSubtractLine"
                    size={16}
                  />
                </Button>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              Zoom Out
            </TooltipContent>
          </Tooltip>

          <div className="flex items-center justify-center min-w-12 px-1 text-xs font-semibold tabular-nums text-muted-foreground select-none">
            {Math.round(zoom * 100)}%
          </div>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  onClick={() => setZoom(zoom + 0.1)}
                >
                  <IconPlaceholder
                    lucide="Plus"
                    hugeicons="Add01Icon"
                    tabler="IconPlus"
                    phosphor="Plus"
                    remixicon="RiAddLine"
                    size={16}
                  />
                </Button>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              Zoom In
            </TooltipContent>
          </Tooltip>

          {/* Reset Zoom */}
          <div className="mx-1 h-4 w-px bg-border/50" />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={Math.round(zoom * 100) === 90}
                  className={cn(
                    "h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    Math.round(zoom * 100) === 90 &&
                      "opacity-50 cursor-not-allowed",
                  )}
                  onClick={() => setZoom(0.9)}
                >
                  <IconPlaceholder
                    lucide="RotateCcw"
                    hugeicons="ArrowTurnBackwardIcon"
                    tabler="IconRefresh"
                    phosphor="ArrowCounterClockwise"
                    remixicon="RiRefreshLine"
                    size={16}
                  />
                </Button>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              Reset Zoom
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
