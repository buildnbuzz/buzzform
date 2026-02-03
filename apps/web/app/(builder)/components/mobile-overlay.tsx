"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { HugeiconsIcon } from "@hugeicons/react";
import { ComputerIcon } from "@hugeicons/core-free-icons";

export function MobileOverlay() {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur-md">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-2xl shadow-black/20">
        <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 h-48 w-48 rounded-full bg-sky-500/15 blur-3xl" />

        <div className="relative space-y-3 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-background/70">
            <HugeiconsIcon icon={ComputerIcon} size={22} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Best on desktop
          </h1>
          <p className="text-sm text-muted-foreground">
            Open this page on a larger screen to keep building.
          </p>
        </div>
      </div>
    </div>
  );
}
