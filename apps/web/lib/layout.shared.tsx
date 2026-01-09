import { NewTwitterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Image
            src="/bb-icon.svg"
            alt="BuzzForm"
            width={24}
            height={24}
            className="dark:invert-0 invert"
          />
          <span>BuzzForm</span>
        </>
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
