"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { IconPlaceholder } from "@/components/icon-placeholder";

/**
 * Overlay shown on mobile devices to prompt users to use a desktop browser.
 */
export function MobileOverlay() {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-6 backdrop-blur-md lg:hidden">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-2xl shadow-black/20">
        <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 h-48 w-48 rounded-full bg-sky-500/15 blur-3xl" />

        <div className="relative space-y-4 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-background/70 shadow-sm">
            <IconPlaceholder
              lucide="Monitor"
              hugeicons="ComputerIcon"
              tabler="IconDeviceDesktop"
              phosphor="Monitor"
              remixicon="RiComputerLine"
              size={24}
              className="text-primary"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight">
              Best on Desktop
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              BuzzForm Builder requires a larger screen to provide the best
              editing experience. Please switch to a desktop or tablet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
