"use client";

import { ReactNode } from "react";
import { getSidebarGroups, type SidebarGroups } from "../registry";
import { useBuilderContext } from "../context/BuilderContext";

export interface BuilderSidebarProps {
  /** 
   * Render prop that receives the grouped sidebar items.
   * Items are grouped by the 'category' defined in the registry.
   */
  render: (props: { groups: SidebarGroups }) => ReactNode;
}

/**
 * Headless component that provides grouped field metadata for the sidebar palette.
 */
export const BuilderSidebar = ({ render }: BuilderSidebarProps) => {
  const { registry } = useBuilderContext();
  const groups = getSidebarGroups(registry);
  return <>{render({ groups })}</>;
};
