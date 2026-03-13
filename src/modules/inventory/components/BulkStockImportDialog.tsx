import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Upload,
  Table as TableIcon,
  CheckCircle,
  Warning,
  XCircle,
  Info,
} from "@phosphor-icons/react";
import { useBranches } from "@/modules/branches";
import {
  useBulkStockUpdate,
  parseStockExcel,
  ParsedStockData,
  StockUpdateResult,
} from "@/modules/inventory/hooks/useBulkStockUpdate";
import { useAuth } from "@/shared/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface BulkStockImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "upload" | "preview" | "importing" | "complete";

export const BulkStockImportDialog = ({
  open,
  onOpenChange,
}: BulkStockImportDialogProps) => {
  const [step, setStep] = useState<Step>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedStockData | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [result, setResult] = useState<StockUpdateResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const { data: branches } = useBranches();
  const { user } = useAuth();
  const { updateStockAsync, isUpdating, progress, resetProgress } =
    useBulkStockUpdate();

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setSelectedFile(file);
      setParseError(null);

      try {
        const data = await parseStockExcel(file);
        setParsedData(data);
        setStep("preview");
      } catch (error) {
        setParseError(
          error instanceof Error ? error.message : "Failed to parse file"
        );
        toast({
          title: "Parse Error",
          description:
            error instanceof Error ? error.message : "Failed to parse file",
          variant: "destructive",
        });
      }
    },
    []
  );

  const handleImport = useCallback(async () => {
    if (!parsedData || !selectedBranch || !user?.id) {
      toast({
        title: "Missing Information",
        description: "Please select a branch and ensure data is parsed",
        variant: "destructive",
      });
      return;
    }

    setStep("importing");

    try {
      const importResult = await updateStockAsync({
        parsedData,
        branchId: selectedBranch,
        userId: user.id,
      });
      setResult(importResult);
      setStep("complete");
      toast({
        title: "Import Complete",
        description: `Successfully updated ${importResult.success} products`,
      });
    } catch (error) {
      setStep("preview");
      toast({
        title: "Import Failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  }, [parsedData, selectedBranch, user?.id, updateStockAsync]);

  const handleClose = useCallback(() => {
    setStep("upload");
    setSelectedFile(null);
    setParsedData(null);
    setSelectedBranch("");
    setResult(null);
    setParseError(null);
    resetProgress();
    onOpenChange(false);
  }, [onOpenChange, resetProgress]);

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TableIcon className="h-5 w-5" weight="light" />
            Import Stock Levels
          </DialogTitle>
          <DialogDescription>
            Upload an ECMS inventory report to update stock quantities
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {/* Step: Upload */}
          {step === "upload" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" weight="light" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload an Excel file (.xlsx) with ProductId and Qty columns
                </p>
                <label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button variant="outline" asChild>
                    <span>Select File</span>
                  </Button>
                </label>
              </div>

              {parseError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Parse Error</AlertTitle>
                  <AlertDescription>{parseError}</AlertDescription>
                </Alert>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Expected Format</AlertTitle>
                <AlertDescription>
                  The file should have: Column 1 = ProductId, Column 8 = Qty
                  (ECMS Inventory Report format)
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step: Preview */}
          {step === "preview" && parsedData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">
                    {formatNumber(parsedData.rows.length)}
                  </p>
                  <p className="text-xs text-muted-foreground">Products Found</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">
                    {formatNumber(parsedData.totalQuantity)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Units</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">
                    {parsedData.rows.filter((r) => r.quantity > 0).length}
                  </p>
                  <p className="text-xs text-muted-foreground">With Stock</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">
                    {parsedData.negativeCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Negatives (→0)</p>
                </div>
              </div>

              {parsedData.negativeCount > 0 && (
                <Alert>
                  <Warning className="h-4 w-4" />
                  <AlertTitle>Negative Quantities Detected</AlertTitle>
                  <AlertDescription>
                    {parsedData.negativeCount} products have negative stock
                    values. These will be set to 0.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Branch</label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch to update" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}{" "}
                        {branch.is_head_office && (
                          <Badge variant="secondary" className="ml-2">
                            HQ
                          </Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Sample Data Preview</p>
                <ScrollArea className="h-48 border rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="text-left p-2">Product ID</th>
                        <th className="text-left p-2">Name</th>
                        <th className="text-right p-2">Qty</th>
                        <th className="text-center p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.rows.slice(0, 50).map((row, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2 font-mono text-xs">
                            {row.externalId}
                          </td>
                          <td className="p-2 truncate max-w-[200px]">
                            {row.productName}
                          </td>
                          <td className="p-2 text-right font-mono">
                            {row.quantity}
                          </td>
                          <td className="p-2 text-center">
                            {row.wasNegative ? (
                              <Badge variant="outline" className="text-amber-600 text-xs">
                                Clamped
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-green-600 text-xs">
                                OK
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.rows.length > 50 && (
                    <p className="text-center text-xs text-muted-foreground py-2">
                      Showing 50 of {formatNumber(parsedData.rows.length)} rows
                    </p>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Step: Importing */}
          {step === "importing" && (
            <div className="space-y-6 py-8">
              <div className="text-center">
                <TableIcon className="h-12 w-12 mx-auto text-primary animate-pulse mb-4" weight="light" />
                <p className="text-lg font-medium">Updating Stock Levels</p>
                <p className="text-sm text-muted-foreground">
                  Please wait while we process your import...
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    {formatNumber(progress.processed)} /{" "}
                    {formatNumber(progress.total)}
                  </span>
                </div>
                <Progress
                  value={
                    progress.total > 0
                      ? (progress.processed / progress.total) * 100
                      : 0
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-green-600">
                    {formatNumber(progress.success)}
                  </p>
                  <p className="text-xs text-muted-foreground">Updated</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-red-600">
                    {formatNumber(progress.failed)}
                  </p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-amber-600">
                    {formatNumber(progress.skipped)}
                  </p>
                  <p className="text-xs text-muted-foreground">Skipped</p>
                </div>
              </div>
            </div>
          )}

          {/* Step: Complete */}
          {step === "complete" && result && (
            <div className="space-y-6 py-4">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" weight="light" />
                <p className="text-xl font-medium">Import Complete!</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-500/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {formatNumber(result.success)}
                  </p>
                  <p className="text-xs text-muted-foreground">Updated</p>
                </div>
                <div className="bg-red-500/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {formatNumber(result.failed)}
                  </p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
                <div className="bg-amber-500/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">
                    {formatNumber(result.skipped)}
                  </p>
                  <p className="text-xs text-muted-foreground">Skipped</p>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatNumber(result.negativesClamped)}
                  </p>
                  <p className="text-xs text-muted-foreground">Negatives→0</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Errors</p>
                  <ScrollArea className="h-32 border rounded-md p-2">
                    {result.errors.slice(0, 20).map((err, idx) => (
                      <p key={idx} className="text-xs text-muted-foreground">
                        <span className="font-mono">{err.externalId}</span>:{" "}
                        {err.error}
                      </p>
                    ))}
                    {result.errors.length > 20 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        + {result.errors.length - 20} more errors
                      </p>
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {step === "upload" && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}

          {step === "preview" && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("upload");
                  setSelectedFile(null);
                  setParsedData(null);
                }}
              >
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={!selectedBranch || isUpdating}
              >
                Import {formatNumber(parsedData?.rows.length || 0)} Products
              </Button>
            </>
          )}

          {step === "importing" && (
            <Button variant="outline" disabled>
              Importing...
            </Button>
          )}

          {step === "complete" && (
            <Button onClick={handleClose}>Done</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkStockImportDialog;
