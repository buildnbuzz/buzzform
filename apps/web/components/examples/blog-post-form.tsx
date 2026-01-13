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

// Blog post form with tags for categories
const blogPostSchema = createSchema([
  {
    type: "text",
    name: "title",
    label: "Post Title",
    placeholder: "Enter your post title...",
    required: true,
    minLength: 5,
    maxLength: 100,
  },
  {
    type: "tags",
    name: "tags",
    label: "Tags",
    placeholder: "Add tags and press enter...",
    description: "Add up to 5 tags to categorize your post.",
    required: true,
    minTags: 1,
    maxTags: 5,
    maxTagLength: 20,
    ui: {
      delimiters: ["enter", "comma"],
      variant: "chips",
    },
  },
  {
    type: "tags",
    name: "keywords",
    label: "SEO Keywords",
    placeholder: "Add keywords separated by comma or space...",
    description: "Keywords help with search engine optimization.",
    maxTags: 10,
    ui: {
      delimiters: ["enter", "comma", "space"],
      variant: "pills",
      copyable: true,
    },
  },
  {
    type: "textarea",
    name: "excerpt",
    label: "Excerpt",
    placeholder: "Write a brief summary of your post...",
    rows: 3,
    maxLength: 200,
  },
]);

export function BlogPostFormCard() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast("Post draft saved!", {
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
        <CardTitle>New Blog Post</CardTitle>
        <CardDescription>
          Create a new post with tags and keywords.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={blogPostSchema}
          onSubmit={handleSubmit}
          settings={{ autoFocus: true }}
        >
          <FormContent className="space-y-4">
            <FormFields />
            <FormActions>
              <FormReset>Clear</FormReset>
              <FormSubmit>Save Draft</FormSubmit>
            </FormActions>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
