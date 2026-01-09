"use client";

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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const notificationSettingsSchema = createSchema([
  {
    type: "switch",
    name: "emailNotifications",
    label: "Email notifications",
    description: "Receive updates and alerts via email",
    defaultValue: true,
  },
  {
    type: "switch",
    name: "pushNotifications",
    label: "Push notifications",
    description: "Get notified on your device",
    defaultValue: false,
  },
  {
    type: "switch",
    name: "marketingEmails",
    label: "Marketing emails",
    description: "Receive tips, product updates, and promotions",
    defaultValue: false,
  },
  {
    type: "switch",
    name: "weeklyDigest",
    label: "Weekly digest",
    description: "A summary of your activity sent every Monday",
    defaultValue: true,
    disabled: (data) => !data.emailNotifications,
  },
]);

export function NotificationSettingsCard() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast("Settings saved!", {
      description: <ToastCodeBlock code={JSON.stringify(data, null, 2)} />,
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Choose how you want to be notified about updates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={notificationSettingsSchema}
          onSubmit={handleSubmit}
          settings={{ autoFocus: false }}
        >
          <FormContent className="space-y-4">
            <FormFields />
            <FormSubmit className="w-full">Save Preferences</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
