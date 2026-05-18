"use client";

import { toast } from "sonner";
import { defineSchema, type InferType } from "@buildnbuzz/form-react";
import {
  Form,
  FormContent,
  FormFields,
  FormSubmit,
} from "@/registry/shadcn/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconPlaceholder } from "@/components/icon-placeholder";
import Link from "next/link";

// Login form with password
const loginSchema = defineSchema({
  fields: [
    {
      type: "email",
      name: "email",
      label: "Email",
      placeholder: "you@example.com",
      required: true,
      autoComplete: "email",
      ui: {
        asterisk: false, // Hides the red required * asterisk
      },
    },
    {
      type: "password",
      name: "password",
      label: (
        <span className="flex items-center gap-1.5">
          Password
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  tabIndex={-1}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <IconPlaceholder
                    hugeicons="InformationCircleIcon"
                    tabler="IconInfoCircle"
                    phosphor="Info"
                    remixicon="RiInformationLine"
                    className="size-4"
                  />
                  <span className="sr-only">More info</span>
                </button>
              }
            />
            <TooltipContent side="right">
              <p className="text-xs font-normal">
                Must be at least 8 characters.
              </p>
            </TooltipContent>
          </Tooltip>
        </span>
      ),
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
  ],
});

type LoginSchema = InferType<typeof loginSchema.fields>;

export default function LoginFormCard() {
  const handleSubmit = async ({ value }: { value: unknown }) => {
    const data = value as LoginSchema;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast("Welcome back!", {
      description: (
        <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted text-muted-foreground p-3 text-xs">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
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
