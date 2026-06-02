"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IconPlaceholder } from "@/components/icon-placeholder";
import type {
  FormSummary,
  BuilderStorageProvider,
} from "@buildnbuzz/form-builder-core";
import { toSafeFileName, fieldsToBuilderState } from "@buildnbuzz/form-builder-core";
import { useBuilderStore, downloadTextFile } from "@buildnbuzz/form-builder-react";
import type { Field } from "@buildnbuzz/form-core";
import { toast } from "sonner";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

type FormManagerSavedPanelProps = {
  onDone: () => void;
  storageProvider: BuilderStorageProvider | null;
};

export function FormManagerSavedPanel({
  onDone,
  storageProvider,
}: FormManagerSavedPanelProps) {
  const [forms, setForms] = React.useState<FormSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [openingFormId, setOpeningFormId] = React.useState<string | null>(null);
  const [removingFormId, setRemovingFormId] = React.useState<string | null>(
    null,
  );
  const [downloadingFormId, setDownloadingFormId] = React.useState<
    string | null
  >(null);

  const loadDocumentState = useBuilderStore((state) => state.loadDocumentState);
  const currentFormId = useBuilderStore((state) => state.formId);

  const loadForms = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      if (!storageProvider) return;
      const items = await storageProvider.list();
      setForms(items);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load forms.";
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, [storageProvider]);

  React.useEffect(() => {
    void loadForms();
  }, [loadForms]);

  const handleOpenForm = async (formId: string) => {
    setOpeningFormId(formId);

    try {
      if (!storageProvider) return;
      const document = await storageProvider.load(formId);
      if (!document) throw new Error("Document not found");
      const { nodes, rootIds } = fieldsToBuilderState(
        document.fields as readonly Field[],
      );

      loadDocumentState({
        nodes,
        rootIds,
        formId: document.id || formId,
        formName: document.title || "Untitled",
      });
      onDone();
      toast.success(`Opened "${document.title || "Untitled"}"`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to open form.";
      toast.error(message);
    } finally {
      setOpeningFormId(null);
    }
  };

  const handleRemoveForm = async (form: FormSummary) => {
    if (
      !window.confirm(
        `Remove "${form.formName}" from local saved forms? This does not affect the currently open editor until you switch forms.`,
      )
    ) {
      return;
    }

    setRemovingFormId(form.formId);

    try {
      if (!storageProvider) return;
      await storageProvider.remove(form.formId);
      setForms((prev) => prev.filter((item) => item.formId !== form.formId));
      toast.success(`Removed "${form.formName}"`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to remove form.";
      toast.error(message);
    } finally {
      setRemovingFormId(null);
    }
  };

  const handleDownloadForm = async (form: FormSummary) => {
    setDownloadingFormId(form.formId);

    try {
      if (!storageProvider) return;
      const document = await storageProvider.load(form.formId);
      if (!document) throw new Error("Document not found");
      const fileName = `${toSafeFileName(document.title || "Untitled")}.json`;

      downloadTextFile(
        JSON.stringify(document, null, 2),
        fileName,
        "application/json",
      );
      toast.success(`Downloaded "${document.title || "Untitled"}"`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to download form.";
      toast.error(message);
    } finally {
      setDownloadingFormId(null);
    }
  };

  return (
    <div className="flex min-h-80 flex-col gap-3">
      {isLoading ? (
        <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-4" />
          Loading saved forms...
        </div>
      ) : loadError ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-destructive">{loadError}</p>
          <Button type="button" variant="outline" size="sm" onClick={loadForms}>
            Retry
          </Button>
        </div>
      ) : forms.length === 0 ? (
        <Empty className="min-h-64">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconPlaceholder
                hugeicons="FolderIcon"
                lucide="Folder"
                tabler="IconFolder"
                phosphor="Folder"
                remixicon="RiFolderLine"
                size={16}
                strokeWidth={2}
              />
            </EmptyMedia>
            <EmptyTitle>No saved forms yet</EmptyTitle>
            <EmptyDescription>
              Forms appear here after you edit and save them locally.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="rounded-lg border">
            <ScrollArea className="h-72 w-full">
              <div className="space-y-2 p-2">
                {forms.map((form) => {
                  const isOpening = openingFormId === form.formId;
                  const isRemoving = removingFormId === form.formId;
                  const isDownloading = downloadingFormId === form.formId;
                  const isBusy = isOpening || isRemoving || isDownloading;
                  const isCurrent = currentFormId === form.formId;

                  return (
                    <div
                      key={form.formId}
                      className="flex items-start gap-3 rounded-md border p-3"
                    >
                      <div className="mt-0.5 rounded-md border bg-muted p-1.5">
                        <IconPlaceholder
                          hugeicons="InputShortTextIcon"
                          lucide="Type"
                          tabler="IconLetterT"
                          phosphor="TextT"
                          remixicon="RiText"
                          size={14}
                          strokeWidth={2}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">
                            {form.formName}
                          </p>
                          {isCurrent && (
                            <Badge variant="secondary">Current</Badge>
                          )}
                        </div>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <IconPlaceholder
                            hugeicons="Clock01Icon"
                            lucide="Clock"
                            tabler="IconClock"
                            phosphor="Clock"
                            remixicon="RiTimeLine"
                            size={12}
                            strokeWidth={2}
                          />
                          <span>{dateFormatter.format(form.updatedAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          disabled={isBusy}
                          onClick={() => handleOpenForm(form.formId)}
                        >
                          {isOpening ? (
                            <Spinner className="size-3.5" />
                          ) : (
                            <IconPlaceholder
                              hugeicons="ArrowRight01Icon"
                              lucide="ArrowRight"
                              tabler="IconArrowRight"
                              phosphor="ArrowRight"
                              remixicon="RiArrowRightLine"
                              size={14}
                              strokeWidth={2}
                            />
                          )}
                          Open
                        </Button>

                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                disabled={isBusy}
                                onClick={() => handleDownloadForm(form)}
                                className="text-muted-foreground"
                              >
                                {isDownloading ? (
                                  <Spinner className="size-3.5" />
                                ) : (
                                  <IconPlaceholder
                                    hugeicons="Download02Icon"
                                    lucide="Download"
                                    tabler="IconDownload"
                                    phosphor="DownloadSimple"
                                    remixicon="RiDownload2Line"
                                    size={14}
                                    strokeWidth={2}
                                  />
                                )}
                                <span className="sr-only">
                                  Download saved form
                                </span>
                              </Button>
                            }
                          />
                          <TooltipContent side="top">Download</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                disabled={isBusy}
                                onClick={() => handleRemoveForm(form)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                {isRemoving ? (
                                  <Spinner className="size-3.5" />
                                ) : (
                                  <IconPlaceholder
                                    hugeicons="Delete02Icon"
                                    lucide="Trash2"
                                    tabler="IconTrash"
                                    phosphor="Trash"
                                    remixicon="RiDeleteBinLine"
                                    size={14}
                                    strokeWidth={2}
                                  />
                                )}
                                <span className="sr-only">
                                  Remove saved form
                                </span>
                              </Button>
                            }
                          />
                          <TooltipContent side="top">Delete</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-start">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={loadForms}
            >
              <IconPlaceholder
                hugeicons="Refresh01Icon"
                lucide="RefreshCw"
                tabler="IconRefresh"
                phosphor="ArrowsClockwise"
                remixicon="RiRefreshLine"
                size={14}
                strokeWidth={2}
              />
              Refresh
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
