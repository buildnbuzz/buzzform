"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { useBuilderStore } from "@buildnbuzz/form-builder-react";

import { SaveIndicator } from "./save-indicator";
import { FormManagerDialog } from "./form-manager-dialog";
import { CloudSaveDialog } from "./cloud-save-dialog";
import { Button } from "@/components/ui/button";
import type { BuilderStorageProvider } from "@buildnbuzz/form-builder-core";

export function SiteHeader({
  storageProvider,
}: {
  storageProvider: BuilderStorageProvider | null;
}) {
  const hasContent = useBuilderStore((state) => state.rootIds.length > 0);

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-header w-full items-center gap-2 px-4 text-foreground">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/" className="flex items-center">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg invert dark:invert-0">
              <Image src="/bb-icon.svg" alt="Logo" width={24} height={24} />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              BuzzForm
            </span>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <SaveIndicator />
          {hasContent && (
            <Separator
              orientation="vertical"
              className="h-5 data-[orientation=vertical]:self-center"
            />
          )}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <CloudSaveDialog />
            <FormManagerDialog storageProvider={storageProvider} />
            <Button size="sm" className="h-8 text-xs shadow-md">
              Publish
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
