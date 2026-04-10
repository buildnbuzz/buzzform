"use client";

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
import { toast } from "sonner";
import { defineSchema, type InferType } from "@buildnbuzz/form-react";

const categoryOptions = [
  {
    value: "technical",
    label: "Technical Issue",
    description: "Software bugs, errors, or crashes",
  },
  {
    value: "billing",
    label: "Billing & Payments",
    description: "Invoices, refunds, or payment methods",
  },
  {
    value: "account",
    label: "Account",
    description: "Password, profile, or security settings",
  },
  {
    value: "feature",
    label: "Feature Request",
    description: "Suggest new features or improvements",
  },
];

const priorityOptions = [
  { value: "low", label: "Low", description: "No impact on work" },
  { value: "medium", label: "Medium", description: "Some features affected" },
  { value: "high", label: "High", description: "Major functionality impacted" },
  { value: "urgent", label: "Urgent", description: "Complete blocker" },
];
const subcategories: Record<string, Array<{ value: string; label: string }>> = {
  technical: [
    { value: "bug", label: "Software Bug" },
    { value: "crash", label: "System Crash" },
    { value: "performance", label: "Performance Issue" },
  ],
  billing: [
    { value: "refund", label: "Refund Request" },
    { value: "subscription", label: "Subscription Issue" },
    { value: "invoice", label: "Invoice Query" },
  ],
  account: [
    { value: "password", label: "Password Reset" },
    { value: "security", label: "Security Breach" },
    { value: "profile", label: "Profile Update" },
  ],
  feature: [
    { value: "ui", label: "UI Improvement" },
    { value: "new-feature", label: "New Functionality" },
    { value: "api", label: "API Integration" },
  ],
};

const teamMembers = [
  { value: "alice", label: "Alice Johnson" },
  { value: "bob", label: "Bob Smith" },
  { value: "carol", label: "Carol Williams" },
  { value: "david", label: "David Brown" },
  { value: "emma", label: "Emma Davis" },
];

// Support ticket form showcasing dynamic options
const ticketSchema = defineSchema({
  fields: [
    {
      type: "select",
      name: "category",
      label: "Category",
      required: true,
      options: categoryOptions,
      placeholder: "Choose a category...",
    },
    {
      type: "select",
      name: "subcategory",
      label: "Subcategory",
      required: true,
      options: async ({ data }) => {
        const cat = data.category as string;
        // Simulate network latency
        await new Promise((resolve) => setTimeout(resolve, 600));
        return subcategories[cat] || [];
      },
      dependencies: ["/category"],
      description: "Available subcategories based on your chosen category",
      disabled: { $data: "/category", not: true },
      ui: {
        emptyMessage: "Select a category first",
      },
    },
    {
      type: "select",
      name: "priority",
      label: "Priority",
      required: true,
      options: priorityOptions,
      placeholder: "Set priority...",
    },
    {
      type: "select",
      name: "assignees",
      label: "Assign To",
      hasMany: true,
      options: teamMembers,
      placeholder: "Select team members...",
      description: "Optionally assign to team members",
      ui: {
        isClearable: true,
        maxVisibleChips: 2,
      },
    },
  ],
});

type TicketSchema = InferType<typeof ticketSchema.fields>;

export default function SupportTicketForm() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Submit Support Ticket</CardTitle>
        <CardDescription>
          Dynamic dropdowns with dependent options and multi-select
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={ticketSchema}
          onSubmit={async ({ value }) => {
            const data = value as TicketSchema;
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast("Ticket Submitted!", {
              description: (
                <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted text-muted-foreground p-3 text-xs">
                  <code>{JSON.stringify(data, null, 2)}</code>
                </pre>
              ),
            });
          }}
        >
          <FormContent>
            <FormFields />
            <div className="flex justify-end pt-4">
              <FormSubmit>Submit Ticket</FormSubmit>
            </div>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
