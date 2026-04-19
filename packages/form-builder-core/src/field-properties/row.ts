import type { Field } from "@buildnbuzz/form-core";

/**
 * Property editor schema for Row layout containers.
 * Layout fields do not have data properties (name, label, etc.).
 */
export const rowFieldProperties: Field[] = [
  {
    type: "tabs",
    ui: { variant: "line", spacing: "lg" },
    tabs: [
      {
        label: "Layout",
        fields: [
          {
            type: "select",
            name: "ui.style.width",
            label: "Width",
            options: [
              { label: "Auto", value: "auto" },
              { label: "50%", value: "50%" },
              { label: "100%", value: "100%" },
            ],
            defaultValue: "100%",
          },
          {
            type: "number",
            name: "ui.spacing",
            label: "Spacing",
            description: "Gap between fields (px)",
            min: 0,
            defaultValue: 16,
          },
          {
            type: "checkbox",
            name: "hidden",
            label: "Hidden",
            ui: { alignment: "between" },
          },
        ],
      },
    ],
  },
];
