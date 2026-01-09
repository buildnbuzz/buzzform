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
  FormActions,
} from "@/components/buzzform/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

// Login form with password
const loginSchema = createSchema([
  {
    type: "email",
    name: "email",
    label: "Email",
    placeholder: "you@example.com",
    required: true,
    autoComplete: "email",
  },
  {
    type: "password",
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    required: true,
    minLength: 8,
    autoComplete: "current-password",
  },
  {
    type: "checkbox",
    name: "rememberMe",
    label: "Remember me for 30 days",
  },
]);

// Registration form with password strength
const registerSchema = createSchema([
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
]);

export function LoginFormCard() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast("Welcome back!", {
      description: <ToastCodeBlock code={JSON.stringify(data, null, 2)} />,
    });
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Secure login with email and password authentication
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form schema={loginSchema} onSubmit={handleSubmit}>
          <FormContent>
            <FormFields />
            <div className="flex items-center justify-between">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <FormSubmit className="w-full">Sign In</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}

export function RegisterFormDialog() {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: Record<string, unknown>) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast("Account created!", {
      description: <ToastCodeBlock code={JSON.stringify(data, null, 2)} />,
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
