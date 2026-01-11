"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig, navLinks } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HugeiconsIcon } from "@hugeicons/react";
import { SidebarLeftIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden">
            <HugeiconsIcon icon={SidebarLeftIcon} className="size-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        }
      />
      <SheetContent side="right" className="pr-0 pl-0">
        <SheetHeader className="px-6 border-b">
          <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setOpen(false)}
          >
            <Image
              src={siteConfig.logo}
              alt={siteConfig.name}
              width={24}
              height={24}
              className="mr-2 invert dark:invert-0"
            />
            <span className="font-bold">{siteConfig.name}</span>
          </Link>
        </SheetHeader>
        <div className="flex flex-col gap-1 px-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block px-2 py-1.5 text-sm transition-colors hover:bg-muted/50 hover:text-foreground rounded-md text-muted-foreground",
                pathname === link.href &&
                  "bg-accent text-accent-foreground font-medium"
              )}
              onClick={() => setOpen(false)}
              {...(link.external
                ? { target: "_blank", rel: "noreferrer" }
                : {})}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
