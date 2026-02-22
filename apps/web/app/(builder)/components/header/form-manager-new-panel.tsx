"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Alert01Icon,
  File02Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";
import {
  fromBuilderDocument,
  parseBuilderDocumentJson,
  type BuilderDocumentState,
} from "../../lib/persistence";
import { useBuilderStore } from "../../lib/store";
import { toast } from "sonner";

const MIN_IMPORT_FEEDBACK_MS = 500;

type PendingImport = {
  fileName: string;
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

        <div className="space-y-1.5 text-center">
          <h3 className="text-xl font-semibold tracking-tight">
            {pendingImport.formName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {pendingImport.fileName}
          </p>
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

        <div className="grid grid-cols-2 gap-2 mt-1">
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

export function FormManagerNewPanel({ onDone }: FormManagerNewPanelProps) {
  const [isImporting, setIsImporting] = React.useState(false);
  const [pendingImport, setPendingImport] =
    React.useState<PendingImport | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);

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

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const startedAt = Date.now();
    setImportError(null);
    setPendingImport(null);
    setIsImporting(true);

    try {
      const contents = await file.text();
      const document = parseBuilderDocumentJson(contents);
      const importedState = fromBuilderDocument(document);
      setPendingImport({
        fileName: file.name,
        formName: importedState.formName,
        nodeCount: Object.keys(importedState.nodes).length,
        state: importedState,
      });
    } catch (error) {
      const rawMessage =
        error instanceof Error ? error.message : "Failed to import file.";
      const message = `Invalid BuzzForm file: ${rawMessage}`;
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
        ) : (
          <div className="grid w-full flex-1 gap-4 sm:grid-cols-2">
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
                    : "Restore from .json"}
                </CardDescription>
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
