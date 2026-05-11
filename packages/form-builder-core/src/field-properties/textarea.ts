import type { Field } from "@buildnbuzz/form-core";
import { baseDataProperties, baseStateProperties, baseLayoutProperties } from "./base";

/**
 * Property editor schema for Textarea fields.
 */
export const textareaFieldProperties: Field[] = [
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
            type: "textarea",
            name: "defaultValue",
            label: "Default Value",
            ui: { rows: 3 },
          },
          {
            type: "number",
            name: "ui.rows",
            label: "Rows",
            description: "Number of visible text lines",
            min: 1,
            defaultValue: 3,
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
            name: "minLength",
            label: "Min Length",
            min: 0,
          },
          {
            type: "number",
            name: "maxLength",
            label: "Max Length",
            min: 1,
          },
          {
            type: "checkbox",
            name: "trim",
            label: "Trim",
            description: "Remove leading/trailing spaces on blur",
            ui: { alignment: "between", expressionMode: "none" },
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
