import { z } from "zod";
import type { Field } from "@buildnbuzz/buzzform";
import { DefaultValueSelect } from "../../components/properties/default-value-select";

const selectDefaultValueSchema = z
    .union([
        z.string(),
        z.number(),
        z.boolean(),
        z.array(z.union([z.string(), z.number(), z.boolean()])),
    ])
    .optional();

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
                        type: "select",
                        name: "defaultValue",
                        label: "Default Value",
                        description: "Preselect a value",
                        component: DefaultValueSelect,
                        // @ts-expect-error: schema allows undefined but SelectField["defaultValue"] doesn't (will be fixed in package)
                        schema: selectDefaultValueSchema,
                        options: async (context) =>
                            Array.isArray(context?.data?.options)
                                ? context.data.options
                                : [],
                        dependencies: ["options"],
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
                        type: "select",
                        name: "style.width",
                        label: "Width",
                        description: "Field width (useful in rows)",
                        options: [
                            { label: "Auto", value: "auto" },
                            { label: "10%", value: "10%" },
                            { label: "20%", value: "20%" },
                            { label: "25%", value: "25%" },
                            { label: "30%", value: "30%" },
                            { label: "33%", value: "33.33%" },
                            { label: "40%", value: "40%" },
                            { label: "50%", value: "50%" },
                            { label: "60%", value: "60%" },
                            { label: "66%", value: "66.66%" },
                            { label: "70%", value: "70%" },
                            { label: "75%", value: "75%" },
                            { label: "80%", value: "80%" },
                            { label: "90%", value: "90%" },
                            { label: "100%", value: "100%" },
                        ],
                    },
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
