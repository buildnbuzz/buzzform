import type { Field } from "@buildnbuzz/form-core";
import { baseDataProperties, baseStateProperties, baseLayoutProperties } from "./base";

/**
 * Property editor schema for Date fields.
 */
export const dateFieldProperties: Field[] = [
  {
    type: "tabs",
    ui: { variant: "line", spacing: "lg" },
    tabs: [
      {
        label: "General",
        fields: [
          ...baseDataProperties,
          {
            type: "checkbox",
            name: "withTime",
            label: "Include Time",
            description: "Enable the time picker alongside the date picker",
            ui: { alignment: "between" },
          },
          ...baseStateProperties,
        ],
      },
      {
        label: "Validation",
        fields: [
          {
            type: "checkbox",
            name: "required",
            label: "Required",
            ui: { alignment: "between" },
          },
          {
            type: "text",
            name: "minDate",
            label: "Min Date",
            description: "ISO date string (YYYY-MM-DD)",
            placeholder: "2024-01-01",
          },
          {
            type: "text",
            name: "maxDate",
            label: "Max Date",
            description: "ISO date string (YYYY-MM-DD)",
            placeholder: "2024-12-31",
          },
        ],
      },
      {
        label: "Style",
        fields: [...baseLayoutProperties],
      },
    ],
  },
];
