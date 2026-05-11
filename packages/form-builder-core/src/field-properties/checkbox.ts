import type { Field } from "@buildnbuzz/form-core";
import {
  baseDataProperties,
  baseStateProperties,
  baseLayoutProperties,
} from "./base";

/**
 * Property editor schema for Checkbox fields.
 * Supports:
 * - Single boolean (default)
 * - Tri-state (null/true/false)
 * - Multi-select Group (hasMany: true)
 */
export const checkboxFieldProperties: Field[] = [
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
            name: "hasMany",
            label: "Multiple Selection",
            description: "Enable selecting multiple options as a group",
            ui: { alignment: "between" },
          },
          {
            type: "checkbox",
            name: "tristate",
            label: "Tri-state",
            description: "Cycle between: not set, checked, and unchecked",
            ui: { alignment: "between" },
            // Tristate only makes sense for single checkbox
            hidden: { $data: "hasMany" },
          },
          ...baseStateProperties,
        ],
      },
      {
        label: "Options",
        // Only show options tab if hasMany is enabled
        // hidden: { $data: "hasMany", not: true },
        fields: [
          {
            type: "array",
            name: "options",
            label: "Options",
            fields: [
              {
                type: "text",
                name: "label",
                label: "Label",
                placeholder: "Option Label",
              },
              {
                type: "text",
                name: "value",
                label: "Value",
                placeholder: "option_value",
              },
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
