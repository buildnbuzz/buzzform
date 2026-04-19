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

/**
 * Standard icons used in the sidebar.
 * These are mapped to multiple libraries to support different UI adapters.
 */
export const FIELD_ICONS = {
  text: {
    hugeicons: "TextIcon",
    lucide: "Type",
    tabler: "IconLettersCase",
    phosphor: "TextT",
    remixicon: "RiText",
  },
  email: {
    hugeicons: "Mail01Icon",
    lucide: "Mail",
    tabler: "IconMail",
    phosphor: "Envelope",
    remixicon: "RiMailLine",
  },
  password: {
    hugeicons: "SecurityPasswordIcon",
    lucide: "Lock",
    tabler: "IconLock",
    phosphor: "LockSimple",
    remixicon: "RiLockPasswordLine",
  },
  textarea: {
    hugeicons: "TextAlignLeftIcon",
    lucide: "AlignLeft",
    tabler: "IconAlignLeft",
    phosphor: "TextAlignLeft",
    remixicon: "RiAlignLeft",
  },
  number: {
    hugeicons: "GridIcon",
    lucide: "Binary",
    tabler: "IconHash",
    phosphor: "Hash",
    remixicon: "RiNumber7",
  },
  checkbox: {
    hugeicons: "CheckmarkSquare02Icon",
    lucide: "CheckSquare",
    tabler: "IconCheck",
    phosphor: "Check",
    remixicon: "RiCheckLine",
  },
  switch: {
    hugeicons: "ToggleOnIcon",
    lucide: "ToggleRight",
    tabler: "IconToggleRight",
    phosphor: "ToggleRight",
    remixicon: "RiToggleLine",
  },
  select: {
    hugeicons: "ArrowDown01Icon",
    lucide: "ChevronDown",
    tabler: "IconChevronDown",
    phosphor: "CaretDown",
    remixicon: "RiArrowDownSLine",
  },
  radio: {
    hugeicons: "CircleIcon",
    lucide: "CircleDot",
    tabler: "IconCircleDot",
    phosphor: "CircleDashed",
    remixicon: "RiRadioButtonLine",
  },
  date: {
    hugeicons: "Calendar03Icon",
    lucide: "Calendar",
    tabler: "IconCalendar",
    phosphor: "Calendar",
    remixicon: "RiCalendarLine",
  },
  tags: {
    hugeicons: "Tag01Icon",
    lucide: "Tag",
    tabler: "IconTag",
    phosphor: "Tag",
    remixicon: "RiTagLine",
  },
  group: {
    hugeicons: "FolderIcon",
    lucide: "Folder",
    tabler: "IconFolder",
    phosphor: "Folder",
    remixicon: "RiFolderLine",
  },
  array: {
    hugeicons: "Menu01Icon",
    lucide: "Layers",
    tabler: "IconLayersIntersect",
    phosphor: "Stack",
    remixicon: "RiStackLine",
  },
  row: {
    hugeicons: "RowInsertIcon",
    lucide: "Columns",
    tabler: "IconColumns",
    phosphor: "Columns",
    remixicon: "RiLayoutColumnLine",
  },
  tabs: {
    hugeicons: "Layout01Icon",
    lucide: "PanelsTop",
    tabler: "IconTabs",
    phosphor: "Browser",
    remixicon: "RiWindowLine",
  },
  collapsible: {
    hugeicons: "ArrowShrink02Icon",
    lucide: "ChevronsDownUp",
    tabler: "IconChevronDownLeft",
    phosphor: "CaretDoubleDown",
    remixicon: "RiArrowDownDoubleLine",
  },
} satisfies Record<string, IconMetadata>;

/**
 * The default field registry for the form builder.
 * Includes all standard input and layout fields.
 */
export const DEFAULT_FIELD_REGISTRY: FieldRegistry = {
  text: {
    kind: "data",
    sidebar: {
      label: "Text",
      icon: FIELD_ICONS.text,
      category: "inputs",
    },
    defaultProps: { type: "text", label: "Text Field" },
    properties: textFieldProperties,
  },
  email: {
    kind: "data",
    sidebar: {
      label: "Email",
      icon: FIELD_ICONS.email,
      category: "inputs",
    },
    defaultProps: { type: "email", label: "Email Address" },
    properties: emailFieldProperties,
  },
  password: {
    kind: "data",
    sidebar: {
      label: "Password",
      icon: FIELD_ICONS.password,
      category: "inputs",
    },
    defaultProps: { type: "password", label: "Password" },
    properties: passwordFieldProperties,
  },
  textarea: {
    kind: "data",
    sidebar: {
      label: "Textarea",
      icon: FIELD_ICONS.textarea,
      category: "inputs",
    },
    defaultProps: { type: "textarea", label: "Long Message" },
    properties: textareaFieldProperties,
  },
  number: {
    kind: "data",
    sidebar: {
      label: "Number",
      icon: FIELD_ICONS.number,
      category: "inputs",
    },
    defaultProps: { type: "number", label: "Quantity" },
    properties: numberFieldProperties,
  },
  checkbox: {
    kind: "data",
    sidebar: {
      label: "Checkbox",
      icon: FIELD_ICONS.checkbox,
      category: "selection",
    },
    defaultProps: { type: "checkbox", label: "Option" },
    properties: checkboxFieldProperties,
  },
  switch: {
    kind: "data",
    sidebar: {
      label: "Switch",
      icon: FIELD_ICONS.switch,
      category: "selection",
    },
    defaultProps: { type: "switch", label: "Enabled" },
    properties: switchFieldProperties,
  },
  select: {
    kind: "data",
    sidebar: {
      label: "Select",
      icon: FIELD_ICONS.select,
      category: "selection",
    },
    defaultProps: { type: "select", label: "Choose Option" },
    properties: selectFieldProperties,
  },
  radio: {
    kind: "data",
    sidebar: {
      label: "Radio",
      icon: FIELD_ICONS.radio,
      category: "selection",
    },
    defaultProps: { type: "radio", label: "Choose One" },
    properties: radioFieldProperties,
  },
  date: {
    kind: "data",
    sidebar: {
      label: "Date",
      icon: FIELD_ICONS.date,
      category: "selection",
    },
    defaultProps: { type: "date", label: "Pick Date" },
    properties: dateFieldProperties,
  },
  tags: {
    kind: "data",
    sidebar: {
      label: "Tags",
      icon: FIELD_ICONS.tags,
      category: "selection",
    },
    defaultProps: { type: "tags", label: "Select Tags" },
    properties: tagsFieldProperties,
  },
  group: {
    kind: "data",
    sidebar: {
      label: "Group",
      icon: FIELD_ICONS.group,
      category: "containers",
    },
    defaultProps: { type: "group", label: "Nested Group", fields: [] },
    properties: groupFieldProperties,
  },
  array: {
    kind: "data",
    sidebar: {
      label: "Array",
      icon: FIELD_ICONS.array,
      category: "containers",
    },
    defaultProps: { type: "array", label: "Item List", fields: [] },
    properties: arrayFieldProperties,
  },
  row: {
    kind: "layout",
    sidebar: {
      label: "Row",
      icon: FIELD_ICONS.row,
      category: "layout",
    },
    defaultProps: { type: "row", fields: [] },
    properties: rowFieldProperties,
  },
  tabs: {
    kind: "layout",
    sidebar: {
      label: "Tabs",
      icon: FIELD_ICONS.tabs,
      category: "layout",
    },
    defaultProps: { type: "tabs", tabs: [] },
    properties: tabsFieldProperties,
  },
  collapsible: {
    kind: "layout",
    sidebar: {
      label: "Collapsible",
      icon: FIELD_ICONS.collapsible,
      category: "layout",
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
