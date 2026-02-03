import type { BuilderFieldRegistry } from './types';
import {
    TextIcon,
    Mail01Icon,
    SecurityPasswordIcon,
    TextAlignLeftIcon,
    GridIcon,
    Calendar02Icon,
    Clock01Icon,
    ArrowDown01Icon,
    CircleIcon,
    Tick02Icon,
    ToggleOnIcon,
    Tag01Icon,
    Upload01Icon,
    RowInsertIcon,
    FolderIcon,
    ArrowShrink02Icon,
} from '@hugeicons/core-free-icons';
import type { ComponentType } from 'react';
import type { BuilderNodeRendererProps } from './types';
import { RowLayout } from '../components/layouts/row';
import { GroupLayout } from '../components/layouts/group';
import { CollapsibleLayout } from '../components/layouts/collapsible';
import { textFieldProperties } from './properties/text';
import { emailFieldProperties } from './properties/email';
import { passwordFieldProperties } from './properties/password';
import { textareaFieldProperties } from './properties/textarea';
import { numberFieldProperties } from './properties/number';
import { tagsFieldProperties } from './properties/tags';
import { uploadFieldProperties } from './properties/upload';
import { dateFieldProperties } from './properties/date';
import { datetimeFieldProperties } from './properties/datetime';
import { selectFieldProperties } from './properties/select';
import { radioFieldProperties } from './properties/radio';
import { checkboxFieldProperties } from './properties/checkbox';
import { switchFieldProperties } from './properties/switch';
import { rowFieldProperties } from './properties/row';
import { groupFieldProperties } from './properties/group';
import { collapsibleFieldProperties } from './properties/collapsible';

export const builderFieldRegistry: BuilderFieldRegistry = {
    text: {
        kind: 'data',
        sidebar: { label: 'Text', icon: TextIcon, category: 'inputs' },
        defaultProps: { type: 'text', label: 'Text Field' },
        properties: textFieldProperties,
    },
    email: {
        kind: 'data',
        sidebar: { label: 'Email', icon: Mail01Icon, category: 'inputs' },
        defaultProps: { type: 'email', label: 'Email' },
        properties: emailFieldProperties,
    },
    password: {
        kind: 'data',
        sidebar: { label: 'Password', icon: SecurityPasswordIcon, category: 'inputs' },
        defaultProps: { type: 'password', label: 'Password' },
        properties: passwordFieldProperties,
    },
    textarea: {
        kind: 'data',
        sidebar: { label: 'Textarea', icon: TextAlignLeftIcon, category: 'inputs' },
        defaultProps: { type: 'textarea', label: 'Textarea', rows: 3 },
        properties: textareaFieldProperties,
    },
    number: {
        kind: 'data',
        sidebar: { label: 'Number', icon: GridIcon, category: 'inputs' },
        defaultProps: { type: 'number', label: 'Number' },
        properties: numberFieldProperties,
    },
    date: {
        kind: 'data',
        sidebar: { label: 'Date', icon: Calendar02Icon, category: 'inputs' },
        defaultProps: { type: 'date', label: 'Date' },
        properties: dateFieldProperties,
    },
    datetime: {
        kind: 'data',
        sidebar: { label: 'Datetime', icon: Clock01Icon, category: 'inputs' },
        defaultProps: { type: 'datetime', label: 'Datetime' },
        properties: datetimeFieldProperties,
    },
    select: {
        kind: 'data',
        sidebar: { label: 'Select', icon: ArrowDown01Icon, category: 'selection' },
        defaultProps: {
            type: 'select',
            label: 'Select',
            options: [
                { label: 'Option 1', value: 'option1' },
                { label: 'Option 2', value: 'option2' },
            ],
        },
        properties: selectFieldProperties,
    },
    radio: {
        kind: 'data',
        sidebar: { label: 'Radio', icon: CircleIcon, category: 'selection' },
        defaultProps: {
            type: 'radio',
            label: 'Radio',
            options: [
                { label: 'Option 1', value: 'option1' },
                { label: 'Option 2', value: 'option2' },
            ],
        },
        properties: radioFieldProperties,
    },
    checkbox: {
        kind: 'data',
        sidebar: { label: 'Checkbox', icon: Tick02Icon, category: 'selection' },
        defaultProps: { type: 'checkbox', label: 'Checkbox' },
        properties: checkboxFieldProperties,
    },
    switch: {
        kind: 'data',
        sidebar: { label: 'Switch', icon: ToggleOnIcon, category: 'selection' },
        defaultProps: { type: 'switch', label: 'Switch' },
        properties: switchFieldProperties,
    },
    tags: {
        kind: 'data',
        sidebar: { label: 'Tags', icon: Tag01Icon, category: 'inputs' },
        defaultProps: { type: 'tags', label: 'Tags' },
        properties: tagsFieldProperties,
    },
    upload: {
        kind: 'data',
        sidebar: { label: 'Upload', icon: Upload01Icon, category: 'inputs' },
        defaultProps: { type: 'upload', label: 'Upload' },
        properties: uploadFieldProperties,
    },

    // Layout fields
    row: {
        kind: 'layout',
        sidebar: { label: 'Row', icon: RowInsertIcon, category: 'layout' },
        defaultProps: { type: 'row', fields: [] },
        renderer: RowLayout as unknown as ComponentType<BuilderNodeRendererProps>,
        properties: rowFieldProperties,
    },
    group: {
        kind: 'data',
        sidebar: { label: 'Group', icon: FolderIcon, category: 'layout' },
        defaultProps: { type: 'group', label: 'Group', fields: [] },
        renderer: GroupLayout as unknown as ComponentType<BuilderNodeRendererProps>,
        properties: groupFieldProperties,
    },
    collapsible: {
        kind: 'layout',
        sidebar: { label: 'Collapsible', icon: ArrowShrink02Icon, category: 'layout' },
        defaultProps: { type: 'collapsible', label: 'Section', fields: [] },
        renderer: CollapsibleLayout as unknown as ComponentType<BuilderNodeRendererProps>,
        properties: collapsibleFieldProperties,
    },
};

export function getRegistryEntry(type: keyof typeof builderFieldRegistry) {
    return builderFieldRegistry[type];
}

export function getSidebarGroups() {
    const groups: Record<string, Array<{ type: string; label: string; icon: typeof TextIcon }>> = {};

    for (const [type, entry] of Object.entries(builderFieldRegistry)) {
        if (!entry) continue;
        const category = entry.sidebar.category;
        if (!groups[category]) groups[category] = [];
        groups[category].push({
            type,
            label: entry.sidebar.label,
            icon: entry.sidebar.icon,
        });
    }

    return groups;
}
