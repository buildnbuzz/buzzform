"use client";

import Image from "next/image";
import Link from "next/link";
import { CodeExportDialog } from "./code-export-dialog";
import { ThemeToggle } from "@/components/theme-toggle";

import { SaveIndicator } from "./header/save-indicator";
import { NewFormButton } from "./header/new-form-button";
import { FormName } from "./header/form-name";

export function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-header w-full items-center gap-2 px-4 text-foreground">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg invert dark:invert-0">
            <Link href="/">
              <Image src="/bb-icon.svg" alt="Logo" width={24} height={24} />
              <span className="sr-only">Buildnbuzz</span>
            </Link>
          </div>
          <FormName />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <SaveIndicator />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <CodeExportDialog />
            <NewFormButton />
          </div>
        </div>
      </div>
    </header>
  );
}
