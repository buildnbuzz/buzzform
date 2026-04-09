"use client";

import { useState } from "react";
import { toast } from "sonner";
import { defineSchema, type InferType } from "@buildnbuzz/form-react";
import {
  Form,
  FormContent,
  FormFields,
  FormSubmit,
  FormActions,
} from "@/registry/shadcn/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Registration form with password strength
const registerSchema = defineSchema({
  fields: [
    {
      type: "text",
      name: "name",
      label: "Full Name",
      placeholder: "John Doe",
      required: true,
    },
    {
      type: "email",
      name: "email",
      label: "Email",
      placeholder: "you@example.com",
      required: true,
    },
    {
      type: "password",
      name: "password",
      label: "Password",
      placeholder: "Create a strong password",
      required: true,
      minLength: 8,
      criteria: {
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecial: true,
      },
      ui: {
        strengthIndicator: true,
        showRequirements: true,
        allowGenerate: true,
        copyable: true,
      },
      autoComplete: "new-password",
    },
    {
      type: "checkbox",
      name: "terms",
      label: (
        <span className="text-xs">
          I agree to the <Link href="/terms">Terms of Service</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>
        </span>
      ),
      required: true,
    },
  ],
});

type RegisterSchema = InferType<typeof registerSchema.fields>;

export default function RegisterFormDialog() {
  const [open, setOpen] = useState(false);

  const handleSubmit = async ({ value }: { value: unknown }) => {
    const data = value as RegisterSchema;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast("Account created!", {
      description: (
        <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted text-muted-foreground p-3 text-xs">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Create Account</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
          <DialogDescription>
            Password strength indicator with real-time requirements
          </DialogDescription>
        </DialogHeader>
        <Form schema={registerSchema} onSubmit={handleSubmit}>
          <FormContent>
            <FormFields />
            <FormActions>
              <FormSubmit className="w-full">Create Account</FormSubmit>
            </FormActions>
          </FormContent>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
