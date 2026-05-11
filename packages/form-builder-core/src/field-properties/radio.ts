import type { Field } from "@buildnbuzz/form-core";
import { baseDataProperties, baseStateProperties, baseLayoutProperties } from "./base";

/**
 * Property editor schema for Radio fields.
 */
export const radioFieldProperties: Field[] = [
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
            name: "defaultValue",
            label: "Default Value",
          },
          ...baseStateProperties,
        ],
      },
      {
        label: "Options",
        fields: [
          {
            type: "array",
            name: "options",
            label: "Options",
            fields: [
              { type: "text", name: "label", label: "Label", placeholder: "Option Label" },
              { type: "text", name: "value", label: "Value", placeholder: "option_value" },
            ],
          },
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
        ],
      },
      {
        label: "Style",
        fields: [...baseLayoutProperties],
      },
    ],
  },
];
