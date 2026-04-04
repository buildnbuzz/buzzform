# @buildnbuzz/form-builder-core

Framework-agnostic form builder primitives for BuzzForm. Zero DOM or UI dependencies.

> **Status:** Under active development. API is not yet stable.

## Installation

```bash
pnpm add @buildnbuzz/form-builder-core
```

## Quick Start

Coming soon.

## Core Features

### Node Management

The builder represents form schemas as a tree of `Node` objects — each wrapping a `Field` definition from `@buildnbuzz/form-core`. Nodes are stored as a flat adjacency list for efficient manipulation.

### Schema Conversion

Convert builder node trees into `@buildnbuzz/form-core` `Field[]` schemas for rendering and validation.

### Import / Export

Serialize builder documents to JSON and parse them back with full schema validation and migration support.

### Code Generation

Generate component code strings from a builder document for export and integration.

## Resources

- [@buildnbuzz/form-core](../form-core/README.md) — Schema engine and validation
- [@buildnbuzz/form-react](../form-react/README.md) — React adapter
