import type {
  FieldRegistry,
  FieldRegistrySidebar,
  IconMetadata,
} from "./types";
import { textFieldProperties } from "./field-properties/text";
import { emailFieldProperties } from "./field-properties/email";
import { passwordFieldProperties } from "./field-properties/password";
import { textareaFieldProperties } from "./field-properties/textarea";
import { numberFieldProperties } from "./field-properties/number";
import { checkboxFieldProperties } from "./field-properties/checkbox";
import { switchFieldProperties } from "./field-properties/switch";
import { selectFieldProperties } from "./field-properties/select";
import { radioFieldProperties } from "./field-properties/radio";
import { dateFieldProperties } from "./field-properties/date";
import { tagsFieldProperties } from "./field-properties/tags";
import { groupFieldProperties } from "./field-properties/group";
import { arrayFieldProperties } from "./field-properties/array";
import { rowFieldProperties } from "./field-properties/row";
import { tabsFieldProperties } from "./field-properties/tabs";
import { collapsibleFieldProperties } from "./field-properties/collapsible";
import { uploadFieldProperties } from "./field-properties/upload";

/**
 * The default field registry for the form builder.
 * Includes all standard input and layout fields.
 *
 * Categories:
 * - Inputs: Simple text-based data entry.
 * - Selection: Picking from predefined options.
 * - Containers: Structural fields that contain other data fields.
 * - Layout: Visual organization fields (non-data).
 */
export const DEFAULT_FIELD_REGISTRY: FieldRegistry<IconMetadata, never> = {
  text: {
    kind: "data",
    sidebar: {
      label: "Text",
      category: "Inputs",
    },
    defaultProps: { type: "text", label: "Text Field" },
    properties: textFieldProperties,
  },
  email: {
    kind: "data",
    sidebar: {
      label: "Email",
      category: "Inputs",
    },
    defaultProps: { type: "email", label: "Email Address" },
    properties: emailFieldProperties,
  },
  password: {
    kind: "data",
    sidebar: {
      label: "Password",
      category: "Inputs",
    },
    defaultProps: { type: "password", label: "Password" },
    properties: passwordFieldProperties,
  },
  textarea: {
    kind: "data",
    sidebar: {
      label: "Textarea",
      category: "Inputs",
    },
    defaultProps: { type: "textarea", label: "Long Message" },
    properties: textareaFieldProperties,
  },
  number: {
    kind: "data",
    sidebar: {
      label: "Number",
      category: "Inputs",
    },
    defaultProps: { type: "number", label: "Quantity" },
    properties: numberFieldProperties,
  },
  upload: {
    kind: "data",
    sidebar: {
      label: "Upload",
      category: "Inputs",
    },
    defaultProps: { type: "upload", label: "Upload File" },
    properties: uploadFieldProperties,
  },
  checkbox: {
    kind: "data",
    sidebar: {
      label: "Checkbox",
      category: "Selection",
    },
    defaultProps: { type: "checkbox", label: "Option" },
    properties: checkboxFieldProperties,
  },
  switch: {
    kind: "data",
    sidebar: {
      label: "Switch",
      category: "Selection",
    },
    defaultProps: { type: "switch", label: "Enabled" },
    properties: switchFieldProperties,
  },
  select: {
    kind: "data",
    sidebar: {
      label: "Select",
      category: "Selection",
    },
    defaultProps: { type: "select", label: "Choose Option" },
    properties: selectFieldProperties,
  },
  radio: {
    kind: "data",
    sidebar: {
      label: "Radio",
      category: "Selection",
    },
    defaultProps: { type: "radio", label: "Choose One" },
    properties: radioFieldProperties,
  },
  date: {
    kind: "data",
    sidebar: {
      label: "Date",
      category: "Selection",
    },
    defaultProps: { type: "date", label: "Pick Date" },
    properties: dateFieldProperties,
  },
  tags: {
    kind: "data",
    sidebar: {
      label: "Tags",
      category: "Selection",
    },
    defaultProps: { type: "tags", label: "Select Tags" },
    properties: tagsFieldProperties,
  },
  group: {
    kind: "data",
    sidebar: {
      label: "Group",
      category: "Containers",
    },
    defaultProps: { type: "group", label: "Nested Group", fields: [] },
    properties: groupFieldProperties,
  },
  array: {
    kind: "data",
    sidebar: {
      label: "Array",
      category: "Containers",
    },
    defaultProps: { type: "array", label: "Item List", fields: [] },
    properties: arrayFieldProperties,
  },
  row: {
    kind: "layout",
    sidebar: {
      label: "Row",
      category: "Layout",
    },
    defaultProps: { type: "row", fields: [] },
    properties: rowFieldProperties,
  },
  tabs: {
    kind: "layout",
    sidebar: {
      label: "Tabs",
      category: "Layout",
    },
    defaultProps: { type: "tabs", tabs: [] },
    properties: tabsFieldProperties,
  },
  collapsible: {
    kind: "layout",
    sidebar: {
      label: "Collapsible",
      category: "Layout",
    },
    defaultProps: {
      type: "collapsible",
      label: "Collapsible Section",
      fields: [],
    },
    properties: collapsibleFieldProperties,
  },
};

/**
 * A simplified version of a registry entry for sidebar display.
 */
export interface SidebarItem<
  TIcon = unknown,
> extends FieldRegistrySidebar<TIcon> {
  type: string;
}

/**
 * Groups registry items by their category for display in the builder sidebar.
 *
 * @param registry - The field registry to group.
 * @returns A record of categorized sidebar items.
 */
export function getSidebarGroups<TIcon, TRenderer>(
  registry: FieldRegistry<TIcon, TRenderer>,
): Record<string, SidebarItem<TIcon>[]> {
  const groups: Record<string, SidebarItem<TIcon>[]> = {};

  for (const [type, entry] of Object.entries(registry)) {
    if (!entry) continue;

    const { category } = entry.sidebar;
    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push({
      type,
      ...entry.sidebar,
    });
  }

  return groups;
}
