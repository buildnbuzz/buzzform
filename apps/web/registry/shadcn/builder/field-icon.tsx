"use client";

import React from "react";
import { IconPlaceholder } from "@/components/icon-placeholder";

interface FieldIconProps extends React.ComponentProps<"svg"> {
  type: string;
  size?: number;
}

/**
 * A statically-analyzable icon picker for the form builder.
 *
 * IMPORTANT: We use a switch statement with literal string props for IconPlaceholder
 * so that the shadcn CLI transformer can identify and replace these with the
 * user's local icon library components during installation.
 */
export const FieldIcon = ({ type, size = 16, ...props }: FieldIconProps) => {
  switch (type) {
    case "text":
      return (
        <IconPlaceholder
          lucide="Type"
          hugeicons="TextIcon"
          tabler="IconLetterCase"
          phosphor="TextT"
          remixicon="RiText"
          size={size}
          {...props}
        />
      );
    case "email":
      return (
        <IconPlaceholder
          lucide="Mail"
          hugeicons="Mail01Icon"
          tabler="IconMail"
          phosphor="Envelope"
          remixicon="RiMailLine"
          size={size}
          {...props}
        />
      );
    case "password":
      return (
        <IconPlaceholder
          lucide="Lock"
          hugeicons="SecurityPasswordIcon"
          tabler="IconLock"
          phosphor="LockSimple"
          remixicon="RiLockPasswordLine"
          size={size}
          {...props}
        />
      );
    case "textarea":
      return (
        <IconPlaceholder
          lucide="AlignLeft"
          hugeicons="TextAlignLeftIcon"
          tabler="IconAlignLeft"
          phosphor="TextAlignLeft"
          remixicon="RiAlignLeft"
          size={size}
          {...props}
        />
      );
    case "number":
      return (
        <IconPlaceholder
          lucide="Binary"
          hugeicons="GridIcon"
          tabler="IconHash"
          phosphor="Hash"
          remixicon="RiNumber7"
          size={size}
          {...props}
        />
      );
    case "checkbox":
      return (
        <IconPlaceholder
          lucide="CheckSquare"
          hugeicons="CheckmarkSquare02Icon"
          tabler="IconCheck"
          phosphor="Check"
          remixicon="RiCheckLine"
          size={size}
          {...props}
        />
      );
    case "switch":
      return (
        <IconPlaceholder
          lucide="ToggleRight"
          hugeicons="ToggleOnIcon"
          tabler="IconToggleRight"
          phosphor="ToggleRight"
          remixicon="RiToggleLine"
          size={size}
          {...props}
        />
      );
    case "select":
      return (
        <IconPlaceholder
          lucide="ChevronDown"
          hugeicons="ArrowDown01Icon"
          tabler="IconChevronDown"
          phosphor="CaretDown"
          remixicon="RiArrowDownSLine"
          size={size}
          {...props}
        />
      );
    case "radio":
      return (
        <IconPlaceholder
          lucide="CircleDot"
          hugeicons="CircleIcon"
          tabler="IconCircleDot"
          phosphor="CircleDashed"
          remixicon="RiRadioButtonLine"
          size={size}
          {...props}
        />
      );
    case "date":
      return (
        <IconPlaceholder
          lucide="Calendar"
          hugeicons="Calendar03Icon"
          tabler="IconCalendar"
          phosphor="Calendar"
          remixicon="RiCalendarLine"
          size={size}
          {...props}
        />
      );
    case "tags":
      return (
        <IconPlaceholder
          lucide="Tag"
          hugeicons="Tag01Icon"
          tabler="IconTag"
          phosphor="Tag"
          remixicon="RiPriceTagLine"
          size={size}
          {...props}
        />
      );
    case "group":
      return (
        <IconPlaceholder
          lucide="Folder"
          hugeicons="FolderIcon"
          tabler="IconFolder"
          phosphor="Folder"
          remixicon="RiFolderLine"
          size={size}
          {...props}
        />
      );
    case "array":
      return (
        <IconPlaceholder
          lucide="Layers"
          hugeicons="Menu01Icon"
          tabler="IconLayersIntersect"
          phosphor="Stack"
          remixicon="RiStackLine"
          size={size}
          {...props}
        />
      );
    case "row":
      return (
        <IconPlaceholder
          lucide="Columns"
          hugeicons="RowInsertIcon"
          tabler="IconColumns"
          phosphor="Columns"
          remixicon="RiLayoutColumnLine"
          size={size}
          {...props}
        />
      );
    case "tabs":
      return (
        <IconPlaceholder
          lucide="PanelTop"
          hugeicons="Layout01Icon"
          tabler="IconBrowser"
          phosphor="Browser"
          remixicon="RiWindowLine"
          size={size}
          {...props}
        />
      );
    case "collapsible":
      return (
        <IconPlaceholder
          lucide="ChevronsDownUp"
          hugeicons="ArrowShrink02Icon"
          tabler="IconChevronDownLeft"
          phosphor="CaretDoubleDown"
          remixicon="RiArrowDownDoubleLine"
          size={size}
          {...props}
        />
      );

    // Contextual icons
    case "plus":
      return (
        <IconPlaceholder
          lucide="Plus"
          hugeicons="Add01Icon"
          tabler="IconPlus"
          phosphor="Plus"
          remixicon="RiAddLine"
          size={size}
          {...props}
        />
      );
    case "move":
      return (
        <IconPlaceholder
          lucide="Move"
          hugeicons="Move01Icon"
          tabler="IconArrowsMove"
          phosphor="ArrowsOutCardinal"
          remixicon="RiDragMove2Line"
          size={size}
          {...props}
        />
      );

    default:
      return (
        <IconPlaceholder
          lucide="Circle"
          hugeicons="CircleIcon"
          tabler="IconCircle"
          phosphor="Circle"
          remixicon="RiCircleLine"
          size={size}
          {...props}
        />
      );
  }
};
