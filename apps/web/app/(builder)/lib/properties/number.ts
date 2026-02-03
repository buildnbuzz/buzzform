import type { Field } from "@buildnbuzz/buzzform";

export const numberFieldProperties: Field[] = [
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
                    {
                        type: "text",
                        name: "name",
                        label: "Name",
                        description: "Used as the key in form data (no spaces)",
                        required: true,
                        pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
                        placeholder: "fieldName",
                    },
                    {
                        type: "text",
                        name: "label",
                        label: "Label",
                        description: "Display label shown above the field",
                        placeholder: "Amount",
                    },
                    {
                        type: "text",
                        name: "placeholder",
                        label: "Placeholder",
                        description: "Placeholder text inside the field",
                        placeholder: "0",
                    },
                    {
                        type: "textarea",
                        name: "description",
                        label: "Description",
                        description: "Help text shown below the field",
                        rows: 2,
                    },
                    {
                        type: "number",
                        name: "defaultValue",
                        label: "Default Value",
                        description: "Initial value when the form loads",
                    },
                    {
                        type: "switch",
                        name: "hidden",
                        label: "Hidden",
                        description: "Hide this field from the form",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "switch",
                        name: "disabled",
                        label: "Disabled",
                        description: "Prevent user interaction",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "switch",
                        name: "readOnly",
                        label: "Read Only",
                        description: "Display value but prevent editing",
                        ui: { alignment: "between" },
                    },
                ],
            },
            {
                label: "Validation",
                fields: [
                    {
                        type: "switch",
                        name: "required",
                        label: "Required",
                        description: "User must fill this field",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "number",
                        name: "min",
                        label: "Minimum",
                        description: "Minimum allowed value",
                    },
                    {
                        type: "number",
                        name: "max",
                        label: "Maximum",
                        description: "Maximum allowed value",
                    },
                    {
                        type: "number",
                        name: "precision",
                        label: "Decimal Precision",
                        description: "Number of decimal places",
                        min: 0,
                        max: 10,
                    },
                ],
            },
            {
                label: "Style",
                fields: [
                    {
                        type: "number",
                        name: "ui.step",
                        label: "Step",
                        description: "Increment/decrement step value",
                        min: 0,
                        defaultValue: 1,
                    },
                    {
                        type: "select",
                        name: "ui.variant",
                        label: "Variant",
                        description: "Visual style variant",
                        options: [
                            { label: "Default", value: "default" },
                            { label: "Stacked", value: "stacked" },
                            { label: "Pill", value: "pill" },
                            { label: "Plain", value: "plain" },
                        ],
                    },
                    {
                        type: "text",
                        name: "ui.prefix",
                        label: "Prefix",
                        description: "Text before the number (e.g., $)",
                        placeholder: "$",
                    },
                    {
                        type: "text",
                        name: "ui.suffix",
                        label: "Suffix",
                        description: "Text after the number (e.g., kg, %)",
                        placeholder: "%",
                    },
                    {
                        type: "switch",
                        name: "ui.thousandSeparator",
                        label: "Thousand Separator",
                        description: "Use comma separator for thousands",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "switch",
                        name: "ui.hideSteppers",
                        label: "Hide Steppers",
                        description: "Hide increment/decrement buttons",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "switch",
                        name: "ui.copyable",
                        label: "Copyable",
                        description: "Display a button to copy the value",
                        ui: { alignment: "between" },
                    },
                ],
            },
        ],
    },
];
