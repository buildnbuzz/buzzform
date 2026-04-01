"use client";

import * as React from "react";
import type { ArrayField as ArrayFieldDef } from "@buildnbuzz/form-core";
import {
  useDataField,
  RenderFields,
  useNestedErrorCount,
} from "@buildnbuzz/form-react";
import { resolveDynamicValue } from "@buildnbuzz/form-core";
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
  /** Label for the add button. Defaults to `"Add Item"`. */
  addLabel?: string;
  /** Empty state message. Defaults to `"No items added yet."`. */
  emptyMessage?: string;
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
  const resolvedLabel = rowLabel
    ? String(
        resolveDynamicValue(
          rowLabel as string,
          (rowData ?? {}) as Record<string, unknown>,
          (contextData ?? {}) as Record<string, unknown>,
        ) ?? "",
      ).trim() || `Item ${index + 1}`
    : `Item ${index + 1}`;

  const errorCount = useNestedErrorCount(field.fields, rowPath);

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
            <div className="p-4 space-y-4">
              <RenderFields
                fields={field.fields}
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

// ---------------------------------------------------------------------------
// ArrayField
// ---------------------------------------------------------------------------

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

  const ui = field.ui as ArrayUi | undefined;
  const addLabel = ui?.addLabel ?? "Add Item";
  const emptyMessage = ui?.emptyMessage ?? "No items added yet.";
  const isSortable = ui?.isSortable !== false;
  const showErrorBadge = ui?.showErrorBadge !== false;
  const allowDuplicate = ui?.allowDuplicate ?? false;
  const confirmDelete = ui?.confirmDelete !== false;

  const items = Array.isArray(fieldApi.state.value) ? fieldApi.state.value : [];
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

  const totalErrorCount = useNestedErrorCount(field.fields, fieldApi.name);
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
            <AlertDialogTitle>Delete all items?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all {items.length}{" "}
              {items.length === 1 ? "item" : "items"}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                for (let i = items.length - 1; i >= 0; i--)
                  fieldApi.removeValue(i);
                setShowDeleteAllDialog(false);
              }}
            >
              Delete All
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
                    <FieldLegend className="text-sm font-semibold truncate">
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
                      title={addLabel}
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
                        <div className="space-y-3">
                          {items.map((_, index) => (
                            <ArrayItem
                              key={itemIds[index]}
                              id={itemIds[index]!}
                              index={index}
                              field={field}
                              form={form}
                              fieldApiName={fieldApi.name}
                              rowLabel={ui?.rowLabel}
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
