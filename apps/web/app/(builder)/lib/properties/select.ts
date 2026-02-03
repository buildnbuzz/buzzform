import type { Field } from "@buildnbuzz/buzzform";

export const selectFieldProperties: Field[] = [
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
                        placeholder: "Select Option",
                    },
                    {
                        type: "text",
                        name: "placeholder",
                        label: "Placeholder",
                        description: "Placeholder text inside the field",
                        placeholder: "Choose an option",
                    },
                    {
                        type: "textarea",
                        name: "description",
                        label: "Description",
                        description: "Help text shown below the field",
                        rows: 2,
                    },
                    {
                        type: "array",
                        name: "options",
                        label: "Options",
                        minRows: 1,
                        ui: {
                            isSortable: true,
                            addLabel: "Add Option",
                            rowLabelField: "label",
                        },
                        fields: [
                            {
                                type: "text",
                                name: "label",
                                label: "Label",
                                placeholder: "Option Label",
                                required: true,
                            },
                            {
                                type: "text",
                                name: "value",
                                label: "Value",
                                placeholder: "option_value",
                                required: true,
                            },
                            {
                                type: "textarea",
                                name: "description",
                                label: "Description",
                                placeholder: "Optional description for this option",
                                rows: 2,
                            },
                        ],
                    },
                    {
                        type: "switch",
                        name: "hasMany",
                        label: "Multiple Selection",
                        description: "Allow selecting multiple options",
                        ui: { alignment: "between" },
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
                        description: "User must select an option",
                        ui: { alignment: "between" },
                    },
                ],
            },
            {
                label: "Style",
                fields: [
                    {
                        type: "switch",
                        name: "ui.isSearchable",
                        label: "Searchable",
                        description: "Enable search/filter functionality",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "switch",
                        name: "ui.isClearable",
                        label: "Clearable",
                        description: "Show clear button to reset selection",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "number",
                        name: "ui.maxVisibleChips",
                        label: "Max Visible Chips",
                        description: "Maximum chips shown (for multiple selection)",
                        min: 1,
                    },
                    {
                        type: "text",
                        name: "ui.emptyMessage",
                        label: "Empty Message",
                        description: "Message when no options available",
                        placeholder: "No options available",
                    },
                    {
                        type: "text",
                        name: "ui.loadingMessage",
                        label: "Loading Message",
                        description: "Message while loading options",
                        placeholder: "Loading...",
                    },
                ],
            },
        ],
    },
];
