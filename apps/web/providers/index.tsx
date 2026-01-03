"use client";

import * as React from "react";
import { ThemeProvider } from "./theme";
import { RootProvider } from "fumadocs-ui/provider/next";
import { BuzzFormProvider } from "./buzz-form";

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
        <BuzzFormProvider>{children}</BuzzFormProvider>
      </RootProvider>
    </ThemeProvider>
  );
}
