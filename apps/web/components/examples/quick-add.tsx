"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ToastCodeBlock } from "@/components/ui/toast-code-block";
import { createSchema } from "@buildnbuzz/buzzform";
import {
  Form,
  FormContent,
  FormFields,
  FormSubmit,
} from "@/components/buzzform/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

// Quick add schema for popover - lightweight, single purpose
const quickAddSchema = createSchema([
  {
    type: "text",
    name: "title",
    label: "Title",
    placeholder: "e.g., Buy groceries",
    required: true,
  },
  {
    type: "select",
    name: "priority",
    label: "Priority",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
    defaultValue: "medium",
  },
]);

export function QuickAddPopover() {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: Record<string, unknown>) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast("Task added!", {
      description: <ToastCodeBlock code={JSON.stringify(data, null, 2)} />,
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>
        + Quick Add
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm">Add Task</h4>
            <p className="text-xs text-muted-foreground">
              Quickly add a new task to your list
            </p>
          </div>
          <Form schema={quickAddSchema} onSubmit={handleSubmit}>
            <FormContent className="space-y-3">
              <FormFields />
              <FormSubmit size="sm" className="w-full">
                Add Task
              </FormSubmit>
            </FormContent>
          </Form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
