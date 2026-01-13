"use client";

import { toast } from "sonner";
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

// Product quantity and pricing form
const productSchema = createSchema([
  {
    type: "number",
    name: "quantity",
    label: "Quantity",
    required: true,
    min: 1,
    max: 100,
    defaultValue: 1,
  },
  {
    type: "number",
    name: "price",
    label: "Price",
    required: true,
    min: 0,
    precision: 2,
    ui: {
      prefix: "$",
      variant: "plain",
      thousandSeparator: ",",
      hideSteppers: true,
    },
  },
  {
    type: "number",
    name: "discount",
    label: "Discount",
    min: 0,
    max: 100,
    defaultValue: 0,
    ui: {
      suffix: "%",
      variant: "stacked",
      step: 5,
    },
  },
]);

export function ProductFormCard() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast("Order calculated!", {
      description: (
        <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-zinc-950 p-3 text-xs">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Product Order</CardTitle>
        <CardDescription>
          Configure quantity, price, and discount.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={productSchema}
          onSubmit={handleSubmit}
          settings={{ autoFocus: false }}
        >
          <FormContent className="space-y-4">
            <FormFields />
            <FormSubmit className="w-full">Calculate Total</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
