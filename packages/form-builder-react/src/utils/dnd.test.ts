import { describe, it, expect, vi, beforeEach } from "vitest";
import { isInsideContainerPadding } from "./dnd";

describe("isInsideContainerPadding", () => {
  beforeEach(() => {
    vi.stubGlobal("document", {
      getElementById: vi.fn(),
    });
  });

  it("should return false if document is undefined (SSR)", () => {
    vi.unstubAllGlobals();
    vi.stubGlobal("document", undefined);
    
    const result = isInsideContainerPadding({} as MouseEvent, "test-id");
    expect(result).toBe(false);
  });

  it("should return false if element is not found", () => {
    vi.mocked(document.getElementById).mockReturnValue(null);
    
    const result = isInsideContainerPadding({} as MouseEvent, "missing-id");
    expect(result).toBe(false);
  });

  it("should calculate correctly based on thresholds using MouseEvent", () => {
    const mockElement = {
      getBoundingClientRect: () => ({
        top: 100,
        bottom: 200,
        height: 100,
        left: 0,
        right: 100,
        width: 100,
      }),
    } as unknown as HTMLElement;
    
    vi.mocked(document.getElementById).mockReturnValue(mockElement);

    const eventInTopBound = { clientY: 110 } as MouseEvent;
    const eventInMiddle = { clientY: 150 } as MouseEvent;
    const eventInBottomBound = { clientY: 195 } as MouseEvent;
    const eventOutside = { clientY: 50 } as MouseEvent;

    // Test with default threshold 20
    expect(isInsideContainerPadding(eventInTopBound, "test", 20)).toBe(true);
    expect(isInsideContainerPadding(eventInMiddle, "test", 20)).toBe(false);
    expect(isInsideContainerPadding(eventInBottomBound, "test", 20)).toBe(true);
    expect(isInsideContainerPadding(eventOutside, "test", 20)).toBe(false);
    
    // Test with 0 threshold (entire bounds)
    expect(isInsideContainerPadding(eventInTopBound, "test", 0)).toBe(true);
    expect(isInsideContainerPadding(eventInMiddle, "test", 0)).toBe(true);
    expect(isInsideContainerPadding(eventInBottomBound, "test", 0)).toBe(true);
    expect(isInsideContainerPadding(eventOutside, "test", 0)).toBe(false);
  });
});
