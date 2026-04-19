import type { FieldType } from "@buildnbuzz/form-core";
import { isContainerType } from "@buildnbuzz/form-core";
import type {
  BuilderFieldRegistry,
  BuilderFieldRegistryItem,
  SidebarItem,
} from "./types";

/**
 * Safely retrieves a registry entry for a specific field type.
 */
export function getRegistryEntry(
  registry: BuilderFieldRegistry,
  type: FieldType,
): BuilderFieldRegistryItem | undefined {
  return registry[type];
}

/** Grouped sidebar item data. */
export type SidebarGroups = Record<string, SidebarItem[]>;

/**
 * Groups registry entries by their sidebar category for the field palette.
 */
export function getSidebarGroups(
  registry: BuilderFieldRegistry,
): SidebarGroups {
  const groups: Record<string, SidebarItem[]> = {};

  // Iterate over all keys in the registry
  for (const type of Object.keys(registry) as FieldType[]) {
    const entry = registry[type];
    if (!entry?.sidebar) continue;

    const { category, label, icon, disabled } = entry.sidebar;

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push({
      type,
      label,
      icon,
      disabled,
    });
  }

  return groups;
}

/**
 * Checks if a field type is a container in the context of the current registry.
 * 
 * Falls back to form-core's default container list if no specific override is present.
 */
export function isContainer(registry: BuilderFieldRegistry, type: FieldType): boolean {
  const entry = registry[type];
  if (entry) {
    return entry.kind === "layout" || isContainerType(type);
  }
  return isContainerType(type);
}
