"use client";

import { toast } from "sonner";
import { defineSchema, type InferType } from "@buildnbuzz/form-core";
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

// Product quantity and pricing form
const productSchema = defineSchema({
  fields: [
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
  ],
});

type ProductSchema = InferType<typeof productSchema.fields>;

export default function ProductFormCard() {
  const handleSubmit = async ({ value }: { value: unknown }) => {
    const data = value as ProductSchema;
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast("Order calculated!", {
      description: (
        <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted text-muted-foreground p-3 text-xs">
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
        <Form schema={productSchema} onSubmit={handleSubmit}>
          <FormContent className="space-y-4">
            <FormFields />
            <FormSubmit className="w-full">Calculate Total</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
