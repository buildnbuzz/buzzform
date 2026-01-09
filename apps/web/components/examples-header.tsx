"use client";

import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon } from "@hugeicons/core-free-icons";
import { siteConfig } from "@/lib/constants";

/**
 * Header component for the Examples layout.
 * Includes sidebar trigger, title, GitHub link, and theme toggle.
 */
export function ExamplesHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-sm font-medium">Gallery</h1>
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          render={
            <Link href={siteConfig.github} target="_blank" rel="noreferrer">
              <HugeiconsIcon icon={GithubIcon} className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          }
        />
        <ThemeToggle />
      </div>
    </header>
  );
}
