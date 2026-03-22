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

## Output transforms

`form-core` can flatten nested submission data into path-keyed output when an integration needs it.

```ts
import { transformFormOutput } from "@buildnbuzz/form-core";

const payload = transformFormOutput(
  {
    profile: { name: "Ada" },
  },
  { type: "path" },
);

// { "profile.name": "Ada" }
```
