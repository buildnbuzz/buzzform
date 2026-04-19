import type { Field } from "@buildnbuzz/form-core";
import { baseDataProperties, baseStateProperties, baseLayoutProperties } from "./base";

/**
 * Property editor schema for Tags fields.
 */
export const tagsFieldProperties: Field[] = [
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
            name: "allowDuplicates",
            label: "Allow Duplicates",
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
            type: "number",
            name: "minTags",
            label: "Min Items",
            min: 0,
          },
          {
            type: "number",
            name: "maxTags",
            label: "Max Items",
            min: 1,
          },
          {
            type: "number",
            name: "maxTagLength",
            label: "Max Tag Length",
            min: 1,
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
