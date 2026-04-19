import type { Field } from "@buildnbuzz/form-core";
import { baseDataProperties, baseStateProperties, baseLayoutProperties } from "./base";

/**
 * Property editor schema for Array fields.
 * Supports both standard (nested) and primitive (flat) modes.
 */
export const arrayFieldProperties: Field[] = [
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
            name: "primitive",
            label: "Primitive Mode",
            description: "Store items as flat values (e.g. strings) instead of objects",
            ui: { alignment: "between" },
          },
          ...baseStateProperties,
        ],
      },
      {
        label: "Validation",
        fields: [
          {
            type: "number",
            name: "minItems",
            label: "Min Items",
            min: 0,
          },
          {
            type: "number",
            name: "maxItems",
            label: "Max Items",
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
