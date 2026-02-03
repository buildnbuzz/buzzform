import type { Metadata } from "next";
import { Canvas } from "../../components/canvas";
import { MobileOverlay } from "../../components/mobile-overlay";

export const metadata: Metadata = {
  title: "Builder",
  description: "Drag, drop, and build beautiful BuzzForm layouts.",
  openGraph: {
    title: "Builder",
    description: "Drag, drop, and build beautiful BuzzForm layouts.",
    images: [
      {
        url: "/buzzform-builder.png",
        width: 1200,
        height: 630,
        alt: "BuzzForm Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Builder",
    description: "Drag, drop, and build beautiful BuzzForm layouts.",
    images: ["/buzzform-builder.png"],
  },
};

export default function Page() {
  return (
    <div className="relative flex flex-1">
      <Canvas />
      <MobileOverlay />
    </div>
  );
}
