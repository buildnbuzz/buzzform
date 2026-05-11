"use client";

import React from "react";
import {
  BuilderSidebar,
  DraggableSidebarItem,
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
} from "@/components/ui/sidebar";
import { FieldIcon } from "./field-icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Visual field palette for the form builder.
 * Grouped by category and draggable into the canvas.
 */
export const FieldSidebar = () => {
  return (
    <Sidebar className="h-full bg-background" collapsible="none">
      <SidebarContent>
        <BuilderSidebar
          render={({ groups }) => (
            <>
              {Object.entries(groups).map(([category, items]) => (
                <SidebarGroup key={category}>
                  <SidebarGroupLabel>
                    {category}
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
