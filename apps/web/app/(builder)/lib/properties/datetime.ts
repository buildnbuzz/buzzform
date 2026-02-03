import type { Field } from "@buildnbuzz/buzzform";

export const datetimeFieldProperties: Field[] = [
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
                        placeholder: "Date & Time",
                    },
                    {
                        type: "text",
                        name: "placeholder",
                        label: "Placeholder",
                        description: "Placeholder text inside the field",
                        placeholder: "Select date and time",
                    },
                    {
                        type: "textarea",
                        name: "description",
                        label: "Description",
                        description: "Help text shown below the field",
                        rows: 2,
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
                        description: "User must select a date and time",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "datetime",
                        name: "minDate",
                        label: "Min Date",
                        description: "Minimum allowed date (ISO format or relative)",
                        placeholder: "2024-01-01T00:00:00",
                    },
                    {
                        type: "datetime",
                        name: "maxDate",
                        label: "Max Date",
                        description: "Maximum allowed date (ISO format or relative)",
                        placeholder: "2024-12-31T23:59:59",
                    },
                ],
            },
            {
                label: "Style",
                fields: [
                    {
                        type: "text",
                        name: "ui.format",
                        label: "Display Format",
                        description: "Date/time format for display (date-fns format)",
                        placeholder: "MMM dd, yyyy HH:mm",
                    },
                    {
                        type: "text",
                        name: "ui.inputFormat",
                        label: "Input Format",
                        description: "Format for manual input",
                        placeholder: "MM/dd/yyyy HH:mm",
                    },
                    {
                        type: "switch",
                        name: "ui.timePicker",
                        label: "Enable Time Picker",
                        description: "Show time picker component",
                        ui: { alignment: "between" },
                        defaultValue: true,
                    },
                    {
                        type: "switch",
                        name: "ui.presets",
                        label: "Show Presets",
                        description: "Display quick datetime presets",
                        ui: { alignment: "between" },
                    },
                ],
            },
        ],
    },
];
