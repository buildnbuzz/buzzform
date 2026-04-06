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

const lineVariantSchema = defineSchema({
  fields: [
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
                },
                {
                  type: "text",
                  name: "cvv",
                  label: "CVV",
                  placeholder: "123",
                  required: true,
                },
              ],
            },
          ],
        },
        {
          name: "shipping",
          label: "Shipping",

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
                },
                {
                  type: "text",
                  name: "zip",
                  label: "ZIP Code",
                  required: true,
                },
              ],
            },
            {
              type: "select",
              name: "country",
              label: "Country",
              options: [
                "United States",
                "Canada",
                "United Kingdom",
                "Australia",
              ],
              required: true,
            },
          ],
        },
      ],
    },
  ],
});

type LineVariantSchema = InferType<typeof lineVariantSchema.fields>;

export default function CheckoutForm() {
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
          onSubmit={async ({ value }) => {
            const data = value as LineVariantSchema;
            await new Promise((r) => setTimeout(r, 1000));
            toast("Order placed!", {
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
            <FormSubmit className="mt-6 w-full">Complete Order</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
