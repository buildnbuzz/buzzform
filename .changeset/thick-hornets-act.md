---
"@buildnbuzz/buzzform": patch
---

**Fixes**
- Defaulted boolean schema values for `checkbox` and `switch` to `false` when values are missing, preventing submit-time `Invalid value` errors for untouched fields.
- Kept required boolean behavior intact by still requiring `true` when `required: true` is set.

**Types**
- Expanded `ui.columns` typing for `checkbox-group` and `radio` to `number | string | undefined`, enabling the builder's `Auto` (`""`) option for natural horizontal flow layouts.
