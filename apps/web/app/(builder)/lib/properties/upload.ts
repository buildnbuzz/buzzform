import type { Field } from "@buildnbuzz/buzzform";

export const uploadFieldProperties: Field[] = [
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
                        placeholder: "Upload File",
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
                        name: "hasMany",
                        label: "Multiple Files",
                        description: "Allow uploading multiple files",
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
                        description: "User must upload at least one file",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "number",
                        name: "minFiles",
                        label: "Min Files",
                        description: "Minimum files required (when multiple enabled)",
                        min: 1,
                    },
                    {
                        type: "number",
                        name: "maxFiles",
                        label: "Max Files",
                        description: "Maximum files allowed (when multiple enabled)",
                        min: 1,
                    },
                    {
                        type: "number",
                        name: "maxSize",
                        label: "Max Size (bytes)",
                        description: "Maximum file size in bytes",
                        min: 1,
                        placeholder: "5242880",
                    },
                    {
                        type: "text",
                        name: "ui.accept",
                        label: "Accept",
                        description: "MIME types to accept (e.g., image/*)",
                        placeholder: "image/*",
                    },
                ],
            },
            {
                label: "Style",
                fields: [
                    {
                        type: "select",
                        name: "ui.variant",
                        label: "Variant",
                        description: "Visual style variant",
                        options: [
                            { label: "Dropzone", value: "dropzone" },
                            { label: "Avatar", value: "avatar" },
                            { label: "Inline", value: "inline" },
                            { label: "Gallery", value: "gallery" },
                        ],
                    },
                    {
                        type: "select",
                        name: "ui.shape",
                        label: "Shape",
                        description: "Shape for avatar variant",
                        options: [
                            { label: "Circle", value: "circle" },
                            { label: "Square", value: "square" },
                            { label: "Rounded", value: "rounded" },
                        ],
                    },
                    {
                        type: "select",
                        name: "ui.size",
                        label: "Size",
                        description: "Size preset",
                        options: [
                            { label: "Extra Small", value: "xs" },
                            { label: "Small", value: "sm" },
                            { label: "Medium", value: "md" },
                            { label: "Large", value: "lg" },
                            { label: "Extra Large", value: "xl" },
                        ],
                    },
                    {
                        type: "switch",
                        name: "ui.showProgress",
                        label: "Show Progress",
                        description: "Display upload progress bar",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "text",
                        name: "ui.dropzoneText",
                        label: "Dropzone Text",
                        description: "Custom text for dropzone",
                        placeholder: "Drop files here or click to upload",
                    },
                ],
            },
        ],
    },
];

