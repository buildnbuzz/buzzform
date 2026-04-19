import type { Field } from "@buildnbuzz/form-core";
import {
  baseDataProperties,
  baseStateProperties,
  baseLayoutProperties,
} from "./base";

/**
 * Property editor schema for Text fields.
 */
export const textFieldProperties: Field[] = [
  {
    type: "tabs",
    ui: {
      variant: "line",
      spacing: "lg",
    },
    tabs: [
      {
        label: "General",
        fields: [
          ...baseDataProperties,
          {
            type: "text",
            name: "placeholder",
            label: "Placeholder",
            description: "Placeholder text inside the field",
          },
          {
            type: "text",
            name: "defaultValue",
            label: "Default Value",
            description: "Initial value when the form loads",
            placeholder: "Enter default value",
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
            description: "User must fill this field",
            ui: { alignment: "between" },
          },
          {
            type: "number",
            name: "minLength",
            label: "Min Length",
            description: "Minimum number of characters",
            min: 0,
          },
          {
            type: "number",
            name: "maxLength",
            label: "Max Length",
            description: "Maximum number of characters",
            min: 1,
          },
          {
            type: "text",
            name: "pattern",
            label: "Pattern",
            description: "Regular expression to match against (e.g. ^[A-Z].*)",
          },
          {
            type: "checkbox",
            name: "trim",
            label: "Trim",
            description: "Remove leading/trailing spaces on blur",
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
