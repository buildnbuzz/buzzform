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
} from "@/components/buzzform/form";
import { toast } from "sonner";
import { ToastCodeBlock } from "@/components/ui/toast-code-block";
import { createSchema } from "@buildnbuzz/buzzform";
import type { ValidationContext } from "@buildnbuzz/buzzform";

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

const subcategoryMap: Record<
  string,
  Array<{ value: string; label: string }>
> = {
  technical: [
    { value: "bug", label: "Bug Report" },
    { value: "crash", label: "Application Crash" },
    { value: "performance", label: "Performance Issue" },
    { value: "integration", label: "Integration Problem" },
  ],
  billing: [
    { value: "invoice", label: "Invoice Question" },
    { value: "refund", label: "Refund Request" },
    { value: "upgrade", label: "Plan Upgrade" },
    { value: "payment", label: "Payment Failed" },
  ],
  account: [
    { value: "password", label: "Password Reset" },
    { value: "2fa", label: "Two-Factor Auth" },
    { value: "profile", label: "Profile Update" },
    { value: "delete", label: "Delete Account" },
  ],
  feature: [
    { value: "ui", label: "UI Improvement" },
    { value: "api", label: "API Feature" },
    { value: "mobile", label: "Mobile App" },
    { value: "other", label: "Other" },
  ],
};

const priorityOptions = [
  { value: "low", label: "Low", description: "No impact on work" },
  { value: "medium", label: "Medium", description: "Some features affected" },
  { value: "high", label: "High", description: "Major functionality impacted" },
  { value: "urgent", label: "Urgent", description: "Complete blocker" },
];

const teamMembers = [
  { value: "alice", label: "Alice Johnson" },
  { value: "bob", label: "Bob Smith" },
  { value: "carol", label: "Carol Williams" },
  { value: "david", label: "David Brown" },
  { value: "emma", label: "Emma Davis" },
];

async function getSubcategories(context: ValidationContext) {
  const category = context.data?.category as string | undefined;
  if (!category) return [];

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return subcategoryMap[category] || [];
}

// Support ticket form showcasing dynamic options
const ticketSchema = createSchema([
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
    options: getSubcategories,
    dependencies: ["category"],
    placeholder: "Select subcategory...",
    disabled: (data) => !data.category,
    description: "Options update based on selected category",
    ui: {
      loadingMessage: "Loading subcategories...",
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
]);

export function SupportTicketForm() {
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
          onSubmit={async (data) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast("Ticket Submitted!", {
              description: (
                <ToastCodeBlock code={JSON.stringify(data, null, 2)} />
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
