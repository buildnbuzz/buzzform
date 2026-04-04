import type { Field } from "@buildnbuzz/form-core";

/** Property editor config for form-level settings. */
export const formSettingsProperties: Field[] = [
  {
    type: "tabs",
    ui: { variant: "line", spacing: "lg" },
    tabs: [
      {
        label: "General",
        fields: [
          { type: "text", name: "title", label: "Form Title", description: "Human-readable title for the form" },
          { type: "textarea", name: "description", label: "Description", description: "Brief description of what the form collects"},
        ],
      },
      {
        label: "Output",
        fields: [
          { type: "select", name: "output.type", label: "Output Type", options: [{ label: "Path-keyed", value: "path" }], defaultValue: "path" },
          { type: "select", name: "output.delimiter", label: "Delimiter", options: [{ label: "Dot (.)", value: "." }, { label: "Dash (-)", value: "-" }, { label: "Underscore (_)", value: "_" }], defaultValue: "." },
        ],
      },
    ],
  },
];
