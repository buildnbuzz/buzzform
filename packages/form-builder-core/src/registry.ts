import type { FieldRegistry, FieldRegistrySidebar } from "./types";

/**
 * A simplified version of a registry entry for sidebar display.
 */
export interface SidebarItem<TIcon = unknown> extends FieldRegistrySidebar<TIcon> {
  type: string;
}

/**
 * Groups registry items by their category for display in the builder sidebar.
 * 
 * @param registry - The field registry to group.
 * @returns A record of categorized sidebar items.
 */
export function getSidebarGroups<TIcon, TRenderer>(
  registry: FieldRegistry<TIcon, TRenderer>,
): Record<string, SidebarItem<TIcon>[]> {
  const groups: Record<string, SidebarItem<TIcon>[]> = {};

  for (const [type, entry] of Object.entries(registry)) {
    if (!entry) continue;
    
    const { category } = entry.sidebar;
    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push({
      type,
      ...entry.sidebar,
    });
  }

  return groups;
}
