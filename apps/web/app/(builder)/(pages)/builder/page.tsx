import { Canvas } from "../../components/canvas";
import { MobileOverlay } from "../../components/mobile-overlay";

export default function Page() {
  return (
    <div className="relative flex flex-1">
      <Canvas />
      <MobileOverlay />
    </div>
  );
}
