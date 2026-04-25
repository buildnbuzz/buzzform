import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  LocalStorageProvider,
  getBrowserLocalStorageProvider,
} from "./local-storage-provider";
import type { FormSchema } from "@buildnbuzz/form-core";

describe("LocalStorageProvider", () => {
  let storageMock: Record<string, string>;
  let mockStorage: Storage;
  let provider: LocalStorageProvider;

  beforeEach(() => {
    storageMock = {};
    mockStorage = {
      getItem: vi.fn((key: string) => storageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        storageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete storageMock[key];
      }),
      clear: vi.fn(() => {
        storageMock = {};
      }),
      key: vi.fn((index: number) => Object.keys(storageMock)[index] || null),
      get length() {
        return Object.keys(storageMock).length;
      },
    };

    provider = new LocalStorageProvider({
      storage: mockStorage,
      namespace: "test",
    });
  });

  it("saves and loads a document", async () => {
    const doc: FormSchema = {
      id: "f1",
      title: "My Form",
      fields: [{ type: "text", name: "name" }],
    };

    await provider.save("f1", doc);

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      "test:document:f1",
      JSON.stringify(doc),
    );

    const loaded = await provider.load("f1");
    expect(loaded).toEqual(doc);
  });

  it("lists summaries", async () => {
    const doc1: FormSchema = {
      id: "f1",
      title: "Form 1",
      fields: [],
    };
    const doc2: FormSchema = {
      id: "f2",
      title: "Form 2",
      fields: [],
    };

    await provider.save("f1", doc1);
    await provider.save("f2", doc2);

    const summaries = await provider.list();
    expect(summaries).toHaveLength(2);
    expect(summaries.map((s) => s.formId)).toEqual(
      expect.arrayContaining(["f1", "f2"]),
    );
    expect(summaries.find((s) => s.formId === "f1")!.formName).toBe("Form 1");
  });

  it("removes a document", async () => {
    const doc: FormSchema = {
      id: "f1",
      title: "Form 1",
      fields: [],
    };

    await provider.save("f1", doc);
    await provider.remove("f1");

    expect(await provider.load("f1")).toBeNull();
    const summaries = await provider.list();
    expect(summaries).toHaveLength(0);
  });

  it("returns null when loading non-existent document", async () => {
    const loaded = await provider.load("not-found");
    expect(loaded).toBeNull();
  });
});

describe("getBrowserLocalStorageProvider", () => {
  it("creates a singleton", () => {
    // Need to mock window.localStorage for this test
    const originalWindow = global.window;

    (global as unknown as { window: unknown }).window = {
      localStorage: {},
    };

    try {
      const p1 = getBrowserLocalStorageProvider();
      const p2 = getBrowserLocalStorageProvider();
      expect(p1).toBe(p2);
    } finally {
      (global as unknown as { window: unknown }).window = originalWindow;
    }
  });
});
