"use client";

import { toast } from "sonner";
import { ToastCodeBlock } from "@/components/ui/toast-code-block";
import { createSchema } from "@buildnbuzz/buzzform";
import {
  Form,
  FormContent,
  FormFields,
  FormSubmit,
  FormReset,
  FormActions,
} from "@/components/buzzform/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Schema with group field containing address information
const registrationSchema = createSchema([
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
            style: { width: "50%" },
          },
          {
            type: "text",
            name: "state",
            label: "State/Province",
            placeholder: "NY",
            required: true,
            style: { width: "50%" },
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
            style: { width: "50%" },
          },
          {
            type: "text",
            name: "country",
            label: "Country",
            placeholder: "United States",
            required: true,
            style: { width: "50%" },
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
            style: { width: "50%" },
          },
          {
            type: "text",
            name: "state",
            label: "State/Province",
            placeholder: "NY",
            style: { width: "50%" },
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
]);

export default function GroupFieldExample() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    await new Promise((r) => setTimeout(r, 1000));
    toast("Registration complete!", {
      description: <ToastCodeBlock code={JSON.stringify(data, null, 2)} />,
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
