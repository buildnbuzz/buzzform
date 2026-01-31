import type { Field, FieldType, DataField } from '@buildnbuzz/buzzform';
import type { IconSvgElement } from '@hugeicons/react';
import type { ComponentType } from 'react';


export type Node = {
    id: string;
    field: Field;
    parentId: string | null;
    children: string[];
};

export function isContainerType(type: FieldType): boolean {
    return type === 'group' || type === 'row' || type === 'tabs' || type === 'collapsible' || type === 'array';
}

export function isDataField(field: Field): field is DataField {
    return 'name' in field && typeof field.name === 'string';
}

export type { FieldType } from '@buildnbuzz/buzzform';

export type SidebarCategory = 'inputs' | 'layout' | 'selection';

export type BuilderFieldSidebar = {
    label: string;
    icon: IconSvgElement;
    category: SidebarCategory;
};

export interface BuilderNodeRendererProps {
    id: string;
    field: Field;
    childrenIds: string[];
}

export type BuilderFieldRegistryEntry<T extends Field = Field> = {
    kind: 'data' | 'layout';
    sidebar: BuilderFieldSidebar;
    defaultProps: Omit<T, 'name'> & { name?: string };
    renderer?: ComponentType<BuilderNodeRendererProps>;
    accepts?: FieldType[];
    properties?: Field[];
};

export type BuilderFieldRegistry = Partial<{
    [K in FieldType]: BuilderFieldRegistryEntry<Extract<Field, { type: K }>>;
}>;

export type Viewport = 'desktop' | 'tablet' | 'mobile';

export type BuilderMode = 'edit' | 'preview';
