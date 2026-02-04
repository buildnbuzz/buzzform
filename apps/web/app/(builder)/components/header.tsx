"use client";

import Image from "next/image";
import Link from "next/link";
import { CodeExportDialog } from "./code-export-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { useBuilderStore } from "../lib/store";

import { SaveIndicator } from "./header/save-indicator";
import { NewFormButton } from "./header/new-form-button";
import { FormName } from "./header/form-name";
import { CloudSaveDialog } from "./header/cloud-save-dialog";

export function SiteHeader() {
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
          <Separator
            orientation="vertical"
            className="h-5 data-[orientation=vertical]:self-center"
          />
          <FormName />
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
            <CodeExportDialog />
            <NewFormButton />
          </div>
        </div>
      </div>
    </header>
  );
}
