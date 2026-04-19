import type { Field } from "@buildnbuzz/form-core";
import { baseDataProperties, baseStateProperties, baseLayoutProperties } from "./base";

/**
 * Property editor schema for Password fields.
 */
export const passwordFieldProperties: Field[] = [
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
            placeholder: "········",
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
            description: "Default is 8",
            min: 0,
            defaultValue: 8,
          },
          {
            type: "checkbox",
            name: "criteria.requireUppercase",
            label: "Require Uppercase",
            ui: { alignment: "between" },
          },
          {
            type: "checkbox",
            name: "criteria.requireLowercase",
            label: "Require Lowercase",
            ui: { alignment: "between" },
          },
          {
            type: "checkbox",
            name: "criteria.requireNumber",
            label: "Require Number",
            ui: { alignment: "between" },
          },
          {
            type: "checkbox",
            name: "criteria.requireSpecial",
            label: "Require Special Character",
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
