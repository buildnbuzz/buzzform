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
import { IconPlaceholder } from "@/components/icon-placeholder";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CreditCard,
  Notification02Icon,
  Settings01Icon,
  User03Icon,
} from "@hugeicons/core-free-icons";

const accountSettingsSchema = createSchema([
  {
    type: "tabs",
    ui: {
      variant: "default",
      spacing: "md",
    },
    tabs: [
      {
        label: "Profile",
        icon: <HugeiconsIcon icon={User03Icon} className="size-4" />,
        description: "Manage your public profile information.",
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
        icon: <HugeiconsIcon icon={Settings01Icon} className="size-4" />,
        description: "Update your account settings and preferences.",
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
        icon: <HugeiconsIcon icon={Notification02Icon} className="size-4" />,
        description: "Configure how you receive notifications.",
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
        icon: <HugeiconsIcon icon={CreditCard} className="size-4" />,
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
]);

const lineVariantSchema = createSchema([
  {
    type: "tabs",
    ui: {
      variant: "line",
      defaultTab: "shipping",
      spacing: "lg",
    },
    tabs: [
      {
        name: "billing",
        label: "Billing",
        icon: (
          <IconPlaceholder
            lucide="CreditCard"
            hugeicons="CreditCard01Icon"
            tabler="IconCreditCard"
            phosphor="CreditCard"
            className="size-4"
          />
        ),
        fields: [
          {
            type: "text",
            name: "cardName",
            label: "Name on Card",
            required: true,
          },
          {
            type: "text",
            name: "cardNumber",
            label: "Card Number",
            placeholder: "1234 5678 9012 3456",
            required: true,
          },
          {
            type: "row",
            fields: [
              {
                type: "text",
                name: "expiry",
                label: "Expiry Date",
                placeholder: "MM/YY",
                required: true,
                style: { width: "50%" },
              },
              {
                type: "text",
                name: "cvv",
                label: "CVV",
                placeholder: "123",
                required: true,
                style: { width: "50%" },
              },
            ],
          },
        ],
      },
      {
        name: "shipping",
        label: "Shipping",
        icon: (
          <IconPlaceholder
            lucide="Truck"
            hugeicons="Truck01Icon"
            tabler="IconTruck"
            phosphor="Truck"
            className="size-4"
          />
        ),
        fields: [
          {
            type: "text",
            name: "address",
            label: "Street Address",
            required: true,
          },
          {
            type: "row",
            fields: [
              {
                type: "text",
                name: "city",
                label: "City",
                required: true,
                style: { width: "50%" },
              },
              {
                type: "text",
                name: "zip",
                label: "ZIP Code",
                required: true,
                style: { width: "50%" },
              },
            ],
          },
          {
            type: "select",
            name: "country",
            label: "Country",
            options: ["United States", "Canada", "United Kingdom", "Australia"],
            required: true,
          },
        ],
      },
    ],
  },
]);

export function AccountSettingsForm() {
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

export function CheckoutForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
        <CardDescription>
          Billing and shipping in a streamlined checkout flow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={lineVariantSchema}
          onSubmit={async (data) => {
            await new Promise((r) => setTimeout(r, 1000));
            toast("Order placed!", {
              description: (
                <ToastCodeBlock code={JSON.stringify(data, null, 2)} />
              ),
            });
          }}
        >
          <FormContent>
            <FormFields className="space-y-4" />
            <FormSubmit className="mt-6 w-full">Complete Order</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
