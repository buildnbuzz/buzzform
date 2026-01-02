"use client";

import { lazy, Suspense } from "react";
import type { IconLibraryName } from "shadcn/icons";

function IconFallback({
  size = 24,
  ...props
}: { size?: number } & React.ComponentProps<"svg">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  );
}

const IconLucide = lazy(() =>
  import("@/registry/icons/lucide").then((mod) => ({
    default: mod.IconLucide,
  }))
);

const IconTabler = lazy(() =>
  import("@/registry/icons/tabler").then((mod) => ({
    default: mod.IconTabler,
  }))
);

const IconHugeicons = lazy(() =>
  import("@/registry/icons/hugeicons").then((mod) => ({
    default: mod.IconHugeicons,
  }))
);

const IconPhosphor = lazy(() =>
  import("@/registry/icons/phosphor").then((mod) => ({
    default: mod.IconPhosphor,
  }))
);

export type IconPlaceholderProps = {
  [K in IconLibraryName]?: string;
} & Omit<React.ComponentProps<"svg">, "name"> & { size?: number };

export function IconPlaceholder({
  lucide,
  tabler,
  hugeicons,
  phosphor,
  ...props
}: IconPlaceholderProps) {
  const iconName = lucide ?? tabler ?? hugeicons ?? phosphor;

  if (!iconName) {
    return null;
  }

  return (
    <Suspense fallback={<IconFallback size={props.size} />}>
      {lucide && <IconLucide name={lucide} {...props} />}
      {!lucide && tabler && <IconTabler name={tabler} {...props} />}
      {!lucide && !tabler && hugeicons && (
        <IconHugeicons name={hugeicons} {...props} />
      )}
      {!lucide && !tabler && !hugeicons && phosphor && (
        <IconPhosphor name={phosphor} {...props} />
      )}
    </Suspense>
  );
}
