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

// Pricing plan selection with card variant
const pricingSchema = createSchema([
  {
    type: "radio",
    name: "plan",
    label: "Select your plan",
    required: true,
    options: [
      {
        value: "free",
        label: "Free",
        description: "For personal projects and experiments",
      },
      {
        value: "pro",
        label: "Pro",
        description: "For professional developers and small teams",
      },
      {
        value: "enterprise",
        label: "Enterprise",
        description: "For large organizations with custom needs",
      },
    ],
    ui: {
      variant: "card",
      card: { size: "md", bordered: true },
    },
  },
  {
    type: "radio",
    name: "billing",
    label: "Billing cycle",
    required: true,
    options: ["Monthly", "Yearly"],
    defaultValue: "Monthly",
    ui: { direction: "horizontal" },
  },
]);

export function PricingFormCard() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast("Plan selected!", {
      description: <ToastCodeBlock code={JSON.stringify(data, null, 2)} />,
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Choose a Plan</CardTitle>
        <CardDescription>
          Select the plan that best fits your needs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={pricingSchema}
          onSubmit={handleSubmit}
          settings={{ autoFocus: false }}
        >
          <FormContent className="space-y-6">
            <FormFields />
            <FormSubmit className="w-full">Continue</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
