"use client";

import { toast } from "sonner";
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

// Schema with text, email, textarea fields
const contactSchema = createSchema([
  {
    type: "text",
    name: "name",
    label: "Full Name",
    placeholder: "John Doe",
    required: true,
    minLength: 2,
  },
  {
    type: "email",
    name: "email",
    label: "Email Address",
    placeholder: "john@example.com",
    required: true,
  },
  {
    type: "text",
    name: "subject",
    label: "Subject",
    placeholder: "How can we help?",
    required: true,
  },
  {
    type: "textarea",
    name: "message",
    label: "Message",
    placeholder: "Tell us more about your inquiry...",
    description: "Be as detailed as possible so we can help you better.",
    required: true,
    minLength: 10,
    maxLength: 500,
    rows: 4,
    autoResize: true,
  },
]);

export function ContactFormExample() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast("Message sent!", {
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
        <CardTitle>Contact Us</CardTitle>
        <CardDescription>
          Have a question? Send us a message and we&apos;ll respond within 24
          hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form schema={contactSchema} onSubmit={handleSubmit}>
          <FormContent>
            <FormFields />
            <FormActions>
              <FormReset>Clear</FormReset>
              <FormSubmit>Send Message</FormSubmit>
            </FormActions>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
