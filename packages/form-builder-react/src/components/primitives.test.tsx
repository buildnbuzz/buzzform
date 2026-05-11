/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { DefaultBuilderProvider } from "../context/builder-context";
import { BuilderCanvas } from "./builder-canvas";
import { BuilderSidebar } from "./builder-sidebar";
import { BuilderProperties } from "./builder-properties";
import type { BuilderFieldRegistry } from "../types";

const mockRegistry: BuilderFieldRegistry = {
  text: {
    kind: "data",
    sidebar: { label: "Text Field", icon: { lucide: "TextCursorInput" }, category: "inputs" },
    defaultProps: { type: "text", label: "New Field" },
    properties: [
      { type: "text", name: "label", label: "Field Label" }
    ]
  },
};

describe("Headless Components Smoke Tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("BuilderCanvas renders root nodes", () => {
    render(
      <DefaultBuilderProvider registry={mockRegistry}>
        <BuilderCanvas 
          render={({ renderRoots }) => (
            <div data-testid="canvas">{renderRoots()}</div>
          )}
          nodeRenderer={({ node }) => (
            <div data-testid="node">{node.field.type}</div>
          )}
        />
      </DefaultBuilderProvider>
    );

    // Initial state is empty
    expect(screen.getByTestId("canvas")).toBeDefined();
    expect(screen.queryByTestId("node")).toBeNull();
  });

  it("BuilderSidebar provides grouped fields", () => {
    render(
      <DefaultBuilderProvider registry={mockRegistry}>
        <BuilderSidebar 
          render={({ groups }) => (
            <div>
              {Object.keys(groups).map(cat => (
                <div key={cat} data-testid={`group-${cat}`}>
                  {groups[cat]?.map(item => (
                    <span key={item.type}>{item.label}</span>
                  ))}
                </div>
              ))}
            </div>
          )}
        />
      </DefaultBuilderProvider>
    );

    expect(screen.getByTestId("group-inputs")).toBeDefined();
    expect(screen.getByText("Text Field")).toBeDefined();
  });

  it("BuilderProperties provides selection context", () => {
    render(
      <DefaultBuilderProvider registry={mockRegistry}>
        <BuilderProperties 
          render={({ node, schema }) => (
            <div data-testid="properties">
              {node ? `Selected: ${node.field.type}` : "None"}
              {schema && <div data-testid="schema-len">{schema.length}</div>}
            </div>
          )}
        />
      </DefaultBuilderProvider>
    );

    expect(screen.getByTestId("properties").textContent).toContain("None");
  });

  it("BuilderProperties provides form settings when no node is selected", () => {
    render(
      <DefaultBuilderProvider registry={mockRegistry}>
        <BuilderProperties 
          render={({ node, schema }) => (
            <div data-testid="properties">
              {!node && <div data-testid="is-form-settings">{schema.length > 0 ? "Has Settings" : "Empty"}</div>}
            </div>
          )}
        />
      </DefaultBuilderProvider>
    );

    // Should detect that schema is non-empty (formSettingsProperties has fields)
    expect(screen.getByTestId("is-form-settings").textContent).toBe("Has Settings");
  });
});
