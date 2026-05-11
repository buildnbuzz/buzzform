import type { Field } from "@buildnbuzz/form-core";
import { baseDataProperties, baseStateProperties, baseLayoutProperties } from "./base";

/**
 * Property editor schema for Select fields.
 */
export const selectFieldProperties: Field[] = [
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
            type: "checkbox",
            name: "hasMany",
            label: "Multiple Selection",
            description: "Allow selecting multiple options",
            ui: { alignment: "between", expressionMode: "none" },
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
          {
            type: "number",
            name: "minSelected",
            label: "Min Selected",
            min: 0,
            hidden: { $data: "hasMany", not: true },
          },
          {
            type: "number",
            name: "maxSelected",
            label: "Max Selected",
            min: 1,
            hidden: { $data: "hasMany", not: true },
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
