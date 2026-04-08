"use client";

import { useState } from "react";
import { toast } from "sonner";
import { defineSchema, type InferType } from "@buildnbuzz/form-react";
import {
  Form,
  FormContent,
  FormFields,
  FormSubmit,
  FormReset,
  FormActions,
} from "@/registry/shadcn/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Feedback form with conditional textarea
const feedbackSchema = defineSchema({
  fields: [
    {
      type: "text",
      name: "feature",
      label: "Feature Name",
      placeholder: "e.g., TextField component",
      required: true,
      ui: {
        copyable: true,
      },
    },
    {
      type: "textarea",
      name: "feedback",
      label: "Your Feedback",
      placeholder: "What did you like? What could be improved?",
      required: true,
      minLength: 20,
      maxLength: 1000,

      ui: {
        autoResize: true,
        copyable: true,
      },
    },
    {
      type: "checkbox",
      name: "canContact",
      label: "You can contact me for follow-up questions",
      description: "We may reach out to understand your feedback better.",
    },
    {
      type: "email",
      name: "email",
      label: "Email (optional)",
      placeholder: "your@email.com",
      condition: { $data: "/canContact", eq: true },
    },
  ],
});

type FeedbackSchema = InferType<typeof feedbackSchema.fields>;

export default function FeedbackSheetExample() {
  const [open, setOpen] = useState(false);

  const handleSubmit = async ({ value }: { value: unknown }) => {
    const data = value as FeedbackSchema;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast("Thank you!", {
      description: (
        <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted text-muted-foreground p-3 text-xs">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button />}>Give Feedback</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Share Your Feedback</SheetTitle>
          <SheetDescription>
            Help us make BuzzForm better. Your feedback is invaluable.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <Form schema={feedbackSchema} onSubmit={handleSubmit}>
            <FormContent>
              <FormFields />
              <FormActions>
                <FormReset variant="ghost">Clear</FormReset>
                <FormSubmit>Submit Feedback</FormSubmit>
              </FormActions>
            </FormContent>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
