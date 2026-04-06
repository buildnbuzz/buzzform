"use client";

import { defineSchema, type InferType } from "@buildnbuzz/form-core";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormContent,
  FormFields,
  FormSubmit,
} from "@/registry/shadcn/form";

const accountSettingsSchema = defineSchema({
  fields: [
    {
      type: "tabs",
      ui: {
        variant: "default",
        spacing: "md",
      },
      tabs: [
        {
          label: "Profile",
          fields: [
            {
              type: "text",
              name: "displayName",
              label: "Display Name",
              placeholder: "John Doe",
              required: true,
            },
            {
              type: "text",
              name: "username",
              label: "Username",
              placeholder: "johndoe",
              required: true,
            },
            {
              type: "textarea",
              name: "bio",
              label: "Bio",
              placeholder: "Tell us about yourself...",
              rows: 3,
            },
          ],
        },
        {
          label: "Account",
          fields: [
            {
              type: "email",
              name: "email",
              label: "Email Address",
              required: true,
            },
            {
              type: "password",
              name: "password",
              label: "New Password",
              placeholder: "Leave blank to keep current",
              ui: {
                showRequirements: true,
              },
            },
          ],
        },
        {
          label: "Notifications",
          fields: [
            {
              type: "switch",
              name: "emailNotifications",
              label: "Email Notifications",
              description: "Receive updates via email",
              defaultValue: true,
            },
            {
              type: "switch",
              name: "pushNotifications",
              label: "Push Notifications",
              description: "Receive push notifications",
              defaultValue: false,
            },
            {
              type: "select",
              name: "frequency",
              label: "Digest Frequency",
              options: ["Instant", "Daily", "Weekly", "Never"],
              defaultValue: "Daily",
            },
          ],
        },
        {
          label: "Billing",
          disabled: true,
          fields: [
            {
              type: "text",
              name: "placeholder",
              label: "Coming Soon",
            },
          ],
        },
      ],
    },
  ],
});

type AccountSettingsSchema = InferType<typeof accountSettingsSchema.fields>;

export default function AccountSettingsForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Multi-step settings with tabbed navigation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={accountSettingsSchema}
          onSubmit={async ({ value }) => {
            const data = value as AccountSettingsSchema;
            await new Promise((r) => setTimeout(r, 1000));
            toast("Settings saved!", {
              description: (
                <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted text-muted-foreground p-3 text-xs">
                  <code>{JSON.stringify(data, null, 2)}</code>
                </pre>
              ),
            });
          }}
        >
          <FormContent>
            <FormFields className="space-y-4" />
            <FormSubmit className="mt-6 w-full">Save Changes</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
