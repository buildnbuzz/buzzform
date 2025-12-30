"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

const PAYLOAD_THEME_KEY = "payload-theme";

// Syncs next-themes resolvedTheme to Payload's localStorage key
function PayloadThemeSync() {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    if (resolvedTheme) {
      document.documentElement.setAttribute("data-theme", resolvedTheme);
      window.localStorage.setItem(PAYLOAD_THEME_KEY, resolvedTheme);

      // Dispatch event for same-tab Payload admin sync
      window.dispatchEvent(
        new CustomEvent("payload-theme-change", {
          detail: { theme: resolvedTheme },
        })
      );
    }
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <PayloadThemeSync />
      {children}
    </NextThemesProvider>
  );
}
