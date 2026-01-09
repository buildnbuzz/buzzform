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

// Hotel booking form with date pickers and time selection
const bookingSchema = createSchema([
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
        style: { width: "50%" },
      },
      {
        type: "date",
        name: "checkOut",
        label: "Check Out",
        required: true,
        style: { width: "50%" },
      },
    ],
  },
  {
    type: "datetime",
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
        style: { width: "50%" },
      },
      {
        type: "number",
        name: "children",
        label: "Children",
        min: 0,
        max: 4,
        defaultValue: 0,
        style: { width: "50%" },
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
    rows: 2,
  },
]);

export function BookingForm() {
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
          defaultValues={
            {
              checkIn: new Date(),
              checkOut: new Date(new Date().setDate(new Date().getDate() + 2)),
              arrivalTime: new Date(),
            } as Record<string, unknown>
          }
          onSubmit={async (data) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast("Booking Request Sent!", {
              description: (
                <ToastCodeBlock code={JSON.stringify(data, null, 2)} />
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
