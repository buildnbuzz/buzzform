"use client";

import { useBuilderStore } from "../../lib/store";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
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
          <HugeiconsIcon
            icon={Loading03Icon}
            size={14}
            className="animate-spin"
          />
          <span>Saving...</span>
        </>
      ) : lastSavedAt ? (
        <>
          <HugeiconsIcon
            icon={CheckmarkCircle01Icon}
            size={14}
            className="text-emerald-500"
          />
          <span>Last saved at {formatTime(lastSavedAt)}</span>
        </>
      ) : null}
    </div>
  );
}
