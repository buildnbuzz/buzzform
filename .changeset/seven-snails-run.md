---
"@buildnbuzz/buzzform": patch
---

**Features**
- Added `checkbox-group` as a first-class field type with schema + type support.
- Added `minSelected` and `maxSelected` for multi-select `select` (`hasMany`) and `checkbox-group`.

**Fixes**
- Improved multi-select validation edge cases for `required` and `minSelected` combinations.
- Standardized optional `checkbox-group` handling via shared optional schema helpers.
