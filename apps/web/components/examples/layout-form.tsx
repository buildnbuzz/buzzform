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

const contactSchema = createSchema([
  {
    type: "row",
    fields: [
      {
        type: "text",
        name: "firstName",
        label: "First Name",
        placeholder: "John",
        required: true,
      },
      {
        type: "text",
        name: "lastName",
        label: "Last Name",
        placeholder: "Doe",
        required: true,
      },
    ],
  },
  {
    type: "email",
    name: "email",
    label: "Email Address",
    placeholder: "john.doe@example.com",
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
        style: { width: "60%" },
      },
      {
        type: "text",
        name: "zip",
        label: "ZIP Code",
        placeholder: "10001",
        style: { width: "40%" },
      },
    ],
  },
]);

const dualActionSchema = createSchema([
  {
    type: "row",
    ui: { align: "center", gap: 4 },
    fields: [
      {
        type: "text",
        name: "coupon",
        label: "Coupon Code",
        placeholder: "SUMMER20",
      },
      {
        type: "checkbox",
        name: "applyAutomatically",
        label: "Apply automatically",
      },
    ],
  },
]);

export function ContactLayoutForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>
          Side-by-side fields with responsive row layout
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={contactSchema}
          onSubmit={async (data) => {
            await new Promise((r) => setTimeout(r, 1000));
            toast("Contact saved!", {
              description: (
                <ToastCodeBlock code={JSON.stringify(data, null, 2)} />
              ),
            });
          }}
        >
          <FormContent>
            <FormFields className="space-y-4" />
            <FormSubmit className="mt-6 w-full">Save Contact</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}

export function CouponLayoutForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply Discount</CardTitle>
        <CardDescription>
          Mixed field types aligned in a single row
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={dualActionSchema}
          onSubmit={async (data) => {
            await new Promise((r) => setTimeout(r, 1000));
            toast("Coupon applied!", {
              description: (
                <ToastCodeBlock code={JSON.stringify(data, null, 2)} />
              ),
            });
          }}
        >
          <FormContent>
            <FormFields className="space-y-4" />
            <FormSubmit className="mt-6 w-full">Apply</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
