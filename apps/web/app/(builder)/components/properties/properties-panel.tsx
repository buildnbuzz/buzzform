"use client";

import { useBuilderStore } from "../../lib/store";
import { getRegistryEntry } from "../../lib/registry";
import { PropertiesForm } from "./properties-form";
import { GlobalSettingsForm } from "./global-settings-form";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Settings01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect } from "react";

export function PropertiesPanel() {
  const mode = useBuilderStore((state) => state.mode);
  const selectedId = useBuilderStore((state) => state.selectedId);
  const nodes = useBuilderStore((state) => state.nodes);
  const { setOpen } = useSidebar();

  useEffect(() => {
    setOpen(mode !== "preview");
  }, [mode, setOpen]);

  const selectedNode = selectedId ? nodes[selectedId] : null;
  const registryEntry = selectedNode
    ? getRegistryEntry(selectedNode.field.type)
    : null;
  const config = registryEntry?.properties;

  const label = registryEntry?.sidebar.label;

  return (
    <Sidebar side="right" className="pt-header" collapsible="offExamples">
      <SidebarHeader className="border-b h-header flex justify-center">
        {selectedNode && registryEntry ? (
          <div className="flex items-center gap-3 w-full">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-secondary/50">
              <HugeiconsIcon
                icon={registryEntry.sidebar.icon}
                size={18}
                className="text-foreground"
              />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <span className="font-semibold text-sm truncate">{label}</span>
              <span className="text-xs text-muted-foreground truncate">
                Properties
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <HugeiconsIcon
              icon={Settings01Icon}
              size={20}
              className="text-muted-foreground"
            />
            <span className="font-semibold text-sm">Form Settings</span>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        {selectedNode && config ? (
          <PropertiesForm node={selectedNode} config={config} />
        ) : (
          <GlobalSettingsForm />
        )}
      </SidebarContent>
    </Sidebar>
  );
}
