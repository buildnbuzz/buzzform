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

const API_BASE = "https://countriesnow.space/api/v0.1/countries";

/** Response shape for the countries endpoint. */
interface CountryEntry {
  iso2: string;
  country: string;
  cities: string[];
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
    console.log("[listCountries] Fetching from:", API_BASE);
    try {
      const response = await fetch(API_BASE);
      console.log("[listCountries] Response status:", response.status, response.ok);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const json = await response.json();
      console.log("[listCountries] JSON keys:", Object.keys(json));
      console.log("[listCountries] data length:", json.data?.length);
      console.log("[listCountries] first entry:", json.data?.[0]);
      const countries = json.data as CountryEntry[];

      const result = countries
        .map((c) => ({
          label: c.country,
          value: c.country,
        }))
        .sort((a: { label: string }, b: { label: string }) =>
          a.label.localeCompare(b.label),
        );
      console.log("[listCountries] Returning", result.length, "options. First 3:", result.slice(0, 3));
      return result;
    } catch (error) {
      console.error("[listCountries] FAILED:", error);
      toast.error("Could not fetch countries. Check your network connection.");
      return [];
    }
  },

  listStates: async ({ data }) => {
    const country = data.country as string;
    console.log("[listStates] Called with country:", country);
    if (!country) return [];

    const url = `${API_BASE}/states/q?country=${encodeURIComponent(country)}`;
    console.log("[listStates] Fetching from:", url);
    try {
      const response = await fetch(url);
      console.log("[listStates] Response status:", response.status, response.ok);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const json = await response.json();
      console.log("[listStates] JSON keys:", Object.keys(json));
      console.log("[listStates] states count:", json.data?.states?.length);
      const states = json.data.states as StateEntry[];

      const result = states.map((s) => ({
        label: s.name,
        value: s.name,
      }));
      console.log("[listStates] Returning", result.length, "options");
      return result;
    } catch (error) {
      console.error("[listStates] FAILED:", error);
      toast.error("Could not fetch states. Check your network connection.");
      return [];
    }
  },

  listCities: async ({ data }) => {
    const country = data.country as string;
    const state = data.state as string;
    console.log("[listCities] Called with country:", country, "state:", state);
    if (!country || !state) return [];

    const url = `${API_BASE}/state/cities/q?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}`;
    console.log("[listCities] Fetching from:", url);
    try {
      const response = await fetch(url);
      console.log("[listCities] Response status:", response.status, response.ok);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const json = await response.json();
      console.log("[listCities] cities count:", json.data?.length);
      const cities = json.data as string[];

      const result = cities.map((city) => ({
        label: city,
        value: city,
      }));
      console.log("[listCities] Returning", result.length, "options");
      return result;
    } catch (error) {
      console.error("[listCities] FAILED:", error);
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
