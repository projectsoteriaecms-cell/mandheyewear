import { useState, useCallback, useMemo } from "react";
import { read, utils } from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  ArrowLeft,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";
import {
  detectColumnMappings,
  transformRowToProduct,
  generateECMSTemplate,
  DATABASE_FIELDS,
  type ParsedProduct,
  type ValidationError,
} from "@/lib/ecms-parser";
import { useECMSImport, type DuplicateHandling, type ImportOptions } from "@/hooks/admin/useECMSImport";

interface ECMSImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "upload" | "mapping" | "preview" | "options" | "importing" | "summary";

export const ECMSImportDialog = ({ open, onOpenChange }: ECMSImportDialogProps) => {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [allErrors, setAllErrors] = useState<ValidationError[]>([]);
  const [allWarnings, setAllWarnings] = useState<ValidationError[]>([]);
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);

  // Import options
  const [batchSize, setBatchSize] = useState(100);
  const [duplicateHandling, setDuplicateHandling] = useState<DuplicateHandling>("skip");
  const [createFrameAttributes, setCreateFrameAttributes] = useState(true);

  const { importProducts, isImporting, progress, cancelImport, resetProgress } = useECMSImport();

  const resetState = useCallback(() => {
    setStep("upload");
    setFile(null);
    setRawData([]);
    setHeaders([]);
    setColumnMappings({});
    setParsedProducts([]);
    setAllErrors([]);
    setAllWarnings([]);
    setShowOnlyErrors(false);
    setBatchSize(100);
    setDuplicateHandling("skip");
    setCreateFrameAttributes(true);
    resetProgress();
  }, [resetProgress]);

  const handleClose = useCallback(() => {
    if (isImporting) {
      cancelImport();
    }
    resetState();
    onOpenChange(false);
  }, [isImporting, cancelImport, resetState, onOpenChange]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const workbook = read(arrayBuffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: "" });

      if (jsonData.length === 0) {
        throw new Error("No data found in file");
      }

      const extractedHeaders = Object.keys(jsonData[0]);
      setHeaders(extractedHeaders);
      setRawData(jsonData);

      // Auto-detect column mappings
      const autoMappings = detectColumnMappings(extractedHeaders);
      setColumnMappings(autoMappings);

      setStep("mapping");
    } catch (error) {
      console.error("File parsing error:", error);
      alert("Failed to parse file: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }, []);

  const handleMappingChange = useCallback((sourceCol: string, dbField: string) => {
    setColumnMappings((prev) => ({
      ...prev,
      [sourceCol]: dbField,
    }));
  }, []);

  const processData = useCallback(() => {
    const products: ParsedProduct[] = [];
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    rawData.forEach((row, index) => {
      const result = transformRowToProduct(row, columnMappings, index + 2);
      if (result.errors.length === 0 && result.product.name && result.product.sku && result.product.price) {
        products.push(result.product as ParsedProduct);
      }
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    });

    setParsedProducts(products);
    setAllErrors(errors);
    setAllWarnings(warnings);
    setStep("preview");
  }, [rawData, columnMappings]);

  const startImport = useCallback(async () => {
    setStep("importing");

    const options: ImportOptions = {
      batchSize,
      duplicateHandling,
      createFrameAttributes,
    };

    await importProducts(parsedProducts, options, file?.name);
    setStep("summary");
  }, [batchSize, duplicateHandling, createFrameAttributes, parsedProducts, importProducts, file]);

  const downloadTemplate = useCallback(() => {
    const csv = generateECMSTemplate();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ecms-product-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const downloadErrorLog = useCallback(() => {
    if (!progress?.errors.length) return;

    const headers = ["Row", "Column", "Message", "Value"];
    const rows = progress.errors.map((e) => [e.row, e.column, e.message, e.value || ""].join(","));
    const csv = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-errors.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [progress]);

  const previewProducts = useMemo(() => {
    if (showOnlyErrors) {
      const errorRows = new Set(allErrors.map((e) => e.row));
      return rawData.filter((_, i) => errorRows.has(i + 2)).slice(0, 10);
    }
    return rawData.slice(0, 10);
  }, [rawData, allErrors, showOnlyErrors]);

  const requiredFieldsMapped = useMemo(() => {
    const mapped = Object.values(columnMappings);
    return (
      mapped.includes("name") &&
      mapped.includes("sku") &&
      mapped.includes("brand_line") &&
      mapped.includes("price")
    );
  }, [columnMappings]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            ECMS Product Import
          </DialogTitle>
          <DialogDescription>
            Import products from ECMS Excel or CSV export files
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {(["upload", "mapping", "preview", "options", "importing", "summary"] as Step[]).map(
            (s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s
                      ? "bg-primary text-primary-foreground"
                      : ["upload", "mapping", "preview", "options", "importing", "summary"].indexOf(step) > i
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                {i < 5 && <div className="w-8 h-0.5 bg-muted" />}
              </div>
            )
          )}
        </div>

        <ScrollArea className="flex-1 pr-4">
          {/* Step 1: Upload */}
          {step === "upload" && (
            <div className="space-y-6 py-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Upload ECMS Export File</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports .xlsx and .csv files
                </p>
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="max-w-xs mx-auto"
                />
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {step === "mapping" && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{file?.name}</p>
                  <p className="text-sm text-muted-foreground">{rawData.length} rows detected</p>
                </div>
                {!requiredFieldsMapped && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Missing required mappings
                  </Badge>
                )}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Column</TableHead>
                    <TableHead>Maps To</TableHead>
                    <TableHead>Sample Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {headers.map((header) => {
                    const isRequired = ["name", "sku", "brand_line", "price"].includes(
                      columnMappings[header] || ""
                    );
                    return (
                      <TableRow key={header}>
                        <TableCell className="font-mono text-sm">{header}</TableCell>
                        <TableCell>
                          <Select
                            value={columnMappings[header] || "_skip"}
                            onValueChange={(val) => handleMappingChange(header, val)}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DATABASE_FIELDS.map((field) => (
                                <SelectItem key={field.value} value={field.value}>
                                  {field.label}
                                  {field.required && " *"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {rawData[0]?.[header] || "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === "preview" && (
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
                    onCheckedChange={setShowOnlyErrors}
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
          )}

          {/* Step 4: Options */}
          {step === "options" && (
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Batch Size: {batchSize}</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Number of products to process at a time
                  </p>
                  <Slider
                    value={[batchSize]}
                    onValueChange={([val]) => setBatchSize(val)}
                    min={25}
                    max={100}
                    step={25}
                  />
                </div>

                <div>
                  <Label className="text-base">Duplicate Handling</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    What to do when a product with the same SKU exists
                  </p>
                  <Select value={duplicateHandling} onValueChange={(v) => setDuplicateHandling(v as DuplicateHandling)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">Skip duplicates</SelectItem>
                      <SelectItem value="update">Update existing products</SelectItem>
                      <SelectItem value="fail">Report as error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Create Frame Attributes</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create frame_attributes records for frame products
                    </p>
                  </div>
                  <Switch
                    checked={createFrameAttributes}
                    onCheckedChange={setCreateFrameAttributes}
                  />
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <p className="font-medium mb-2">Import Summary</p>
                <ul className="text-sm space-y-1">
                  <li>• {parsedProducts.length} products ready to import</li>
                  <li>• {allErrors.length} rows with errors (will be skipped)</li>
                  <li>• Batch size: {batchSize}</li>
                  <li>• Duplicate handling: {duplicateHandling}</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 5: Importing */}
          {step === "importing" && progress && (
            <div className="space-y-6 py-8">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-lg font-medium">Importing Products...</p>
                <p className="text-sm text-muted-foreground">
                  Batch {progress.currentBatch} of {progress.totalBatches}
                </p>
              </div>

              <Progress value={(progress.processed / progress.total) * 100} className="h-3" />

              <div className="text-center text-sm text-muted-foreground">
                {progress.processed} of {progress.total} products processed
                {progress.estimatedTimeRemaining !== null && progress.estimatedTimeRemaining > 0 && (
                  <span className="ml-2">
                    • ~{progress.estimatedTimeRemaining < 60 
                      ? `${progress.estimatedTimeRemaining}s` 
                      : `${Math.floor(progress.estimatedTimeRemaining / 60)}m ${progress.estimatedTimeRemaining % 60}s`} remaining
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{progress.inserted}</p>
                  <p className="text-sm text-muted-foreground">Inserted</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{progress.updated}</p>
                  <p className="text-sm text-muted-foreground">Updated</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{progress.skipped}</p>
                  <p className="text-sm text-muted-foreground">Skipped</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive">{progress.failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>

              <div className="text-center">
                <Button variant="outline" onClick={cancelImport}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel Import
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Summary */}
          {step === "summary" && progress && (
            <div className="space-y-6 py-8">
              <div className="text-center">
                <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <p className="text-2xl font-bold">Import Complete!</p>
              </div>

              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                  <p className="text-3xl font-bold text-green-600">{progress.inserted}</p>
                  <p className="text-sm text-muted-foreground">Inserted</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                  <p className="text-3xl font-bold text-blue-600">{progress.updated}</p>
                  <p className="text-sm text-muted-foreground">Updated</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4">
                  <p className="text-3xl font-bold text-amber-600">{progress.skipped}</p>
                  <p className="text-sm text-muted-foreground">Skipped</p>
                </div>
                <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4">
                  <p className="text-3xl font-bold text-destructive">{progress.failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>

              {progress.errors.length > 0 && (
                <div className="flex justify-center">
                  <Button variant="outline" onClick={downloadErrorLog}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Error Log
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <div>
            {step !== "upload" && step !== "importing" && step !== "summary" && (
              <Button
                variant="outline"
                onClick={() => {
                  const steps: Step[] = ["upload", "mapping", "preview", "options"];
                  const currentIndex = steps.indexOf(step);
                  if (currentIndex > 0) setStep(steps[currentIndex - 1]);
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {step === "mapping" && (
              <Button onClick={processData} disabled={!requiredFieldsMapped}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {step === "preview" && (
              <Button onClick={() => setStep("options")} disabled={parsedProducts.length === 0}>
                Configure Import
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {step === "options" && (
              <Button onClick={startImport}>
                Start Import
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {step === "summary" && (
              <Button onClick={handleClose}>Done</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
