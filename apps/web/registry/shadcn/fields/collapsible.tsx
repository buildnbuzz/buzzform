"use client";

import { useState } from "react";
import type { CollapsibleField as CollapsibleFieldDef } from "@buildnbuzz/form-core";
import { useLayoutField } from "@buildnbuzz/form-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function CollapsibleField({ children }: { children?: React.ReactNode }) {
  const { field, label } = useLayoutField<CollapsibleFieldDef>();
  const [isOpen, setIsOpen] = useState(!field.collapsed);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full border rounded-lg p-4 space-y-4"
    >
      <div className="flex items-center justify-between space-x-4">
        <h4 className="text-sm font-semibold">
          {label || "Toggle"}
        </h4>
        <CollapsibleTrigger
          render={
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
              <span className="sr-only">Toggle</span>
            </Button>
          }
        />
      </div>
      <CollapsibleContent className="space-y-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
