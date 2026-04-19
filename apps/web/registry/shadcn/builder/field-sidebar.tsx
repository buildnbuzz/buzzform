"use client";

import {
  BuilderSidebar,
  DraggableSidebarItem,
} from "@buildnbuzz/form-builder-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconPlaceholder } from "@/components/icon-placeholder";
import { cn } from "@/lib/utils";

/**
 * Visual field palette for the form builder.
 * Grouped by category and draggable into the canvas.
 */
export const FieldSidebar = () => {
  return (
    <div className="flex h-full flex-col bg-background border-r">
      <div className="p-4 border-b">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
          Field Palette
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <BuilderSidebar
          render={({ groups }) => (
            <Accordion
              multiple
              defaultValue={Object.keys(groups)}
              className="w-full px-4"
            >
              {Object.entries(groups).map(([category, items]) => (
                <AccordionItem
                  key={category}
                  value={category}
                  className="border-none"
                >
                  <AccordionTrigger className="py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 hover:no-underline hover:text-foreground transition-colors">
                    {category}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((item) => (
                        <DraggableSidebarItem
                          key={item.type}
                          type={item.type}
                          render={({
                            setNodeRef,
                            attributes,
                            listeners,
                            isDragging,
                          }) => (
                            <div
                              ref={setNodeRef}
                              {...attributes}
                              {...listeners}
                              className={cn(
                                "group flex flex-col items-center justify-center gap-2.5 rounded-xl border bg-card p-3.5 text-center shadow-sm transition-all duration-200 hover:border-primary/50 hover:bg-primary/2 hover:shadow-md cursor-grab active:cursor-grabbing",
                                isDragging &&
                                  "opacity-40 border-primary bg-primary/5 scale-95",
                              )}
                            >
                              <div className="flex size-9 items-center justify-center rounded-lg bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <IconPlaceholder {...item.icon} size={18} />
                              </div>
                              <span className="text-[11px] font-semibold leading-tight text-muted-foreground group-hover:text-foreground">
                                {item.label}
                              </span>
                            </div>
                          )}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        />
      </ScrollArea>
    </div>
  );
};
