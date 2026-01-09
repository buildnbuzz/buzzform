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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Newsletter subscription with checkbox consent
const newsletterSchema = createSchema([
  {
    type: "email",
    name: "email",
    label: "Email Address",
    placeholder: "you@example.com",
    required: true,
  },
  {
    type: "checkbox",
    name: "consent",
    label: "I agree to receive marketing emails and can unsubscribe anytime.",
    required: true,
  },
]);

export function NewsletterDialogExample() {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: Record<string, unknown>) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast("Subscribed!", {
      description: <ToastCodeBlock code={JSON.stringify(data, null, 2)} />,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        Subscribe to Newsletter
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Stay Updated</DialogTitle>
          <DialogDescription>
            Get the latest BuzzForm updates, tips, and new feature
            announcements.
          </DialogDescription>
        </DialogHeader>
        <Form schema={newsletterSchema} onSubmit={handleSubmit}>
          <FormContent className="space-y-4">
            <FormFields />
            <FormSubmit className="w-full">Subscribe</FormSubmit>
          </FormContent>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
