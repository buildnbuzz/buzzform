import { NewTwitterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";
import { siteConfig } from "./constants";
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-primary-foreground">
            <Image
              src={siteConfig.logo}
              alt={siteConfig.name}
              width={24}
              height={24}
              className="invert dark:invert-0"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{siteConfig.name}</span>
            <span className="truncate text-xs text-muted-foreground">Docs</span>
          </div>
        </div>
      ),
    },
    links: [
      {
        type: "icon",
        label: "X (Twitter)",
        icon: <HugeiconsIcon icon={NewTwitterIcon} />,
        text: "X",
        url: "https://x.com/buildnbuzz",
      },
    ],
    githubUrl: "https://github.com/buildnbuzz/buzzform",
  };
}
