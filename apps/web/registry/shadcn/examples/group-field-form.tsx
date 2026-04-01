"use client";

import { toast } from "sonner";
import { defineSchema, type InferType } from "@buildnbuzz/form-core";
import {
  Form,
  FormContent,
  FormFields,
  FormSubmit,
  FormReset,
  FormActions,
} from "@/registry/shadcn/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Schema with group field containing address information
const registrationSchema = defineSchema({
  fields: [
    {
      type: "text",
      name: "fullName",
      label: "Full Name",
      placeholder: "John Doe",
      required: true,
    },
    {
      type: "email",
      name: "email",
      label: "Email Address",
      placeholder: "john@example.com",
      required: true,
    },
    {
      type: "group",
      name: "address",
      label: "Shipping Address",
      description: "Enter your complete shipping address",
      ui: {
        variant: "card",
        spacing: "md",
        showErrorBadge: true,
      },
      fields: [
        {
          type: "text",
          name: "street",
          label: "Street Address",
          placeholder: "123 Main Street",
          required: true,
        },
        {
          type: "row",
          fields: [
            {
              type: "text",
              name: "city",
              label: "City",
              placeholder: "New York",
              required: true,
              ui: { width: "50%" },
            },
            {
              type: "text",
              name: "state",
              label: "State/Province",
              placeholder: "NY",
              required: true,
              ui: { width: "50%" },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              type: "text",
              name: "zipCode",
              label: "ZIP/Postal Code",
              placeholder: "10001",
              required: true,
              ui: { width: "50%" },
            },
            {
              type: "text",
              name: "country",
              label: "Country",
              placeholder: "United States",
              required: true,
              ui: { width: "50%" },
            },
          ],
        },
      ],
    },
    {
      type: "group",
      name: "billingAddress",
      label: "Billing Address",
      description: "Leave blank to use shipping address",
      ui: {
        variant: "bordered",
        spacing: "md",
        collapsed: true,
        showErrorBadge: true,
      },
      fields: [
        {
          type: "checkbox",
          name: "sameAsShipping",
          label: "Same as shipping address",
        },
        {
          type: "text",
          name: "street",
          label: "Street Address",
          placeholder: "123 Main Street",
        },
        {
          type: "row",
          fields: [
            {
              type: "text",
              name: "city",
              label: "City",
              placeholder: "New York",
              ui: { width: "50%" },
            },
            {
              type: "text",
              name: "state",
              label: "State/Province",
              placeholder: "NY",
              ui: { width: "50%" },
            },
          ],
        },
      ],
    },
    {
      type: "checkbox",
      name: "agreeToTerms",
      label: "I agree to the terms and conditions",
      required: true,
    },
  ],
});

type RegistrationSchema = InferType<typeof registrationSchema.fields>;

export default function GroupFieldExample() {
  const handleSubmit = async ({ value }: { value: unknown }) => {
    const data = value as RegistrationSchema;
    await new Promise((r) => setTimeout(r, 1000));
    toast("Registration complete!", {
      description: (
        <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-zinc-950 p-3 text-xs">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping & Billing</CardTitle>
        <CardDescription>
          Grouped address fields with collapsible sections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form schema={registrationSchema} onSubmit={handleSubmit}>
          <FormContent>
            <FormFields />
            <FormActions>
              <FormReset>Reset</FormReset>
              <FormSubmit>Submit</FormSubmit>
            </FormActions>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
