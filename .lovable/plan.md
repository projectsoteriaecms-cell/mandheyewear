

## Fix High Severity Dependency Vulnerabilities

### Two Issues

**1. `xlsx` (SheetJS) — Prototype Pollution + ReDoS**
The npm package is permanently stuck at 0.18.5 (maintainer stopped publishing to npm). The fix versions (0.20.2+) are only available from SheetJS's own CDN/registry. Since our usage is minimal (just `read()` and `utils.sheet_to_json()` for parsing uploaded Excel/CSV files), the cleanest fix is to replace `xlsx` with `exceljs` — an actively maintained, vulnerability-free alternative that handles the same use cases.

**2. `@snap/camera-kit` — Prototype Pollution in protobufjs**
Already pinned to `1.13.0` in `package.json` which includes the fix. The scanner is likely flagging a stale lockfile entry. Regenerating the lockfile will resolve this.

### Changes

**Replace `xlsx` with `exceljs`**

- Remove `xlsx` from `package.json`, add `exceljs` (latest, ~4.4.0)
- Update **`src/components/admin/products/ECMSImportDialog.tsx`**: Replace `import { read, utils } from "xlsx"` with ExcelJS equivalents — use `new ExcelJS.Workbook().xlsx.load(arrayBuffer)` then iterate rows to produce the same `Record<string, any>[]` output
- Update **`src/modules/inventory/hooks/useBulkStockUpdate.ts`**: Replace `XLSX.read()` and `XLSX.utils.sheet_to_json()` with the same ExcelJS pattern
- Delete the `xlsx` dependency

**Lockfile regeneration for `@snap/camera-kit`**
- This happens automatically when `package.json` changes (xlsx removal + exceljs addition)

### Files Changed
- `package.json` — swap `xlsx` for `exceljs`
- `src/components/admin/products/ECMSImportDialog.tsx` — update Excel parsing
- `src/modules/inventory/hooks/useBulkStockUpdate.ts` — update Excel parsing

### What Stays the Same
- All parsing logic produces identical output (array of row objects)
- No UI changes
- No database changes
- CSV template generation (`generateECMSTemplate`) doesn't use xlsx, so no change needed

