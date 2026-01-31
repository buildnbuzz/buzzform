import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "../../lib/store";
import { Viewport } from "../../lib/types";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  MinusSignIcon,
  Add01Icon,
  ArrowTurnBackwardIcon,
  ComputerIcon,
  Tablet01Icon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons";

interface ViewportOption {
  id: Viewport;
  icon: IconSvgElement;
  label: string;
}

export function CanvasToolbar() {
  const viewport = useBuilderStore((state) => state.viewport);
  const setViewport = useBuilderStore((state) => state.setViewport);
  const zoom = useBuilderStore((state) => state.zoom);
  const setZoom = useBuilderStore((state) => state.setZoom);

  const viewports: ViewportOption[] = [
    { id: "desktop", icon: ComputerIcon, label: "Desktop (100%)" },
    { id: "tablet", icon: Tablet01Icon, label: "Tablet (768px)" },
    { id: "mobile", icon: SmartPhone01Icon, label: "Mobile (375px)" },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1.5 rounded-full border border-border/50 bg-card/80 backdrop-blur-xl shadow-xl shadow-black/5 supports-backdrop-filter:bg-card/40">
      <TooltipProvider delay={0}>
        {/* Viewport Toggles */}
        <div className="flex items-center gap-0.5">
          {viewports.map((item) => {
            const isActive = viewport === item.id;
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger
                  render={
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewport(item.id)}
                      className={cn(
                        "h-8 w-8 rounded-full",
                        !isActive &&
                          "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      )}
                    >
                      <HugeiconsIcon icon={item.icon} size={16} />
                    </Button>
                  }
                ></TooltipTrigger>
                <TooltipContent side="top" sideOffset={8}>
                  <p className="text-xs font-medium">{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
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
                  <HugeiconsIcon icon={MinusSignIcon} size={16} />
                </Button>
              }
            ></TooltipTrigger>
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
                  <HugeiconsIcon icon={Add01Icon} size={16} />
                </Button>
              }
            ></TooltipTrigger>
            <TooltipContent side="top" sideOffset={8}>
              Zoom In
            </TooltipContent>
          </Tooltip>

          {/* Reset Zoom Button */}
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
                  <HugeiconsIcon icon={ArrowTurnBackwardIcon} size={16} />
                </Button>
              }
            ></TooltipTrigger>
            <TooltipContent side="top" sideOffset={8}>
              Reset Zoom
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
