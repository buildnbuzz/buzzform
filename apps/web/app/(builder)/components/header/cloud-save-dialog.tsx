"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { CloudServerIcon } from "@hugeicons/core-free-icons";
import { Sparkles } from "lucide-react";
import { joinWaitlist } from "@/app/(builder)/lib/actions";
import { toast } from "sonner";
import { createSchema, InferType } from "@buildnbuzz/buzzform";
import {
  Form,
  FormContent,
  FormFields,
  FormSubmit,
  FormAction,
} from "@/registry/base/form";
import Link from "next/link";

const waitlistSchema = createSchema([
  {
    type: "email",
    name: "email",
    label: "Email Address",
    placeholder: "you@example.com",
    required: true,
    description: (
      <span className="text-xs">
        By joining, you agree to our{" "}
        <Link
          href="/terms"
          className="underline hover:text-primary underline-offset-4"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline hover:text-primary underline-offset-4"
        >
          Privacy Policy
        </Link>
        .
      </span>
    ),
  },
]);

export type WaitlistData = InferType<typeof waitlistSchema>;

export function CloudSaveDialog() {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: WaitlistData) => {
    try {
      const result = await joinWaitlist(data.email);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message || "You've been added to the waitlist!");
        setOpen(false);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-8 hidden sm:flex"
          >
            <HugeiconsIcon icon={CloudServerIcon} size={16} />
            Save
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon
              icon={CloudServerIcon}
              className="text-primary h-6 w-6"
            />
            Save & Sync
          </DialogTitle>
          <DialogDescription>
            Never lose your work again. Save your forms to the cloud, access
            version history, and create your central form repository.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm flex gap-3 text-primary mb-6">
            <Sparkles className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Coming Soon</p>
              <p className="text-muted-foreground text-xs">
                We&apos;re currently building the persistence layer. Join the
                waitlist to get <b>early access</b> and{" "}
                <b>free cloud storage</b> when we launch.
              </p>
            </div>
          </div>

          <Form schema={waitlistSchema} onSubmit={handleSubmit}>
            <FormContent className="space-y-4">
              <FormFields />
              <DialogFooter>
                <FormAction
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  Cancel
                </FormAction>
                <FormSubmit>Join Waitlist</FormSubmit>
              </DialogFooter>
            </FormContent>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
