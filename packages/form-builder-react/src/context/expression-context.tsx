import React, { createContext, useContext, useMemo } from "react";
import type { AvailableField } from "@buildnbuzz/form-builder-core";
import { getAllAvailableFields } from "@buildnbuzz/form-builder-core";
import { useBuilderStore } from "./builder-context";

export interface ExpressionContextValue {
  availableFields: AvailableField[];
}

const ExpressionContext = createContext<ExpressionContextValue | null>(null);

export const ExpressionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Extract nodes and rootIds from the builder store to compute available fields
  const nodes = useBuilderStore((state) => state.nodes);
  const rootIds = useBuilderStore((state) => state.rootIds);

  const availableFields = useMemo(() => {
    if (!nodes || !rootIds || rootIds.length === 0) return [];
    return getAllAvailableFields(nodes, rootIds);
  }, [nodes, rootIds]);

  const value = useMemo(() => ({ availableFields }), [availableFields]);

  return (
    <ExpressionContext.Provider value={value}>
      {children}
    </ExpressionContext.Provider>
  );
};

export const useExpressionContext = (): ExpressionContextValue => {
  const context = useContext(ExpressionContext);
  if (!context) {
    throw new Error("useExpressionContext must be used within an ExpressionProvider");
  }
  return context;
};

export const useAvailableFields = (): AvailableField[] => {
  const { availableFields } = useExpressionContext();
  return availableFields;
};
