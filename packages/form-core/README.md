# @buildnbuzz/form-core

Framework-agnostic core primitives for BuzzForm.

## Schema metadata

`FormSchema` supports lightweight runtime metadata without changing validation or inference behavior.

```ts
import type { FormSchema } from "@buildnbuzz/form-core";

const schema: FormSchema = {
  id: "contact-form",
  title: "Contact form",
  description: "Collect contact details and a message.",
  fields: [{ type: "text", name: "email" }],
};
```
