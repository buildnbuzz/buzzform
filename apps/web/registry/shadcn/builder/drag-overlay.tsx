"use client";

import {
  useBuilderStore,
  useBuilderContext,
} from "@buildnbuzz/form-builder-react";
import { IconPlaceholder } from "@/components/icon-placeholder";
import { cn } from "@/lib/utils";

/**
 * Rich drag overlay item that provides visual feedback during DnD.
 * Matches legacy DragOverlayItem but integrates with the new registry pattern.
 */
export function DragOverlayItem({
  activeId,
  activeData,
}: {
  activeId: string;
  activeData: Record<string, unknown>;
}) {
  const { registry } = useBuilderContext();
  const node = useBuilderStore((s) => s.nodes[activeId]);

  const data = activeData as Record<string, unknown>;
  const isFromSidebar = data?.from === "sidebar";
  const type = (isFromSidebar ? data?.type : node?.field?.type) as
    | string
    | undefined;
  const entry = type ? registry[type] : null;

  const icon = entry?.sidebar?.icon;
  const label =
    entry?.sidebar?.label ?? (typeof type === "string" ? type : "Field");

  // Get field name for existing fields
  let fieldName: string | undefined;
  if (!isFromSidebar && node && "name" in node.field) {
    fieldName = node.field.name;
  }

  return (
    <div
      className={cn(
        "bg-card/95 backdrop-blur-md border-2 shadow-2xl rounded-xl p-3 min-w-[20rem] cursor-grabbing",
        "animate-in fade-in-0 zoom-in-95 duration-150",
        isFromSidebar
          ? "border-primary/50 shadow-primary/10"
          : "border-border shadow-black/10",
      )}
    >
      <div className="flex items-center gap-3">
        {/* Icon container */}
        <div
          className={cn(
            "p-2.5 rounded-lg flex items-center justify-center",
            isFromSidebar
              ? "bg-primary/15 text-primary"
              : "bg-muted text-foreground",
          )}
        >
          {icon ? (
            <IconPlaceholder {...icon} size={20} />
          ) : (
            <IconPlaceholder lucide="Type" hugeicons="PencilEdit01Icon" size={20} />
          )}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0 text-left">
          <div className="text-sm font-semibold text-foreground truncate">
            {isFromSidebar ? `New ${label}` : (fieldName ?? label)}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 whitespace-nowrap">
            <IconPlaceholder
              lucide={isFromSidebar ? "Plus" : "Move"}
              hugeicons={isFromSidebar ? "Add01Icon" : "Move01Icon"}
              tabler={isFromSidebar ? "IconPlus" : "IconArrowsMove"}
              phosphor={isFromSidebar ? "Plus" : "ArrowsOutCardinal"}
              remixicon={isFromSidebar ? "RiAddLine" : "RiDragMove2Line"}
              size={12}
            />
            <div className="flex items-center gap-1">
              {isFromSidebar ? (
                <>
                  Adding new, press
                  <kbd className="inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground/80">
                    Esc
                  </kbd>
                  to cancel
                </>
              ) : (
                "Moving field"
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
