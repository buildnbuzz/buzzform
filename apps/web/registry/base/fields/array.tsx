"use client";

import * as React from "react";
import type {
  ArrayField as ArrayFieldType,
  FormAdapter,
} from "@buildnbuzz/buzzform";
import {
  getNestedFieldPaths,
  countNestedErrors,
  getArrayRowLabel,
} from "@buildnbuzz/buzzform";
import { cn } from "@/lib/utils";
import { FieldRenderer, type FieldRegistry } from "./render";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconPlaceholder } from "@/components/icon-placeholder";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

// =============================================================================
// TYPES
// =============================================================================

export interface ArrayFieldComponentProps {
  field: ArrayFieldType;
  path: string;
  form: FormAdapter;
  registry?: FieldRegistry;
  autoFocus?: boolean;
  formValues: Record<string, unknown>;
  siblingData: Record<string, unknown>;
  // Computed props
  fieldId: string;
  label: React.ReactNode | null;
  isDisabled: boolean;
  isReadOnly: boolean;
  error?: string;
}

interface ArrayRowItem {
  id: string;
  [key: string]: unknown;
}

interface ArrayRowProps {
  id: string;
  index: number;
  field: ArrayFieldType;
  path: string;
  form: FormAdapter;
  registry?: FieldRegistry;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
  isOpen: boolean;
  onToggle: (index: number) => void;
  canRemove: boolean;
  isSortable: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isNew?: boolean; // For animation on new rows
  isExiting?: boolean; // For animation on removing rows
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to count errors in nested fields for a row.
 */
const useNestedErrors = (
  form: FormAdapter,
  fields: ArrayFieldType["fields"],
  basePath: string
): number => {
  const errors = form.formState.errors;
  const nestedPaths = getNestedFieldPaths(fields, basePath);
  return nestedPaths.filter((p) => errors[p]).length;
};

/**
 * Hook to count total errors across all array rows.
 */
const useArrayErrors = (
  form: FormAdapter,
  fields: ArrayFieldType["fields"],
  path: string,
  rowCount: number
): number => {
  const errors = form.formState.errors;
  let totalErrors = 0;
  for (let i = 0; i < rowCount; i++) {
    const rowPath = `${path}.${i}`;
    totalErrors += countNestedErrors(errors, fields, rowPath);
  }
  return totalErrors;
};

// ARRAY ROW (Memoized)
// =============================================================================

const ArrayRow = React.memo(
  ({
    id,
    index,
    field,
    path,
    form,
    registry,
    onRemove,
    onDuplicate,
    isOpen,
    onToggle,
    canRemove,
    isSortable,
    isDisabled,
    isReadOnly,
    isNew = false,
    isExiting = false,
  }: ArrayRowProps) => {
    const rowRef = React.useRef<HTMLDivElement>(null);
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id, disabled: !isSortable || isDisabled || isReadOnly });

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const rowPath = `${path}.${index}`;
    const rowData = form.watch<Record<string, unknown>>(rowPath);

    // Use shared utility for row label
    const rowLabel = getArrayRowLabel(
      rowData,
      field.fields,
      field.ui as { rowLabelField?: string } | undefined,
      `Item ${index + 1}`
    );

    const errorCount = useNestedErrors(form, field.fields, rowPath);

    const handleRemoveClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (canRemove && !isDisabled && !isReadOnly) {
        onRemove(index);
      }
    };

    const handleDuplicateClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isDisabled && !isReadOnly) {
        onDuplicate(index);
      }
    };

    const handleToggleClick = () => {
      onToggle(index);
    };

    // Focus first focusable element when row is new and open
    React.useEffect(() => {
      if (isNew && isOpen && rowRef.current) {
        // Delay to allow content to render
        const timer = setTimeout(() => {
          const firstInput = rowRef.current?.querySelector<HTMLElement>(
            'input:not([type="hidden"]), textarea, select, [contenteditable="true"], button[data-focusable]'
          );
          firstInput?.focus();
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [isNew, isOpen]);

    return (
      <Collapsible open={isOpen} onOpenChange={handleToggleClick}>
        <div
          ref={(node) => {
            setNodeRef(node);
            (rowRef as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
          }}
          role="listitem"
          aria-label={`${rowLabel}, item ${index + 1}`}
          style={style}
          className={cn(
            "bg-card border rounded-lg overflow-hidden",
            isDragging && "shadow-lg ring-2 ring-primary/20",
            isDisabled && "opacity-60 pointer-events-none",
            isNew &&
              "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-700",
            isExiting &&
              "animate-out fade-out-0 zoom-out-95 slide-out-to-top-2 duration-300 pointer-events-none"
          )}
        >
          <CardHeader
            className={cn(
              "flex flex-row items-center gap-3 px-4 py-2 bg-muted/50 transition-colors shrink-0 rounded-t-lg",
              !isDisabled && "hover:bg-muted/75",
              isOpen && "border-b"
            )}
          >
            {isSortable && !isDisabled && !isReadOnly && (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors shrink-0"
                title="Drag to reorder"
              >
                <IconPlaceholder
                  lucide="GripVertical"
                  hugeicons="DragDropIcon"
                  tabler="IconGripVertical"
                  phosphor="DotsSixVertical"
                  remixicon="RiDraggable"
                  className="size-4"
                />
              </div>
            )}

            <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left min-w-0 font-medium text-sm text-muted-foreground cursor-pointer">
              <IconPlaceholder
                lucide="ChevronDown"
                hugeicons="ArrowDown01Icon"
                tabler="IconChevronDown"
                phosphor="CaretDown"
                remixicon="RiArrowDownSLine"
                className={cn(
                  "size-4 text-muted-foreground transition-transform duration-200 shrink-0",
                  !isOpen && "-rotate-90"
                )}
              />
              <span className="truncate">{rowLabel}</span>
              {errorCount > 0 && (
                <Badge
                  variant="destructive"
                  className="h-5 px-1.5 text-xs ml-1"
                >
                  {errorCount}
                </Badge>
              )}
            </CollapsibleTrigger>

            {!isReadOnly && (
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 active:scale-95 transition-all"
                  onClick={handleDuplicateClick}
                  disabled={isDisabled}
                  title="Duplicate item"
                  aria-label="Duplicate item"
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
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 text-destructive hover:bg-destructive/10 active:scale-95 transition-all",
                    (!canRemove || isDisabled) &&
                      "opacity-50 cursor-not-allowed"
                  )}
                  disabled={!canRemove || isDisabled}
                  onClick={handleRemoveClick}
                  title={
                    canRemove
                      ? "Delete item"
                      : `Minimum ${field.minRows} ${field.minRows === 1 ? "item" : "items"} required`
                  }
                  aria-label={
                    canRemove
                      ? "Delete item"
                      : `Minimum ${field.minRows} items required`
                  }
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
              {field.fields.map((f, i) => {
                const nestedPath =
                  "name" in f ? `${rowPath}.${f.name}` : rowPath;
                return (
                  <FieldRenderer
                    key={i}
                    field={f}
                    path={nestedPath}
                    form={form}
                    registry={registry}
                  />
                );
              })}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.index === nextProps.index &&
      prevProps.isOpen === nextProps.isOpen &&
      prevProps.canRemove === nextProps.canRemove &&
      prevProps.isSortable === nextProps.isSortable &&
      prevProps.isDisabled === nextProps.isDisabled &&
      prevProps.isReadOnly === nextProps.isReadOnly &&
      prevProps.path === nextProps.path &&
      prevProps.isNew === nextProps.isNew &&
      prevProps.isExiting === nextProps.isExiting
    );
  }
);

ArrayRow.displayName = "ArrayRow";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ArrayField = React.forwardRef<
  HTMLDivElement,
  ArrayFieldComponentProps
>(
  (
    {
      field,
      path,
      form,
      registry,
      isDisabled,
      isReadOnly,
      label,
    }: ArrayFieldComponentProps,
    ref
  ) => {
    const dndContextId = React.useId();

    // UI options with type-safe defaults
    const ui = field.ui;
    const isSortable = ui?.isSortable !== false;
    const addLabel = ui?.addLabel ?? "Add Item";
    const showErrorBadge = ui?.showErrorBadge !== false;
    const emptyMessage = ui?.emptyMessage ?? "No items added yet";

    // Initialize collapsed states from UI options
    const [isArrayCollapsed, setIsArrayCollapsed] = React.useState(
      ui?.collapsed ?? false
    );
    const [collapsedRowsMap, setCollapsedRowsMap] = React.useState<
      Record<string, boolean>
    >({});
    const [showDeleteAllDialog, setShowDeleteAllDialog] = React.useState(false);

    // Track newly added rows and exiting rows for animation
    const [newRowIds, setNewRowIds] = React.useState<Set<string>>(new Set());
    const [exitingRowIds, setExitingRowIds] = React.useState<Set<string>>(
      new Set()
    );

    // Screen reader announcement
    const [announcement, setAnnouncement] = React.useState<string>("");

    // Use form.array.fields() for stable items with IDs
    const rows = form.array.fields<ArrayRowItem>(path);

    // Initialize row collapsed state when rows change (for ui.rowsCollapsed)
    React.useEffect(() => {
      if (ui?.rowsCollapsed && rows.length > 0) {
        const newMap: Record<string, boolean> = {};
        for (const row of rows) {
          // Only collapse new rows, preserve existing state
          if (collapsedRowsMap[row.id] === undefined) {
            newMap[row.id] = true;
          }
        }
        if (Object.keys(newMap).length > 0) {
          setCollapsedRowsMap((prev) => ({ ...prev, ...newMap }));
        }
      }
    }, [rows, ui?.rowsCollapsed, collapsedRowsMap]);

    // Track previous rows to detect additions for animation
    const prevRowsRef = React.useRef(rows);

    // Use useLayoutEffect to detect additions synchronously to avoid flicker
    React.useLayoutEffect(() => {
      const prevRows = prevRowsRef.current;

      // Detect additions (length increased)
      if (rows.length > prevRows.length) {
        // Find IDs that are in current but not in prev
        const prevIds = new Set(prevRows.map((r) => r.id));
        const newItems = rows.filter((r) => !prevIds.has(r.id));

        if (newItems.length > 0) {
          const idsToAdd = newItems.map((r) => r.id);
          setNewRowIds((prev) => {
            const next = new Set(prev);
            idsToAdd.forEach((id) => next.add(id));
            return next;
          });
        }
      }

      // Update ref for next render
      prevRowsRef.current = rows;
    }, [rows]);

    // Clear "new" status after animation completes
    React.useEffect(() => {
      if (newRowIds.size > 0) {
        const timer = setTimeout(() => {
          setNewRowIds(new Set());
        }, 700); // Match animation duration
        return () => clearTimeout(timer);
      }
    }, [newRowIds]);

    // Calculate total errors across all rows for header badge
    const totalErrorCount = useArrayErrors(
      form,
      field.fields,
      path,
      rows.length
    );

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 10,
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = rows.findIndex((r) => r.id === active.id);
        const newIndex = rows.findIndex((r) => r.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          form.array.move(path, oldIndex, newIndex);
        }
      }
    };

    const handleAdd = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!isDisabled && !isReadOnly) {
        form.array.append(path, {});
        setAnnouncement(`Item ${rows.length + 1} added`);
      }
    };

    const handleRemove = (index: number) => {
      const rowToRemove = rows[index];
      if (!rowToRemove) return;

      const removedLabel = getArrayRowLabel(
        rowToRemove,
        field.fields,
        field.ui,
        `Item ${index + 1}`
      );

      // 1. Mark as exiting to trigger animation
      setExitingRowIds((prev) => new Set([...prev, rowToRemove.id]));

      // 2. Wait for animation to complete before actual removal
      setTimeout(() => {
        // Find fresh index of this ID in case list changed
        const currentRows = form.array.fields<ArrayRowItem>(path);
        const currentIndex = currentRows.findIndex(
          (r) => r.id === rowToRemove.id
        );

        if (currentIndex !== -1) {
          form.array.remove(path, currentIndex);
          setAnnouncement(`${removedLabel} removed`);
        }

        // Cleanup exiting state
        setExitingRowIds((prev) => {
          const next = new Set(prev);
          next.delete(rowToRemove.id);
          return next;
        });
      }, 300); // Match CSS animation duration
    };

    const handleDuplicate = (index: number) => {
      const currentValue = rows[index];
      if (currentValue) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = currentValue;
        form.array.insert(path, index + 1, rest);
        setAnnouncement(`Item ${index + 1} duplicated`);
      }
    };

    const handleRemoveAllClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Check if confirmation is required (default: true for safety)
      if (ui?.confirmDelete !== false) {
        setShowDeleteAllDialog(true);
      } else {
        form.array.replace(path, []);
      }
    };

    const handleConfirmRemoveAll = () => {
      form.array.replace(path, []);
      setShowDeleteAllDialog(false);
    };

    const handleToggleRow = (index: number) => {
      const rowId = rows[index]?.id;
      if (rowId) {
        setCollapsedRowsMap((prev) => ({
          ...prev,
          [rowId]: !prev[rowId],
        }));
      }
    };

    const handleToggleAllRows = (e: React.MouseEvent) => {
      e.stopPropagation();
      // If any row is open, we want to collapse all.
      // Only if ALL are collapsed, we expand all.
      const anyOpen = rows.some((row) => !collapsedRowsMap[row.id]);

      const newMap: Record<string, boolean> = {};
      for (const row of rows) {
        newMap[row.id] = anyOpen;
      }
      setCollapsedRowsMap(newMap);
    };

    const allRowsCollapsed =
      rows.length > 0 && rows.every((row) => collapsedRowsMap[row.id]);
    const canAddMore = !field.maxRows || rows.length < field.maxRows;
    const canRemoveAny = !field.minRows || rows.length > field.minRows;

    const bodyContent = (
      <CardContent className="pt-4 px-4 pb-4">
        {rows.length > 0 ? (
          <DndContext
            id={dndContextId}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={rows.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                className="space-y-3"
                role="list"
                aria-label={`${label} items`}
              >
                {rows.map((row, index) => (
                  <ArrayRow
                    key={row.id}
                    id={row.id}
                    index={index}
                    field={field}
                    path={path}
                    form={form}
                    registry={registry}
                    onRemove={handleRemove}
                    onDuplicate={handleDuplicate}
                    isOpen={!collapsedRowsMap[row.id]}
                    onToggle={handleToggleRow}
                    canRemove={!field.minRows || rows.length > field.minRows}
                    isSortable={isSortable}
                    isDisabled={isDisabled}
                    isReadOnly={isReadOnly}
                    isNew={newRowIds.has(row.id)}
                    isExiting={exitingRowIds.has(row.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg text-center">
            <IconPlaceholder
              lucide="ListPlus"
              hugeicons="InsertRowDownIcon"
              tabler="IconRowInsertBottom"
              phosphor="ListPlus"
              remixicon="RiPlayListAddLine"
              className="size-10 text-muted-foreground/50 mb-3"
            />
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {emptyMessage}
            </p>
            <p className="text-xs text-muted-foreground/75 mb-4">
              Click the button below to add your first item
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
        )}

        {/* Footer Add Button - Rendered when items exist to allow adding at the bottom */}
        {rows.length > 0 && !isReadOnly && (
          <Button
            type="button"
            variant="outline"
            className="w-full mt-4 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
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

        {typeof field.minRows === "number" &&
          field.minRows > 0 &&
          rows.length < field.minRows && (
            <div className="mt-3 text-xs text-destructive flex items-center gap-1.5 px-1 font-medium">
              <IconPlaceholder
                lucide="AlertCircle"
                hugeicons="SecurityBlockIcon"
                tabler="IconAlertCircle"
                phosphor="Warning"
                remixicon="RiAlertLine"
                className="size-3.5"
              />
              Minimum {field.minRows} {field.minRows === 1 ? "item" : "items"}{" "}
              required
            </div>
          )}
      </CardContent>
    );

    return (
      <>
        {/* Screen reader announcements */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcement}
        </div>

        {/* Delete All Confirmation Dialog */}
        <AlertDialog
          open={showDeleteAllDialog}
          onOpenChange={setShowDeleteAllDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive">
                <IconPlaceholder
                  lucide="Trash2"
                  hugeicons="Delete02Icon"
                  tabler="IconTrash"
                  phosphor="Trash"
                  remixicon="RiDeleteBinLine"
                  className="size-5"
                />
              </AlertDialogMedia>
              <AlertDialogTitle>Delete all items?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove all {rows.length}{" "}
                {rows.length === 1 ? "item" : "items"} from this list. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={handleConfirmRemoveAll}
              >
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Collapsible
          open={!isArrayCollapsed}
          onOpenChange={(open) => setIsArrayCollapsed(!open)}
        >
          <Card
            ref={ref}
            className={cn(
              "py-0 gap-0",
              field.style?.className,
              isDisabled && "opacity-60"
            )}
            style={
              field.style?.width ? { width: field.style.width } : undefined
            }
          >
            <CardHeader
              className={cn(
                "flex flex-row items-center justify-between bg-muted/50 transition-colors py-3 px-4",
                !isArrayCollapsed && "border-b"
              )}
            >
              <CollapsibleTrigger className="flex items-start gap-2 cursor-pointer hover:opacity-80 transition-opacity flex-1 min-w-0 py-1">
                <IconPlaceholder
                  lucide="ChevronDown"
                  hugeicons="ArrowDown01Icon"
                  tabler="IconChevronDown"
                  phosphor="CaretDown"
                  remixicon="RiArrowDownSLine"
                  className={cn(
                    "size-4 text-muted-foreground transition-transform duration-200 shrink-0 mt-0.5",
                    isArrayCollapsed && "-rotate-90"
                  )}
                />
                <div className="flex flex-col items-start gap-0.5 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 w-full pr-2">
                    <span className="font-semibold text-sm truncate">
                      {label}
                    </span>
                    {field.required && (
                      <span className="text-destructive">*</span>
                    )}
                    {rows.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="h-5 px-1.5 text-xs whitespace-nowrap shrink-0"
                      >
                        {rows.length} {rows.length === 1 ? "item" : "items"}
                      </Badge>
                    )}
                    {showErrorBadge && totalErrorCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="h-5 px-1.5 text-xs whitespace-nowrap shrink-0"
                      >
                        {totalErrorCount}{" "}
                        {totalErrorCount === 1 ? "error" : "errors"}
                      </Badge>
                    )}
                  </div>
                  {field.description && (
                    <p className="text-xs text-muted-foreground text-left wrap-break-word leading-tight w-full pr-2">
                      {field.description}
                    </p>
                  )}
                </div>
              </CollapsibleTrigger>
              {!isReadOnly && (
                <div className="flex items-center gap-1">
                  {rows.length > 0 && (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground active:scale-95 transition-all"
                        onClick={handleToggleAllRows}
                        disabled={isDisabled}
                        title={
                          allRowsCollapsed
                            ? "Expand all items"
                            : "Collapse all items"
                        }
                        aria-label={
                          allRowsCollapsed
                            ? "Expand all items"
                            : "Collapse all items"
                        }
                      >
                        {allRowsCollapsed ? (
                          <IconPlaceholder
                            lucide="ChevronsUpDown"
                            hugeicons="ArrowExpand02Icon"
                            tabler="IconArrowsMaximize"
                            phosphor="ArrowsOutSimple"
                            remixicon="RiExpandUpDownLine"
                            className="size-4"
                          />
                        ) : (
                          <IconPlaceholder
                            lucide="ChevronsDownUp"
                            hugeicons="ArrowShrink02Icon"
                            tabler="IconArrowsMinimize"
                            phosphor="ArrowsInSimple"
                            remixicon="RiContractUpDownLine"
                            className="size-4"
                          />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7 text-destructive hover:bg-destructive/10 active:scale-95 transition-all",
                          (!canRemoveAny || isDisabled) &&
                            "opacity-50 cursor-not-allowed"
                        )}
                        onClick={handleRemoveAllClick}
                        disabled={isDisabled || !canRemoveAny}
                        title={
                          canRemoveAny
                            ? "Delete all items"
                            : `Minimum ${field.minRows} items required`
                        }
                        aria-label={
                          canRemoveAny
                            ? "Delete all items"
                            : `Minimum ${field.minRows} items required`
                        }
                      >
                        <IconPlaceholder
                          lucide="Trash2"
                          hugeicons="DeletePutBackIcon"
                          tabler="IconTrash"
                          phosphor="TrashSimple"
                          remixicon="RiDeleteBinLine"
                          className="size-4"
                        />
                      </Button>
                    </>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 active:scale-95 transition-all"
                    disabled={!canAddMore || isDisabled}
                    onClick={handleAdd}
                    title={
                      canAddMore
                        ? "Add item"
                        : `Maximum ${field.maxRows} items reached`
                    }
                    aria-label={
                      canAddMore
                        ? "Add item"
                        : `Maximum ${field.maxRows} items reached`
                    }
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
            <CollapsibleContent>{bodyContent}</CollapsibleContent>
          </Card>
        </Collapsible>
      </>
    );
  }
);

ArrayField.displayName = "ArrayField";

// =============================================================================
// SKELETON
// =============================================================================

export const ArrayFieldSkeleton = React.forwardRef<
  HTMLDivElement,
  { field: ArrayFieldType }
>(({ field }: { field: ArrayFieldType }, ref) => {
  const label = field.label !== false ? field.label || field.name : null;

  return (
    <Card ref={ref} className={cn("py-0", field.style?.className)}>
      <CardHeader className="flex flex-row justify-between items-center py-3 px-4 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          {label && <Skeleton className="h-4 w-24" />}
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded" />
          <Skeleton className="h-7 w-7 rounded" />
          <Skeleton className="h-7 w-7 rounded" />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="border rounded-lg overflow-hidden animate-pulse"
          >
            <div className="flex items-center gap-3 px-4 py-2 bg-muted/50">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32 flex-1" />
              <Skeleton className="h-7 w-7 rounded" />
              <Skeleton className="h-7 w-7 rounded" />
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

ArrayFieldSkeleton.displayName = "ArrayFieldSkeleton";
