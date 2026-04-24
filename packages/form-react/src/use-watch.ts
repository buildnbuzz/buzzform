import { useEffect, useRef } from "react";
import { useStore } from "@tanstack/react-form";
import type { AnyReactFormExtendedApi } from "./types";

export interface UseWatchOptions<TFormData> {
  form: AnyReactFormExtendedApi<TFormData>;
  onChange: (values: TFormData) => void;
  debounceMs?: number;
}

export function useWatch<TFormData>({
  form,
  onChange,
  debounceMs = 0,
}: UseWatchOptions<TFormData>) {
  const values = useStore(form.store, (state) => state.values as TFormData);
  const isFirstRenderRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(onChange);
  const debounceRef = useRef(debounceMs);

  // Keep refs in sync without triggering effects
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    debounceRef.current = debounceMs;
  }, [debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    // Skip the initial render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    const fire = () => onChangeRef.current(values);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (debounceRef.current > 0) {
      timeoutRef.current = setTimeout(fire, debounceRef.current);
    } else {
      fire();
    }
  }, [values]); // values reference only changes when content changes — no JSON.stringify needed
}
