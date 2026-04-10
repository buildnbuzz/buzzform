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
import {
  defineSchema,
  defineOptionResolvers,
  type InferType,
} from "@buildnbuzz/form-react";

const API_BASE = "https://countriesnow.space/api/v0.1";

/** Response shape for the countries endpoint. */
interface CountryEntry {
  iso2: string;
  country: string;
}

/** Response shape for the states endpoint. */
interface StateEntry {
  name: string;
  state_code: string;
}

/**
 * 1. Define Option Resolvers using the registry helper.
 *
 * Uses the CountriesNow API (free, no API key, CORS-friendly):
 * - Countries: GET /api/v0.1/countries
 * - States:    GET /api/v0.1/countries/states/q?country=X
 * - Cities:    GET /api/v0.1/countries/state/cities/q?country=X&state=Y
 */
const locationResolvers = defineOptionResolvers({
  listCountries: async () => {
    try {
      const response = await fetch(`${API_BASE}/countries`);
      if (!response.ok) {
        toast.error("Could not fetch countries. Please try again later.");
        return [];
      }

      const json = await response.json();
      const countries = json.data as CountryEntry[];

      return countries
        .map((c) => ({
          label: c.country,
          value: c.country,
        }))
        .filter(
          (opt, i, arr) => arr.findIndex((o) => o.value === opt.value) === i,
        )
        .sort((a: { label: string }, b: { label: string }) =>
          a.label.localeCompare(b.label),
        );
    } catch {
      toast.error("Could not fetch countries. Check your network connection.");
      return [];
    }
  },

  listStates: async ({ data }) => {
    const country = data.country as string;
    if (!country) return [];

    const url = `${API_BASE}/countries/states/q?country=${encodeURIComponent(country)}`;
    try {
      const response = await fetch(url, { redirect: "follow" });
      if (!response.ok) {
        toast.error(`Could not fetch states for ${country}. Please try again.`);
        return [];
      }

      const json = await response.json();
      const states = json.data.states as StateEntry[];

      return states
        .map((s) => ({
          label: s.name,
          value: s.name,
        }))
        .filter(
          (opt, i, arr) => arr.findIndex((o) => o.value === opt.value) === i,
        );
    } catch {
      toast.error("Could not fetch states. Check your network connection.");
      return [];
    }
  },

  listCities: async ({ data }) => {
    const country = data.country as string;
    const state = data.state as string;
    if (!country || !state) return [];

    const url = `${API_BASE}/countries/state/cities/q?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        toast.error(
          `Could not fetch cities for ${state}, ${country}. Please try again.`,
        );
        return [];
      }

      const json = await response.json();
      const cities = json.data as string[];

      return cities
        .map((city) => ({
          label: city,
          value: city,
        }))
        .filter(
          (opt, i, arr) => arr.findIndex((o) => o.value === opt.value) === i,
        );
    } catch {
      toast.error("Could not fetch cities. Check your network connection.");
      return [];
    }
  },
});

// 2. Define the Schema using registry keys
const locationSchema = defineSchema({
  fields: [
    {
      type: "select",
      name: "country",
      label: "Country",
      placeholder: "Search and select a country...",
      required: true,
      options: { resolver: "listCountries" },
    },
    {
      type: "select",
      name: "state",
      label: "State / Province",
      placeholder: "Select a state...",
      required: true,
      options: { resolver: "listStates" },
      dependencies: ["/country"],
      disabled: { $data: "/country", not: true },
      ui: {
        emptyMessage: "No states found for this country",
      },
    },
    {
      type: "select",
      name: "city",
      label: "City",
      placeholder: "Select a city...",
      required: true,
      options: { resolver: "listCities" },
      dependencies: ["/country", "/state"],
      disabled: { $data: "/state", not: true },
      ui: {
        emptyMessage: "No cities found for this state",
      },
    },
  ],
});

type LocationData = InferType<typeof locationSchema.fields>;

/**
 * Example demonstrating 3-level cascading dropdowns (Country → State → City)
 * using the Registry-based Options API with the CountriesNow REST API.
 */
export default function CountryStateForm() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Location Selector</CardTitle>
        <CardDescription>
          3-level cascading dropdowns powered by CountriesNow API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={locationSchema}
          optionResolvers={locationResolvers}
          onSubmit={async ({ value }) => {
            const data = value as LocationData;
            await new Promise((resolve) => setTimeout(resolve, 800));
            toast("Location Saved!", {
              description: (
                <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted text-muted-foreground p-3 text-xs">
                  <code>{JSON.stringify(data, null, 2)}</code>
                </pre>
              ),
            });
          }}
        >
          <FormContent>
            <FormFields className="space-y-4" />
            <div className="flex justify-end pt-4">
              <FormSubmit>Save Location</FormSubmit>
            </div>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
