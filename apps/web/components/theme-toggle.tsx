"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun03Icon, Moon02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  // Show a neutral state during SSR and initial hydration
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="group/toggle extend-touch-target size-8"
        disabled
        title="Toggle theme"
      >
        <div className="size-4.5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="group/toggle extend-touch-target size-8"
      onClick={toggleTheme}
      title="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <HugeiconsIcon icon={Sun03Icon} strokeWidth={2} />
      ) : (
        <HugeiconsIcon icon={Moon02Icon} strokeWidth={2} />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
