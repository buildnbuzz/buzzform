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

const gallerySchema = defineSchema({
  fields: [
    {
      type: "upload",
      name: "images",
      label: "Product Images",
      description: "Upload up to 6 product images",
      hasMany: true,
      max: 6,
      ui: {
        variant: "gallery",
        accept: "image/*",
        shape: "rounded",
      },
    },
  ],
});

type GallerySchema = InferType<typeof gallerySchema.fields>;

export default function GalleryUploadForm() {
  const handleSubmit = async ({ value }: { value: unknown }) => {
    const data = value as GallerySchema;
    await new Promise((r) => setTimeout(r, 1000));

    const filesInfo = Array.isArray(data.images)
      ? data.images.map((img) =>
          img instanceof File
            ? { name: img.name, size: img.size, type: img.type }
            : img,
        )
      : [];

    toast("Images saved!", {
      description: (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground">
            Check the console for the full File objects.
          </p>
          <pre className="max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <code>{JSON.stringify({ ...data, images: filesInfo }, null, 2)}</code>
          </pre>
        </div>
      ),
    });
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Product Gallery</CardTitle>
        <CardDescription>Multi-file upload with thumbnail grid preview</CardDescription>
      </CardHeader>
      <CardContent>
        <Form schema={gallerySchema} onSubmit={handleSubmit}>
          <FormContent>
            <FormFields className="space-y-4" />
            <FormActions className="mt-6">
              <FormReset>Clear</FormReset>
              <FormSubmit>Save Images</FormSubmit>
            </FormActions>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
