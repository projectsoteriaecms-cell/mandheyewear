import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { transformRowToProduct } from "@/modules/products";
import type { PreviewStepProps } from "./types";

export const PreviewStep = ({
  state,
  onToggleShowErrors,
  previewProducts,
}: PreviewStepProps) => {
  const { rawData, columnMappings, parsedProducts, allErrors, allWarnings, showOnlyErrors } = state;

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            {parsedProducts.length} valid
          </Badge>
          <Badge variant="outline" className="gap-1">
            <XCircle className="h-3 w-3 text-destructive" />
            {allErrors.length} errors
          </Badge>
          <Badge variant="outline" className="gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            {allWarnings.length} warnings
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="show-errors" className="text-sm">
            Show only errors
          </Label>
          <Switch
            id="show-errors"
            checked={showOnlyErrors}
            onCheckedChange={onToggleShowErrors}
          />
        </div>
      </div>

      {allErrors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
          <p className="font-medium text-destructive mb-2">Validation Errors</p>
          <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
            {allErrors.slice(0, 10).map((error, i) => (
              <li key={i}>
                Row {error.row}: {error.message}
                {error.value && ` (value: "${error.value}")`}
              </li>
            ))}
            {allErrors.length > 10 && (
              <li className="text-muted-foreground">
                ...and {allErrors.length - 10} more errors
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewProducts.map((row, i) => {
              const transformed = transformRowToProduct(row, columnMappings, i + 2);
              const hasErrors = transformed.errors.length > 0;
              return (
                <TableRow key={i} className={hasErrors ? "bg-destructive/5" : ""}>
                  <TableCell>{transformed.product.name || "—"}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {transformed.product.sku || "—"}
                  </TableCell>
                  <TableCell>{transformed.product.brand || "—"}</TableCell>
                  <TableCell className="capitalize">
                    {transformed.product.item_type?.replace("_", " ") || "—"}
                  </TableCell>
                  <TableCell>
                    {transformed.product.price
                      ? `₦${transformed.product.price.toLocaleString()}`
                      : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Showing first {previewProducts.length} of {rawData.length} rows
      </p>
    </div>
  );
};
