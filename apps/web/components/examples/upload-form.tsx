"use client";

import { createSchema } from "@buildnbuzz/buzzform";
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
} from "@/components/buzzform/form";

const profileSchema = createSchema([
  {
    type: "upload",
    name: "avatar",
    label: "Profile Picture",
    description: "Upload a profile photo",
    ui: {
      variant: "avatar",
      shape: "square",
      size: "lg",
      accept: "image/*",
    },
  },
  {
    type: "text",
    name: "name",
    label: "Display Name",
    placeholder: "Your name",
    required: true,
  },
  {
    type: "email",
    name: "email",
    label: "Email",
    placeholder: "you@example.com",
    required: true,
  },
]);

const documentSchema = createSchema([
  {
    type: "upload",
    name: "document",
    label: "Upload Document",
    description: "PDF, Word, or text files (max 10MB)",
    maxSize: 10 * 1024 * 1024,
    ui: {
      variant: "dropzone",
      size: "xs",
      accept: ".pdf,.doc,.docx,.txt",
      showProgress: true,
      dropzoneText: "Drop your document here",
    },
  },
  {
    type: "textarea",
    name: "notes",
    label: "Additional Notes",
    placeholder: "Any notes about this document...",
    rows: 3,
  },
]);

const gallerySchema = createSchema([
  {
    type: "upload",
    name: "images",
    label: "Product Images",
    description: "Upload up to 6 product images",
    hasMany: true,
    maxFiles: 6,
    ui: {
      variant: "gallery",
      accept: "image/*",
      shape: "rounded",
      showProgress: true,
    },
  },
]);

export function ProfileUploadForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Avatar upload with preview</CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={profileSchema}
          onSubmit={async (data) => {
            console.log("Form data:", data);
            await new Promise((r) => setTimeout(r, 1000));
            toast("Profile saved!", {
              description: (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground">
                    Check the console for the full File objects.
                  </p>
                  <pre className="max-h-40 overflow-auto rounded-md bg-zinc-950 p-3 text-xs">
                    <code>{JSON.stringify(data, null, 2)}</code>
                  </pre>
                </div>
              ),
            });
          }}
        >
          <FormContent>
            <FormFields className="space-y-4" />
            <FormSubmit className="mt-6 w-full">Save Profile</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}

export function DocumentUploadForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Upload</CardTitle>
        <CardDescription>Drag-and-drop with progress indicator</CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={documentSchema}
          onSubmit={async (data) => {
            console.log("Form data:", data);
            await new Promise((r) => setTimeout(r, 1000));
            toast("Document uploaded!", {
              description: (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground">
                    Check the console for the full File objects.
                  </p>
                  <pre className="max-h-40 overflow-auto rounded-md bg-zinc-950 p-3 text-xs">
                    <code>{JSON.stringify(data, null, 2)}</code>
                  </pre>
                </div>
              ),
            });
          }}
        >
          <FormContent>
            <FormFields className="space-y-4" />
            <FormSubmit className="mt-6 w-full">Upload Document</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}

export function GalleryUploadForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Gallery</CardTitle>
        <CardDescription>Multi-file upload with thumbnail grid</CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={gallerySchema}
          onSubmit={async (data) => {
            console.log("Form data:", data);
            await new Promise((r) => setTimeout(r, 1000));
            toast("Images saved!", {
              description: (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground">
                    Check the console for the full File objects.
                  </p>
                  <pre className="max-h-40 overflow-auto rounded-md bg-zinc-950 p-3 text-xs">
                    <code>{JSON.stringify(data, null, 2)}</code>
                  </pre>
                </div>
              ),
            });
          }}
        >
          <FormContent>
            <FormFields className="space-y-4" />
            <FormSubmit className="mt-6 w-full">Save Images</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
