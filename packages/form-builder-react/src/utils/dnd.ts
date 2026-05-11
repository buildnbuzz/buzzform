export function isInsideContainerPadding(
  activatorEvent: MouseEvent | TouchEvent,
  containerId: string,
  paddingThreshold: number = 20
): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  const containerEl = document.getElementById(containerId);
  if (!containerEl) {
    return false;
  }

  const pointerY =
    "clientY" in activatorEvent
      ? (activatorEvent as MouseEvent).clientY
      : "touches" in activatorEvent && (activatorEvent as TouchEvent).touches.length > 0
      ? (activatorEvent as TouchEvent).touches[0]?.clientY ?? 0
      : 0;

  const rect = containerEl.getBoundingClientRect();

  // If we only want the actual "padding" (edges)
  if (paddingThreshold > 0) {
    const inTopPadding = pointerY >= rect.top && pointerY <= rect.top + paddingThreshold;
    const inBottomPadding = pointerY <= rect.bottom && pointerY >= rect.bottom - paddingThreshold;
    return inTopPadding || inBottomPadding;
  }

  return pointerY >= rect.top && pointerY <= rect.bottom;
}
