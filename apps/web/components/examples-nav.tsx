"use client";

import React, { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { exampleCategories } from "@/lib/examples";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { siteConfig } from "@/lib/constants";
/**
 * Client-side Sidebar Navigation for Examples with collapsible categories.
 */
export function ExamplesNav() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/"
              className="flex items-center gap-2 px-2 py-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-primary-foreground">
                <Image
                  src={siteConfig.logo}
                  alt={siteConfig.name}
                  width={24}
                  height={24}
                  className="invert dark:invert-0"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {siteConfig.name}
                </span>
                <span className="truncate text-xs">Gallery</span>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Examples</SidebarGroupLabel>
          <SidebarMenu>
            {exampleCategories.map((category) => (
              <NavCategory
                key={category.category}
                category={category}
                pathname={pathname}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

function NavCategory({
  category,
  pathname,
}: {
  category: (typeof exampleCategories)[0];
  pathname: string;
}) {
  const icon = category.icon;
  const router = useRouter();

  // Check if any item in this category is active
  const isActive = category.items.some(
    (item) => pathname === `/examples/${item.slug}`
  );

  const [isOpen, setIsOpen] = useState(isActive);
  const [prevIsActive, setPrevIsActive] = useState(isActive);

  // Sync open state when navigation makes this category active
  if (isActive !== prevIsActive) {
    setPrevIsActive(isActive);
    if (isActive) {
      setIsOpen(true);
    }
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={
            <SidebarMenuButton tooltip={category.category}>
              <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4" />
              <span>{category.category}</span>
              <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          }
        />
        <CollapsibleContent>
          <SidebarMenuSub>
            {category.items.map((item) => {
              const isItemActive = pathname === `/examples/${item.slug}`;

              return (
                <SidebarMenuSubItem key={item.slug}>
                  <SidebarMenuSubButton
                    isActive={isItemActive}
                    onClick={() => router.push(`/examples/${item.slug}`)}
                  >
                    <span>{item.name}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
