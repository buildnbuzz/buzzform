"use client";

import { toast } from "sonner";
import { defineSchema, type InferType } from "@buildnbuzz/form-react";
import {
  Form,
  FormContent,
  FormFields,
  FormSubmit,
  FormReset,
  FormActions,
} from "@/registry/shadcn/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const documentSchema = defineSchema({
  fields: [
    {
      type: "upload",
      name: "document",
      label: "Upload Document",
      description: "PDF, Word, or text files (max 10MB)",
      maxSize: 10 * 1024 * 1024,
      ui: {
        variant: "dropzone",
        accept: ".pdf,.doc,.docx,.txt",
        dropzoneText: "Drop your document here or click to browse",
      },
    },
    {
      type: "textarea",
      name: "notes",
      label: "Additional Notes",
      placeholder: "Any notes about this document...",
      ui: {
        rows: 3,
      },
    },
  ],
});

type DocumentSchema = InferType<typeof documentSchema.fields>;

export default function DocumentUploadForm() {
  const handleSubmit = async ({ value }: { value: unknown }) => {
    const data = value as DocumentSchema;
    await new Promise((r) => setTimeout(r, 1000));
    toast("Document uploaded successfully!", {
      description: (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground">
            Check the console for the full File objects.
          </p>
          <pre className="max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <code>
              {JSON.stringify(
                {
                  ...data,
                  document: data.document
                    ? (typeof window !== "undefined" && data.document instanceof window.File)
                      ? {
                          name: data.document.name,
                          size: data.document.size,
                          type: data.document.type,
                        }
                      : data.document
                    : null,
                },
                null,
                2,
              )}
            </code>
          </pre>
        </div>
      ),
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Document Upload</CardTitle>
        <CardDescription>Drag-and-drop file upload with validation</CardDescription>
      </CardHeader>
      <CardContent>
        <Form schema={documentSchema} onSubmit={handleSubmit}>
          <FormContent>
            <FormFields className="space-y-4" />
            <FormActions className="mt-6">
              <FormReset>Clear</FormReset>
              <FormSubmit>Upload Document</FormSubmit>
            </FormActions>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
