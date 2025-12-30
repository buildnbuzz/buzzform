"use client";

import * as React from "react";
import { ThemeProvider } from "./theme";
import { RootProvider } from "fumadocs-ui/provider/next";

/**
 * Providers component that wraps all app-level context providers
 * Add new providers here as your app grows
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <RootProvider
        theme={{
          enabled: false,
        }}
      >
        {children}
      </RootProvider>
    </ThemeProvider>
  );
}
