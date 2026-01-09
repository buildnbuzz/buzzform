"use client";

import { createSchema } from "@buildnbuzz/buzzform";
import { toast } from "sonner";
import { ToastCodeBlock } from "@/components/ui/toast-code-block";
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
} from "@/components/buzzform/form";

const settingsSchema = createSchema([
  {
    type: "text",
    name: "username",
    label: "Username",
    placeholder: "johndoe",
    required: true,
  },
  {
    type: "collapsible",
    label: "Advanced Settings",
    collapsed: true,
    ui: {
      variant: "bordered",
      description: "Additional options that are hidden by default.",
    },
    fields: [
      {
        type: "switch",
        name: "publicProfile",
        label: "Public Profile",
        defaultValue: true,
      },
      {
        type: "switch",
        name: "showEmail",
        label: "Show Email Address",
        defaultValue: false,
      },
      {
        type: "select",
        name: "timezone",
        label: "Timezone",
        options: ["UTC", "EST", "PST", "GMT"],
        defaultValue: "UTC",
      },
    ],
  },
  {
    type: "collapsible",
    label: "Danger Zone",
    collapsed: true,
    ui: {
      variant: "card",
      description: "Irreversible actions for your account.",
    },
    fields: [
      {
        type: "checkbox",
        name: "confirmDelete",
        label: "I understand that deleting my account is permanent",
      },
    ],
  },
]);

export function CollapsibleSettingsForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Expandable sections for organizing advanced options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={settingsSchema}
          onSubmit={async (data) => {
            await new Promise((r) => setTimeout(r, 1000));
            toast("Settings saved!", {
              description: (
                <ToastCodeBlock code={JSON.stringify(data, null, 2)} />
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
