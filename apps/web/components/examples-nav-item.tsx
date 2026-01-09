"use client";

import { usePathname, useRouter } from "next/navigation";
import { SidebarMenuButton } from "@/components/ui/sidebar";

interface NavItemProps {
  slug: string;
  name: string;
}

/**
 * Client component for individual nav items.
 * Only this small piece needs to be client-side for:
 * 1. Active state detection (usePathname)
 * 2. Click navigation (useRouter)
 */
export function NavItem({ slug, name }: NavItemProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === `/examples/${slug}`;

  return (
    <SidebarMenuButton
      isActive={isActive}
      onClick={() => router.push(`/examples/${slug}`)}
    >
      <span>{name}</span>
    </SidebarMenuButton>
  );
}
