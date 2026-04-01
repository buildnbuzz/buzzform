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
import { defineSchema, type InferType } from "@buildnbuzz/form-core";

// Hotel booking form with date pickers and time selection
const bookingSchema = defineSchema({
  fields: [
    {
      type: "row",
      ui: { gap: 16, responsive: true },
      fields: [
        {
          type: "date",
          name: "checkIn",
          label: "Check In",
          required: true,
          ui: {
            presets: true,
          },
        },
        {
          type: "date",
          name: "checkOut",
          label: "Check Out",
          required: true,
        },
      ],
    },
    {
      type: "date",
      withTime: true,
      name: "arrivalTime",
      label: "Expected Arrival Time",
      description: "Let us know when to expect you",
      required: true,
      ui: {
        timePicker: {
          interval: 30,
          use24hr: false,
        },
      },
    },
    {
      type: "row",
      ui: { gap: 16, responsive: true },
      fields: [
        {
          type: "number",
          name: "adults",
          label: "Adults",
          required: true,
          min: 1,
          max: 6,
          defaultValue: 2,
        },
        {
          type: "number",
          name: "children",
          label: "Children",
          min: 0,
          max: 4,
          defaultValue: 0,
        },
      ],
    },
    {
      type: "select",
      name: "roomType",
      label: "Room Type",
      required: true,
      options: [
        { value: "standard", label: "Standard Room" },
        { value: "deluxe", label: "Deluxe Room" },
        { value: "suite", label: "Executive Suite" },
        { value: "penthouse", label: "Penthouse" },
      ],
      defaultValue: "standard",
    },
    {
      type: "textarea",
      name: "specialRequests",
      label: "Special Requests",
      placeholder: "Any special requests or preferences...",
    },
  ],
});

type BookingSchema = InferType<typeof bookingSchema.fields>;

export default function BookingForm() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Book Your Stay</CardTitle>
        <CardDescription>
          Date pickers with presets and time selection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={bookingSchema}
          defaultValues={{
            checkIn: new Date(),
            checkOut: new Date(new Date().setDate(new Date().getDate() + 2)),
            arrivalTime: new Date(),
            adults: 2,
            roomType: "standard",
          }}
          onSubmit={async ({ value }) => {
            const data = value as BookingSchema;
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast("Booking Request Sent!", {
              description: (
                <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-zinc-950 p-3 text-xs">
                  <code>{JSON.stringify(data, null, 2)}</code>
                </pre>
              ),
            });
          }}
        >
          <FormContent>
            <FormFields />
            <div className="flex justify-end pt-4">
              <FormSubmit>Request Booking</FormSubmit>
            </div>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
