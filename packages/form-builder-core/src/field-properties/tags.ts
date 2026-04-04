import type { Field } from "@buildnbuzz/form-core";

/** Property editor config for `tags` fields. */
export const tagsFieldProperties: Field[] = [
  {
    type: "tabs",
    ui: { variant: "line", spacing: "lg" },
    tabs: [
      {
        label: "General",
        fields: [
          { type: "text", name: "name", label: "Name", description: "Used as the key in form data (no spaces)", required: true },
          { type: "text", name: "label", label: "Label", description: "Display label shown above the field" },
          { type: "textarea", name: "description", label: "Description", description: "Help text shown below the field"},
          { type: "text", name: "defaultValue", label: "Default Value", description: "Comma-separated initial tags", placeholder: "tag1, tag2" },
          { type: "switch", name: "allowDuplicates", label: "Allow Duplicates", description: "Allow the same tag to be added multiple times", ui: { alignment: "between" } },
          { type: "number", name: "maxTagLength", label: "Max Tag Length", description: "Maximum characters per tag", min: 1 },
          { type: "switch", name: "hidden", label: "Hidden", description: "Hide this field from the form", ui: { alignment: "between" } },
          { type: "switch", name: "disabled", label: "Disabled", description: "Prevent user interaction", ui: { alignment: "between" } },
          { type: "switch", name: "readOnly", label: "Read Only", description: "Display value but prevent editing", ui: { alignment: "between" } },
        ],
      },
      {
        label: "Validation",
        fields: [
          { type: "switch", name: "required", label: "Required", description: "User must add at least one tag", ui: { alignment: "between" } },
          { type: "number", name: "minTags", label: "Min Tags", description: "Minimum number of tags", min: 0 },
          { type: "number", name: "maxTags", label: "Max Tags", description: "Maximum number of tags", min: 1 },
        ],
      },
    ],
  },
];
