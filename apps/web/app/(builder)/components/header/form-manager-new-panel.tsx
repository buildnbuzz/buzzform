"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Alert01Icon,
  Copy01Icon,
  File02Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";
import { useBuilderStore } from "../../lib/store";
import { toast } from "sonner";
import {
  parseImportedFormJson,
  type ImportPayloadFormat,
} from "../../lib/import-json";
import type { BuilderDocumentState } from "../../lib/persistence";

const MIN_IMPORT_FEEDBACK_MS = 500;

const IMPORT_FORMAT_LABELS: Record<ImportPayloadFormat, string> = {
  "builder-backup": "Builder Backup",
  "buzzform-schema": "BuzzForm Schema",
};

type PendingImport = {
  sourceName: string;
  format: ImportPayloadFormat;
  formName: string;
  nodeCount: number;
  state: BuilderDocumentState;
};

type FormManagerNewPanelProps = {
  onDone: () => void;
};

type FormManagerPendingImportStateProps = {
  pendingImport: PendingImport;
  isImporting: boolean;
  onConfirmImport: () => void;
  onClearSelection: () => void;
};

type FormManagerPasteImportStateProps = {
  value: string;
  isImporting: boolean;
  onChangeValue: (value: string) => void;
  onBack: () => void;
  onPasteFromClipboard: () => void;
  onImport: () => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
};

function FormManagerPendingImportState({
  pendingImport,
  isImporting,
  onConfirmImport,
  onClearSelection,
}: FormManagerPendingImportStateProps) {
  return (
    <div className="flex w-full flex-1 flex-col animate-in fade-in duration-200">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HugeiconsIcon icon={File02Icon} size={32} strokeWidth={1.5} />
        </div>

        <div className="space-y-2 text-center">
          <h3 className="text-xl font-semibold tracking-tight">
            {pendingImport.formName}
          </h3>
          <p className="text-sm text-muted-foreground">{pendingImport.sourceName}</p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline">
              {IMPORT_FORMAT_LABELS[pendingImport.format]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {pendingImport.nodeCount} nodes
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto flex w-full flex-col gap-4 rounded-xl border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-amber-600 dark:text-amber-500">
            <HugeiconsIcon icon={Alert01Icon} size={18} strokeWidth={2} />
          </div>
          <div className="flex-1 space-y-0.5">
            <p className="text-sm font-medium leading-none">
              Replace current workspace?
            </p>
            <p className="text-xs text-muted-foreground">
              Continuing will overwrite any unsaved changes.
            </p>
          </div>
        </div>

        <div className="mt-1 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={onClearSelection}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button onClick={onConfirmImport} disabled={isImporting}>
            <HugeiconsIcon
              icon={Upload01Icon}
              size={16}
              className="mr-2"
              strokeWidth={2}
            />
            Import Now
          </Button>
        </div>
      </div>
    </div>
  );
}

function FormManagerPasteImportState({
  value,
  isImporting,
  onChangeValue,
  onBack,
  onPasteFromClipboard,
  onImport,
  onDragOver,
  onDrop,
}: FormManagerPasteImportStateProps) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-3 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold tracking-tight">Import JSON</h3>
        <p className="text-sm text-muted-foreground">
          Paste a BuzzForm schema or Builder backup JSON.
        </p>
      </div>

      <div
        className="h-56 min-h-0 overflow-hidden rounded-lg border border-dashed border-border/70 p-2 transition-colors hover:border-primary/50"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <Textarea
          value={value}
          onChange={(event) => onChangeValue(event.target.value)}
          placeholder='[\n  { "type": "text", "name": "email", "label": "Email" }\n]'
          wrap="off"
          className="h-full min-h-0 resize-none overflow-x-auto overflow-y-auto border-0 bg-transparent font-mono text-xs whitespace-pre shadow-none field-sizing-fixed focus-visible:ring-0"
        />
      </div>

      <div className="mt-auto flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onBack} disabled={isImporting}>
          Back
        </Button>
        <Button
          variant="outline"
          onClick={onPasteFromClipboard}
          disabled={isImporting}
        >
          <HugeiconsIcon
            icon={Copy01Icon}
            size={16}
            className="mr-2"
            strokeWidth={2}
          />
          Paste from Clipboard
        </Button>
        <Button
          onClick={onImport}
          disabled={isImporting || value.trim().length === 0}
        >
          {isImporting ? (
            <Spinner className="mr-2 size-4" />
          ) : (
            <HugeiconsIcon
              icon={Upload01Icon}
              size={16}
              className="mr-2"
              strokeWidth={2}
            />
          )}
          Validate JSON
        </Button>
      </div>
    </div>
  );
}

export function FormManagerNewPanel({ onDone }: FormManagerNewPanelProps) {
  const [isImporting, setIsImporting] = React.useState(false);
  const [pendingImport, setPendingImport] =
    React.useState<PendingImport | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [isPasteMode, setIsPasteMode] = React.useState(false);
  const [pastedJson, setPastedJson] = React.useState("");

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const clearState = useBuilderStore((state) => state.clearState);
  const loadDocumentState = useBuilderStore((state) => state.loadDocumentState);

  const resetImportState = React.useCallback(() => {
    setIsImporting(false);
    setPendingImport(null);
    setImportError(null);
  }, []);

  const handleNewForm = () => {
    clearState();
    onDone();
  };

  const handleConfirmImport = () => {
    if (!pendingImport) return;
    loadDocumentState(pendingImport.state);
    toast.success(`Imported "${pendingImport.formName}"`);
    onDone();
  };

  const handleImportClick = () => {
    if (isImporting) return;
    fileInputRef.current?.click();
  };

  const handleOpenPasteMode = () => {
    if (isImporting) return;
    setImportError(null);
    setIsPasteMode(true);
  };

  const handleClosePasteMode = () => {
    if (isImporting) return;
    setImportError(null);
    setIsPasteMode(false);
  };

  const processImportJson = React.useCallback(
    async ({
      json,
      sourceName,
      schemaFileNameHint,
      closePasteModeOnSuccess,
    }: {
      json: string;
      sourceName: string;
      schemaFileNameHint?: string;
      closePasteModeOnSuccess: boolean;
    }) => {
      const startedAt = Date.now();
      setImportError(null);
      setPendingImport(null);
      setIsImporting(true);

      try {
        const parsed = parseImportedFormJson(json);
        const importedState =
          parsed.format === "buzzform-schema" &&
          schemaFileNameHint &&
          parsed.state.formName === "Imported Form"
            ? {
                ...parsed.state,
                formName: schemaFileNameHint,
              }
            : parsed.state;

        setPendingImport({
          sourceName,
          format: parsed.format,
          formName: importedState.formName,
          nodeCount: Object.keys(importedState.nodes).length,
          state: importedState,
        });

        if (closePasteModeOnSuccess) {
          setIsPasteMode(false);
        }
      } catch (error) {
        const rawMessage =
          error instanceof Error ? error.message : "Failed to import JSON.";
        const message = `Invalid import JSON: ${rawMessage}`;
        setImportError(message);
        toast.error(message);
      } finally {
        const elapsed = Date.now() - startedAt;
        if (elapsed < MIN_IMPORT_FEEDBACK_MS) {
          await new Promise((resolve) =>
            setTimeout(resolve, MIN_IMPORT_FEEDBACK_MS - elapsed),
          );
        }
        setIsImporting(false);
      }
    },
    [],
  );

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const contents = await file.text();
    await processImportJson({
      json: contents,
      sourceName: file.name,
      schemaFileNameHint: toFormNameHint(file.name),
      closePasteModeOnSuccess: false,
    });
  };

  const handleImportPastedJson = async () => {
    const trimmedJson = pastedJson.trim();
    if (!trimmedJson) {
      const message = "Paste JSON content before importing.";
      setImportError(message);
      toast.error(message);
      return;
    }

    await processImportJson({
      json: trimmedJson,
      sourceName: "Pasted JSON",
      closePasteModeOnSuccess: true,
    });
  };

  const handlePasteFromClipboard = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.readText) {
      toast.error("Clipboard access is not available. Paste manually.");
      return;
    }

    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText.trim()) {
        toast.error("Clipboard is empty.");
        return;
      }

      setPastedJson(clipboardText);
      setImportError(null);
      toast.success("Pasted JSON from clipboard");
    } catch {
      toast.error("Clipboard access was denied. Paste JSON manually.");
    }
  };

  const handlePasteDropZoneDragOver = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
  };

  const handlePasteDropZoneDrop = async (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    if (isImporting) return;

    const file = event.dataTransfer.files?.[0];
    if (file) {
      try {
        const droppedContents = await file.text();
        if (!droppedContents.trim()) {
          toast.error("Dropped file is empty.");
          return;
        }
        setPastedJson(droppedContents);
        setImportError(null);
        toast.success(`Loaded JSON from "${file.name}"`);
      } catch {
        toast.error("Failed to read dropped file.");
      }
      return;
    }

    const droppedText = event.dataTransfer.getData("text/plain");
    if (!droppedText.trim()) {
      toast.error("Dropped content is empty.");
      return;
    }

    setPastedJson(droppedText);
    setImportError(null);
    toast.success("Loaded dropped text");
  };

  React.useEffect(() => resetImportState, [resetImportState]);

  const hasPendingImport =
    pendingImport !== null && !isImporting && !importError;

  return (
    <div className="flex min-h-80 flex-col gap-3">
      <div className="flex flex-1 p-4">
        {hasPendingImport ? (
          <FormManagerPendingImportState
            pendingImport={pendingImport}
            isImporting={isImporting}
            onConfirmImport={handleConfirmImport}
            onClearSelection={resetImportState}
          />
        ) : isPasteMode ? (
          <FormManagerPasteImportState
            value={pastedJson}
            isImporting={isImporting}
            onChangeValue={setPastedJson}
            onBack={handleClosePasteMode}
            onPasteFromClipboard={handlePasteFromClipboard}
            onImport={handleImportPastedJson}
            onDragOver={handlePasteDropZoneDragOver}
            onDrop={handlePasteDropZoneDrop}
          />
        ) : (
          <div className="grid w-full flex-1 gap-4 sm:grid-cols-3">
            <Card
              className="group flex cursor-pointer flex-col justify-center transition-all duration-200 hover:ring-1 hover:ring-primary/50"
              onClick={handleNewForm}
            >
              <CardContent className="flex justify-center pb-2 pt-6">
                <HugeiconsIcon
                  icon={Add01Icon}
                  size={32}
                  strokeWidth={1.5}
                  className="text-muted-foreground transition-all duration-300 group-hover:scale-110 group-hover:rotate-90 group-hover:text-primary"
                />
              </CardContent>
              <CardHeader className="justify-center text-center">
                <CardTitle className="text-lg">Start Blank</CardTitle>
                <CardDescription>Create a fresh empty form</CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="group flex cursor-pointer flex-col justify-center transition-all duration-200 hover:ring-1 hover:ring-primary/50"
              onClick={handleImportClick}
            >
              <CardContent className="flex justify-center pb-2 pt-6">
                {isImporting ? (
                  <div className="flex items-center justify-center p-2 text-muted-foreground transition-colors group-hover:text-primary">
                    <Spinner className="size-10" />
                  </div>
                ) : (
                  <HugeiconsIcon
                    icon={Upload01Icon}
                    size={32}
                    strokeWidth={1.5}
                    className="text-muted-foreground transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:text-primary"
                  />
                )}
              </CardContent>
              <CardHeader className="justify-center text-center">
                <CardTitle className="text-lg">
                  {isImporting ? "Validating File" : "Import File"}
                </CardTitle>
                <CardDescription>
                  {isImporting
                    ? "Checking JSON before import"
                    : "Load .json from disk"}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="group flex cursor-pointer flex-col justify-center transition-all duration-200 hover:ring-1 hover:ring-primary/50"
              onClick={handleOpenPasteMode}
            >
              <CardContent className="flex justify-center pb-2 pt-6">
                <HugeiconsIcon
                  icon={Copy01Icon}
                  size={32}
                  strokeWidth={1.5}
                  className="text-muted-foreground transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:text-primary"
                />
              </CardContent>
              <CardHeader className="justify-center text-center">
                <CardTitle className="text-lg">Import JSON</CardTitle>
                <CardDescription>Paste schema from clipboard</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>

      {importError && (
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert01Icon} size={16} />
          <AlertTitle>Import Failed</AlertTitle>
          <AlertDescription>{importError}</AlertDescription>
        </Alert>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileImport}
      />
    </div>
  );
}

function toFormNameHint(sourceName: string): string | undefined {
  const normalizedBase = sourceName
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (normalizedBase.length === 0) {
    return undefined;
  }

  return normalizedBase
    .split(" ")
    .map((segment) => {
      if (segment.length === 0) return segment;
      return segment[0]!.toUpperCase() + segment.slice(1).toLowerCase();
    })
    .join(" ");
}
