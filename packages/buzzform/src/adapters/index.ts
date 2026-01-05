// =============================================================================
// ADAPTERS
// 
// The adapter layer provides a unified interface for different form libraries.
// Currently, we ship with a React Hook Form adapter (recommended).
// 
// Users can create custom adapters for other libraries by implementing the
// FormAdapter interface. See the type definitions for requirements.
// =============================================================================

// React Hook Form adapter (recommended)
export { useRhf, useRhfWatch } from './rhf';
export type { RhfAdapterOptions, RhfForm } from './rhf';
