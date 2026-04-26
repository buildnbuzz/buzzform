"use client";

import { useEffect } from "react";
import { useUndoRedo } from "../context/BuilderContext";

/**
 * Hook to enable keyboard shortcuts for the form builder.
 * Currently supports:
 * - Ctrl+Z: Undo
 * - Ctrl+Shift+Z / Ctrl+Y: Redo
 * 
 * Includes guards to prevent triggering shortcuts while typing in inputs or textareas.
 */
export function useBuilderKeyboardShortcuts() {
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Guard: Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      const isInput = 
        target.tagName === "INPUT" || 
        target.tagName === "TEXTAREA" || 
        target.isContentEditable;
      
      if (isInput) return;

      const isMod = e.ctrlKey || e.metaKey;

      // Undo: Ctrl+Z
      if (isMod && e.key === "z") {
        if (e.shiftKey) {
          // Redo: Ctrl+Shift+Z
          if (canRedo) {
            e.preventDefault();
            redo();
          }
        } else {
          // Undo: Ctrl+Z
          if (canUndo) {
            e.preventDefault();
            undo();
          }
        }
      }

      // Redo: Ctrl+Y
      if (isMod && e.key === "y") {
        if (canRedo) {
          e.preventDefault();
          redo();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);
}
