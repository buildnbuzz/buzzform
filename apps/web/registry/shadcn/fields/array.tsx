"use client";

import * as React from "react";
import type { ArrayFieldDef, CoreField } from "@buildnbuzz/form-react";
import {
  useDataField,
  RenderFields,
  useNestedErrorCount,
} from "@buildnbuzz/form-react";
import { resolveExpr } from "@buildnbuzz/form-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconPlaceholder } from "@/components/icon-placeholder";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// UI options
// ---------------------------------------------------------------------------

interface ArrayUi {
  /** Visual style for the array container. Defaults to `"default"`. */
  variant?: "default" | "minimal";
  /** Row header label — use `{ $data: "fieldName" }` to show a field value. Falls back to `"Item #N"`. */
  rowLabel?: unknown;
  /** Enable drag-to-reorder. Defaults to `true`. */
  isSortable?: boolean;
  /** Show error-count badge in the container header. Defaults to `true`. */
  showErrorBadge?: boolean;
  /** Show a duplicate button per row. Defaults to `false`. */
  allowDuplicate?: boolean;
  /** Require confirmation before deleting all items. Defaults to `true`. */
  confirmDelete?: boolean;
  /** Text and label overrides. */
  labels?: {
    /** Label for the add button. Defaults to `"Add Item"`. */
    add?: React.ReactNode;
    /** Empty state message. Defaults to `"No items added yet."`. */
    empty?: React.ReactNode;
    /** Fallback row label when dynamic path is missing or empty. Defaults to `"Item #N"`. */
    rowFallback?: string;
    /** Title for the delete confirmation dialog. */
    confirmDeleteTitle?: React.ReactNode;
    /** Description for the delete confirmation dialog. */
    confirmDeleteDescription?: React.ReactNode;
    /** Label for the cancel button in delete confirmation. */
    confirmDeleteCancelLabel?: string;
    /** Label for the confirm button in delete confirmation. */
    confirmDeleteActionLabel?: string;
  };
}

// ---------------------------------------------------------------------------
// ArrayItem props type
// ---------------------------------------------------------------------------

interface ArrayItemProps {
  id: string;
  index: number;
  field: ArrayFieldDef;
  form: ReturnType<typeof useDataField>["form"];
  fieldApiName: string;
  rowLabel: unknown;
  rowFallback?: string;
  contextData: unknown;
  isSortable: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  canRemove: boolean;
  canDuplicate: boolean;
  allowDuplicate: boolean;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
}

// ---------------------------------------------------------------------------
// ArrayItem
// ---------------------------------------------------------------------------

function ArrayItem({
  id,
  index,
  field,
  form,
  fieldApiName,
  rowLabel,
  rowFallback,
  contextData,
  isSortable,
  isDisabled,
  isReadOnly,
  canRemove,
  canDuplicate,
  allowDuplicate,
  onRemove,
  onDuplicate,
}: ArrayItemProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const rowPath = `${fieldApiName}.${index}`;

  const rowData = form.getFieldValue(rowPath as never);
  const rowFormData =
    rowData && typeof rowData === "object"
      ? (rowData as Record<string, unknown>)
      : { value: rowData };

  const defaultRowLabel = rowFallback ?? `Item ${index + 1}`;

  const resolvedLabel = rowLabel
    ? String(
        resolveExpr(
          rowLabel as string,
          { data: rowFormData, context: (contextData ?? {}) as Record<string, unknown> },
        ) ?? "",
      ).trim() || defaultRowLabel
    : field.primitive === true && rowData !== undefined && rowData !== null
      ? String(rowData)
      : defaultRowLabel;

  const errorCount = useNestedErrorCount(field.fields as CoreField[], rowPath);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isSortable || isDisabled });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="bg-card border rounded-lg overflow-hidden">
          <CardHeader
            className={cn(
              "flex flex-row items-center gap-2 px-3 py-2 bg-muted/50",
              isOpen && "border-b",
            )}
          >
            {isSortable && !isDisabled && (
              <span
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
              >
                <IconPlaceholder
                  lucide="GripVertical"
                  hugeicons="DragDropIcon"
                  tabler="IconGripVertical"
                  phosphor="DotsSixVertical"
                  remixicon="RiDraggable"
                  className="size-4"
                />
              </span>
            )}

            <CollapsibleTrigger className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer">
              <IconPlaceholder
                lucide="ChevronDown"
                hugeicons="ArrowDown01Icon"
                tabler="IconChevronDown"
                phosphor="CaretDown"
                remixicon="RiArrowDownSLine"
                className={cn(
                  "size-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
                  !isOpen && "-rotate-90",
                )}
              />
              <span className="text-sm font-medium truncate">
                {resolvedLabel}
              </span>
              {errorCount > 0 && (
                <Badge
                  variant="destructive"
                  className="h-5 px-1.5 text-xs ml-1 shrink-0"
                >
                  {errorCount}
                </Badge>
              )}
            </CollapsibleTrigger>

            {!isReadOnly && (
              <div className="flex items-center gap-0.5 shrink-0">
                {allowDuplicate && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onDuplicate(index)}
                    disabled={!canDuplicate || isDisabled}
                    title="Duplicate"
                  >
                    <IconPlaceholder
                      lucide="Copy"
                      hugeicons="Copy01Icon"
                      tabler="IconCopy"
                      phosphor="Copy"
                      remixicon="RiFileCopyLine"
                      className="size-3.5"
                    />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(index)}
                  disabled={!canRemove || isDisabled}
                  title="Remove"
                >
                  <IconPlaceholder
                    lucide="Trash2"
                    hugeicons="Delete02Icon"
                    tabler="IconTrash"
                    phosphor="Trash"
                    remixicon="RiDeleteBinLine"
                    className="size-3.5"
                  />
                </Button>
              </div>
            )}
          </CardHeader>

          <CollapsibleContent>
            <div className="p-4 flex flex-col gap-4">
              <RenderFields
                fields={field.fields as CoreField[]}
                form={form}
                basePath={rowPath}
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}

function MinimalArrayItem({
  id,
  index,
  field,
  form,
  fieldApiName,
  rowLabel,
  rowFallback,
  contextData,
  isSortable,
  isDisabled,
  isReadOnly,
  canRemove,
  canDuplicate,
  allowDuplicate,
  onRemove,
  onDuplicate,
}: ArrayItemProps) {
  const rowPath = `${fieldApiName}.${index}`;
  const rowData = form.getFieldValue(rowPath as never);
  const rowFormData =
    rowData && typeof rowData === "object"
      ? (rowData as Record<string, unknown>)
      : { value: rowData };

  const defaultRowLabel = rowFallback ?? `Item ${index + 1}`;

  const resolvedLabel = rowLabel
    ? String(
        resolveExpr(
          rowLabel as string,
          { data: rowFormData, context: (contextData ?? {}) as Record<string, unknown> },
        ) ?? "",
      ).trim() || defaultRowLabel
    : "";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isSortable || isDisabled });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex w-full items-start gap-3 py-1 group/array-item"
    >
      <div className="flex-1 min-w-0">
        {resolvedLabel && field.primitive !== true && (
          <p className="text-xs text-muted-foreground mb-2">{resolvedLabel}</p>
        )}
        <div
          className={cn(
            "flex flex-col gap-4 w-full",
            field.primitive === true &&
              "**:data-[slot=field-label]:hidden **:data-[slot=field-description]:hidden",
          )}
        >
          <RenderFields
            fields={field.fields as CoreField[]}
            form={form}
            basePath={rowPath}
          />
        </div>
      </div>

      {!isReadOnly && (
        <div
          className={cn(
            "flex items-center gap-1 shrink-0",
            field.primitive === true ? "mt-0.5" : "mt-7",
          )}
        >
          {isSortable && !isDisabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              {...attributes}
              {...listeners}
              title="Drag"
            >
              <IconPlaceholder
                lucide="GripVertical"
                hugeicons="DragDropIcon"
                tabler="IconGripVertical"
                phosphor="DotsSixVertical"
                remixicon="RiDraggable"
                className="size-3.5"
              />
            </Button>
          )}
          {allowDuplicate && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onDuplicate(index)}
              disabled={!canDuplicate || isDisabled}
              title="Duplicate"
            >
              <IconPlaceholder
                lucide="Copy"
                hugeicons="Copy01Icon"
                tabler="IconCopy"
                phosphor="Copy"
                remixicon="RiFileCopyLine"
                className="size-3.5"
              />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(index)}
            disabled={!canRemove || isDisabled}
            title="Remove"
          >
            <IconPlaceholder
              lucide="Trash2"
              hugeicons="Delete02Icon"
              tabler="IconTrash"
              phosphor="Trash"
              remixicon="RiDeleteBinLine"
              className="size-3.5"
            />
          </Button>
        </div>
      )}
    </div>
  );
}

interface ArrayFieldState {
  fieldApi: ReturnType<typeof useDataField>["fieldApi"];
  field: ArrayFieldDef;
  form: ReturnType<typeof useDataField>["form"];
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  errors: ReturnType<typeof useDataField>["errors"];
  isInvalid: boolean;
  descriptionId?: string;
  errorId?: string;
  contextData: unknown;
}

function DefaultArrayField(state: ArrayFieldState) {
  const {
    fieldApi,
    field,
    form,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
    contextData,
  } = state;

  const ui = field.ui as ArrayUi | undefined;
  const labels = ui?.labels;

  const addLabel = labels?.add ?? "Add Item";
  const emptyMessage = labels?.empty ?? "No items added yet.";
  const isSortable = ui?.isSortable !== false;
  const showErrorBadge = ui?.showErrorBadge !== false;
  const allowDuplicate = ui?.allowDuplicate ?? false;
  const confirmDelete = ui?.confirmDelete !== false;

  const items = Array.isArray(fieldApi.state.value) ? fieldApi.state.value : [];

  const confirmDeleteTitle = labels?.confirmDeleteTitle ?? "Delete all items?";
  const confirmDeleteDescription =
    labels?.confirmDeleteDescription ??
    (items.length === 1
      ? "This will remove the item. This cannot be undone."
      : `This will remove all ${items.length} items. This cannot be undone.`);
  const confirmDeleteCancelLabel = labels?.confirmDeleteCancelLabel ?? "Cancel";
  const confirmDeleteActionLabel =
    labels?.confirmDeleteActionLabel ?? "Delete All";

  const [showDeleteAllDialog, setShowDeleteAllDialog] = React.useState(false);

  const canAddMore =
    field.maxItems === undefined || items.length < field.maxItems;
  const canRemoveAny =
    field.minItems === undefined || items.length > field.minItems;

  // Stable DnD IDs keyed by position — sufficient since we reorder in-place
  const dndId = React.useId();
  const itemIds = items.map((_, i) => `${fieldApi.name}-${i}`);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = itemIds.indexOf(active.id as string);
    const to = itemIds.indexOf(over.id as string);
    if (from !== -1 && to !== -1) fieldApi.moveValue(from, to);
  };

  const handleAdd = () => {
    if (!isDisabled && !isReadOnly && canAddMore)
      fieldApi.pushValue(undefined as never);
  };

  const handleRemove = (index: number) => fieldApi.removeValue(index);

  const handleDuplicate = (index: number) => {
    if (canAddMore) fieldApi.insertValue(index + 1, items[index] as never);
  };

  const handleDeleteAll = () => {
    if (confirmDelete) {
      setShowDeleteAllDialog(true);
    } else {
      for (let i = items.length - 1; i >= 0; i--) fieldApi.removeValue(i);
    }
  };

  const totalErrorCount = useNestedErrorCount(
    field.fields as CoreField[],
    fieldApi.name,
  );
  const isEffectivelyRequired =
    isRequired || (typeof field.minItems === "number" && field.minItems >= 1);

  return (
    <>
      <AlertDialog
        open={showDeleteAllDialog}
        onOpenChange={setShowDeleteAllDialog}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDeleteDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{confirmDeleteCancelLabel}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                for (let i = items.length - 1; i >= 0; i--)
                  fieldApi.removeValue(i);
                setShowDeleteAllDialog(false);
              }}
            >
              {confirmDeleteActionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FieldGroup data-field={fieldApi.name}>
        <Field data-invalid={isInvalid} data-disabled={isDisabled}>
          <FieldSet disabled={isDisabled} className="contents">
            <Card className="py-0 gap-0">
              {/* Header */}
              <CardHeader className="px-4 py-3 flex flex-row items-center justify-between bg-muted/50 border-b gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {label && (
                    <FieldLegend className="text-sm font-semibold truncate mb-0">
                      {label}
                      {isEffectivelyRequired && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </FieldLegend>
                  )}
                  {items.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 text-xs shrink-0"
                    >
                      {items.length}
                    </Badge>
                  )}
                  {showErrorBadge && totalErrorCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-5 px-1.5 text-xs shrink-0"
                    >
                      {totalErrorCount}
                    </Badge>
                  )}
                </div>

                {!isReadOnly && (
                  <div className="flex items-center gap-1 shrink-0">
                    {items.length > 0 && canRemoveAny && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={handleDeleteAll}
                        disabled={isDisabled}
                        title="Delete all"
                      >
                        <IconPlaceholder
                          lucide="Trash2"
                          hugeicons="Delete02Icon"
                          tabler="IconTrash"
                          phosphor="Trash"
                          remixicon="RiDeleteBinLine"
                          className="size-4"
                        />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleAdd}
                      disabled={!canAddMore || isDisabled}
                      title={typeof addLabel === "string" ? addLabel : "Add"}
                    >
                      <IconPlaceholder
                        lucide="Plus"
                        hugeicons="Add01Icon"
                        tabler="IconPlus"
                        phosphor="Plus"
                        remixicon="RiAddLine"
                        className="size-4"
                      />
                    </Button>
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-4">
                {description && !isInvalid && (
                  <FieldDescription id={descriptionId} className="mb-4">
                    {description}
                  </FieldDescription>
                )}
                {isInvalid && (
                  <FieldError id={errorId} errors={errors} className="mb-4" />
                )}

                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">
                      {emptyMessage}
                    </p>
                    {!isReadOnly && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAdd}
                        disabled={!canAddMore || isDisabled}
                      >
                        <IconPlaceholder
                          lucide="Plus"
                          hugeicons="Add01Icon"
                          tabler="IconPlus"
                          phosphor="Plus"
                          remixicon="RiAddLine"
                          className="size-4 mr-1.5"
                        />
                        {addLabel}
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <DndContext
                      id={dndId}
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={itemIds}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="flex flex-col gap-3">
                          {items.map((_, index) => (
                            <ArrayItem
                              key={itemIds[index]}
                              id={itemIds[index]!}
                              index={index}
                              field={field}
                              form={form}
                              fieldApiName={fieldApi.name}
                              rowLabel={ui?.rowLabel}
                              rowFallback={labels?.rowFallback}
                              contextData={contextData}
                              isSortable={isSortable}
                              isDisabled={isDisabled}
                              isReadOnly={isReadOnly}
                              canRemove={canRemoveAny}
                              canDuplicate={canAddMore}
                              allowDuplicate={allowDuplicate}
                              onRemove={handleRemove}
                              onDuplicate={handleDuplicate}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>

                    {!isReadOnly && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-4 border-dashed text-muted-foreground hover:text-foreground"
                        onClick={handleAdd}
                        disabled={!canAddMore || isDisabled}
                      >
                        <IconPlaceholder
                          lucide="Plus"
                          hugeicons="Add01Icon"
                          tabler="IconPlus"
                          phosphor="Plus"
                          remixicon="RiAddLine"
                          className="size-4 mr-2"
                        />
                        {addLabel}
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </FieldSet>
        </Field>
      </FieldGroup>
    </>
  );
}

function MinimalArrayField(state: ArrayFieldState) {
  const {
    fieldApi,
    field,
    form,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
    contextData,
  } = state;

  const ui = field.ui as ArrayUi | undefined;
  const labels = ui?.labels;

  const addLabel = labels?.add ?? "Add Item";
  const emptyMessage = labels?.empty ?? "No items added yet.";
  const isSortable = ui?.isSortable !== false;
  const showErrorBadge = ui?.showErrorBadge !== false;
  const allowDuplicate = ui?.allowDuplicate ?? false;

  const items = Array.isArray(fieldApi.state.value) ? fieldApi.state.value : [];

  const canAddMore =
    field.maxItems === undefined || items.length < field.maxItems;
  const canRemoveAny =
    field.minItems === undefined || items.length > field.minItems;

  // Stable DnD IDs keyed by position — sufficient since we reorder in-place
  const dndId = React.useId();
  const itemIds = items.map((_, i) => `${fieldApi.name}-${i}`);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = itemIds.indexOf(active.id as string);
    const to = itemIds.indexOf(over.id as string);
    if (from !== -1 && to !== -1) fieldApi.moveValue(from, to);
  };

  const handleAdd = () => {
    if (!isDisabled && !isReadOnly && canAddMore)
      fieldApi.pushValue(undefined as never);
  };

  const handleRemove = (index: number) => fieldApi.removeValue(index);

  const handleDuplicate = (index: number) => {
    if (canAddMore) fieldApi.insertValue(index + 1, items[index] as never);
  };

  const totalErrorCount = useNestedErrorCount(
    field.fields as CoreField[],
    fieldApi.name,
  );
  const isEffectivelyRequired =
    isRequired || (typeof field.minItems === "number" && field.minItems >= 1);

  return (
    <FieldGroup data-field={fieldApi.name}>
      <Field data-invalid={isInvalid} data-disabled={isDisabled}>
        <FieldSet disabled={isDisabled} className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            {label && (
              <FieldLegend className="text-sm font-semibold mb-0">
                {label}
                {isEffectivelyRequired && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </FieldLegend>
            )}
            {items.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {items.length}
              </Badge>
            )}
            {showErrorBadge && totalErrorCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                {totalErrorCount}
              </Badge>
            )}
            {!isReadOnly && (
              <div className="ml-auto flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleAdd}
                  disabled={!canAddMore || isDisabled}
                  title={typeof addLabel === "string" ? addLabel : "Add Item"}
                >
                  <IconPlaceholder
                    lucide="Plus"
                    hugeicons="Add01Icon"
                    tabler="IconPlus"
                    phosphor="Plus"
                    remixicon="RiAddLine"
                    className="size-4"
                  />
                </Button>
              </div>
            )}
          </div>

          {description && !isInvalid && (
            <FieldDescription id={descriptionId}>
              {description}
            </FieldDescription>
          )}
          {isInvalid && <FieldError id={errorId} errors={errors} />}

          {items.length === 0 ? (
            <div className="flex items-center justify-between border border-dashed rounded-lg px-3 py-3">
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAdd}
                  disabled={!canAddMore || isDisabled}
                >
                  <IconPlaceholder
                    lucide="Plus"
                    hugeicons="Add01Icon"
                    tabler="IconPlus"
                    phosphor="Plus"
                    remixicon="RiAddLine"
                    className="size-4 mr-1.5"
                  />
                  {addLabel}
                </Button>
              )}
            </div>
          ) : (
            <DndContext
              id={dndId}
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={itemIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-3">
                  {items.map((_, index) => (
                    <MinimalArrayItem
                      key={itemIds[index]}
                      id={itemIds[index]!}
                      index={index}
                      field={field}
                      form={form}
                      fieldApiName={fieldApi.name}
                      rowLabel={ui?.rowLabel}
                      rowFallback={labels?.rowFallback}
                      contextData={contextData}
                      isSortable={isSortable}
                      isDisabled={isDisabled}
                      isReadOnly={isReadOnly}
                      canRemove={canRemoveAny}
                      canDuplicate={canAddMore}
                      allowDuplicate={allowDuplicate}
                      onRemove={handleRemove}
                      onDuplicate={handleDuplicate}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </FieldSet>
      </Field>
    </FieldGroup>
  );
}

export function ArrayField() {
  const {
    fieldApi,
    field,
    form,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
    contextData,
  } = useDataField<ArrayFieldDef>();

  const state: ArrayFieldState = {
    fieldApi,
    field,
    form,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
    contextData,
  };

  const ui = field.ui as ArrayUi | undefined;
  const variant = ui?.variant ?? "default";

  if (variant === "minimal") return <MinimalArrayField {...state} />;
  return <DefaultArrayField {...state} />;
}
