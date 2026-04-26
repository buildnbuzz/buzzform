"use client";

import React, { useEffect } from "react";
import {
  BuilderSidebar,
  DraggableSidebarItem,
  useBuilderStore,
} from "@buildnbuzz/form-builder-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { FieldIcon } from "./field-icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  inputs: "Inputs",
  selection: "Selection",
  layout: "Layout",
};

/**
 * Visual field palette for the form builder.
 * Grouped by category and draggable into the canvas.
 */
export const FieldSidebar = () => {
  const mode = useBuilderStore((s) => s.mode);

  let sidebarSetOpen: ((open: boolean) => void) | undefined;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    sidebarSetOpen = useSidebar().setOpen;
  } catch {
    // Ignore until Task 3 adds SidebarProvider
  }

  const setOpen = React.useCallback(
    (open: boolean) => {
      sidebarSetOpen?.(open);
    },
    [sidebarSetOpen],
  );

  useEffect(() => {
    setOpen(mode !== "preview");
  }, [mode, setOpen]);

  return (
    <Sidebar className="h-full border-r" collapsible="none">
      <SidebarContent>
        <BuilderSidebar
          render={({ groups }) => (
            <>
              {Object.entries(groups).map(([category, items]) => (
                <SidebarGroup key={category}>
                  <SidebarGroupLabel>
                    {CATEGORY_LABELS[category] ?? category}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {items.map((item) => (
                        <DraggableSidebarItem
                          key={item.type}
                          type={item.type}
                          render={({
                            setNodeRef,
                            attributes,
                            listeners,
                            isDragging,
                          }) => {
                            const disabled = item.disabled;

                            return (
                              <SidebarMenuItem key={item.type}>
                                <SidebarMenuButton
                                  ref={setNodeRef}
                                  {...listeners}
                                  {...attributes}
                                  className={cn(
                                    "cursor-grab group relative",
                                    disabled && "cursor-not-allowed opacity-50",
                                    isDragging && "opacity-40 bg-muted/50",
                                  )}
                                  // disabled={disabled} // DraggableSidebarItem handles disabled state
                                >
                                  <FieldIcon type={item.type} size={16} />
                                  <span>{item.label}</span>
                                  {disabled && (
                                    <Badge
                                      variant="outline"
                                      className="ml-auto text-[10px] h-5 px-1.5 py-0 bg-transparent text-muted-foreground border-muted-foreground/40"
                                    >
                                      Coming Soon
                                    </Badge>
                                  )}
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          }}
                        />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </>
          )}
        />
      </SidebarContent>
    </Sidebar>
  );
};
