import type { Field } from "@buildnbuzz/form-core";
import {
  baseDataProperties,
  baseStateProperties,
  baseLayoutProperties,
} from "./base";

/**
 * Property editor schema for Upload fields.
 */
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
          ...baseDataProperties,
          {
            type: "select",
            name: "ui.variant",
            label: "Layout Variant",
            description: "Visual representation of the upload field",
            options: [
              { label: "Dropzone", value: "dropzone" },
              { label: "Avatar", value: "avatar" },
              { label: "Inline", value: "inline" },
              { label: "Gallery", value: "gallery" },
            ],
            defaultValue: "dropzone",
          },
          {
            type: "select",
            name: "ui.shape",
            label: "Preview Shape",
            description: "Thumbnail/Avatar shape preset",
            options: [
              { label: "Rounded", value: "rounded" },
              { label: "Square", value: "square" },
              { label: "Circle", value: "circle" },
            ],
            defaultValue: "rounded",
          },
          {
            type: "select",
            name: "ui.size",
            label: "Avatar Size",
            description: "Dimensions for the avatar variant",
            options: [
              { label: "Extra Small", value: "xs" },
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
              { label: "Extra Large", value: "xl" },
            ],
            defaultValue: "md",
          },
          {
            type: "text",
            name: "ui.accept",
            label: "Accepted Formats",
            description: "Comma-separated MIME types or file extensions (e.g. image/*, .pdf)",
            placeholder: "image/*, .pdf",
          },
          {
            type: "text",
            name: "ui.dropzoneText",
            label: "Custom Dropzone Text",
            description: "Placeholder text shown in the dropzone area",
            placeholder: "Drag and drop or click to upload",
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
            description: "User must upload at least one file",
            ui: { alignment: "between" },
          },
          {
            type: "checkbox",
            name: "hasMany",
            label: "Allow Multiple Files",
            description: "Enable dragging/selecting multiple files",
            ui: { alignment: "between" },
          },
          {
            type: "number",
            name: "min",
            label: "Min Files",
            description: "Minimum number of files required (when Multiple enabled)",
            min: 0,
            condition: {
              $when: { $data: "../hasMany", eq: true },
              $then: true,
              $else: false,
            },
          },
          {
            type: "number",
            name: "max",
            label: "Max Files",
            description: "Maximum number of files allowed (when Multiple enabled)",
            min: 1,
            condition: {
              $when: { $data: "../hasMany", eq: true },
              $then: true,
              $else: false,
            },
          },
          {
            type: "number",
            name: "maxSize",
            label: "Max File Size (Bytes)",
            description: "Maximum size allowed per file in bytes (e.g. 10485760 for 10MB)",
            min: 1,
            placeholder: "10485760",
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
