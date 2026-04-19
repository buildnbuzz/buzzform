import type { Field } from "@buildnbuzz/form-core";
import { baseDataProperties, baseStateProperties, baseLayoutProperties } from "./base";

/**
 * Property editor schema for Number fields.
 */
export const numberFieldProperties: Field[] = [
  {
    type: "tabs",
    ui: { variant: "line", spacing: "lg" },
    tabs: [
      {
        label: "General",
        fields: [
          ...baseDataProperties,
          {
            type: "text",
            name: "placeholder",
            label: "Placeholder",
          },
          {
            type: "number",
            name: "defaultValue",
            label: "Default Value",
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
            type: "number",
            name: "min",
            label: "Min Value",
            description: "Minimum numeric value allowed",
          },
          {
            type: "number",
            name: "max",
            label: "Max Value",
            description: "Maximum numeric value allowed",
          },
          {
            type: "number",
            name: "precision",
            label: "Precision",
            description: "Max number of decimal places",
            min: 0,
          },
          {
            type: "number",
            name: "step",
            label: "Step",
            description: "Incremental step value",
            min: 0,
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
