"use client";

import { useBuilderStore } from "@buildnbuzz/form-builder-react";
import { IconPlaceholder } from "@/components/icon-placeholder";
import { cn } from "@/lib/utils";

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SaveIndicator() {
  const saveStatus = useBuilderStore((state) => state.saveStatus);
  const lastSavedAt = useBuilderStore((state) => state.lastSavedAt);
  const hasContent = useBuilderStore((state) => state.rootIds.length > 0);

  if (!hasContent) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs text-muted-foreground transition-opacity duration-200",
        saveStatus === "idle" && !lastSavedAt && "opacity-0",
      )}
    >
      {saveStatus === "saving" ? (
        <>
          <IconPlaceholder
            hugeicons="Loading03Icon"
            lucide="Loader2"
            tabler="IconLoader2"
            phosphor="CircleNotch"
            remixicon="RiLoader2Line"
            size={14}
            className="animate-spin"
          />
          <span>Saving...</span>
        </>
      ) : lastSavedAt ? (
        <>
          <IconPlaceholder
            hugeicons="CheckmarkCircle01Icon"
            lucide="CheckCircle2"
            tabler="IconCircleCheck"
            phosphor="CheckCircle"
            remixicon="RiCheckboxCircleLine"
            size={14}
            className="text-emerald-500"
          />
          <span>Last saved at {formatTime(lastSavedAt)}</span>
        </>
      ) : null}
    </div>
  );
}
