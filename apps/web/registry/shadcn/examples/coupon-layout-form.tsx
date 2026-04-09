"use client";

import { defineSchema, type InferType } from "@buildnbuzz/form-react";
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

const dualActionSchema = defineSchema({
  fields: [
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
  ],
});

type DualActionSchema = InferType<typeof dualActionSchema.fields>;

export default function CouponLayoutForm() {
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
          onSubmit={async ({ value }) => {
            const data = value as DualActionSchema;
            await new Promise((r) => setTimeout(r, 1000));
            toast("Coupon applied!", {
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
            <FormSubmit className="mt-6 w-full">Apply</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
