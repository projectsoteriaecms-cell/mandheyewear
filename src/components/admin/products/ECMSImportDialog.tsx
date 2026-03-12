import { useState, useCallback, useMemo } from "react";
import ExcelJS from "exceljs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileSpreadsheet, ArrowLeft, ArrowRight } from "lucide-react";
import {
  detectColumnMappings,
  transformRowToProduct,
  generateECMSTemplate,
  type ParsedProduct,
  type DuplicateHandling,
  type ImportOptions,
} from "@/modules/products";
import { useECMSImport } from "@/modules/products";
import {
  type Step,
  type ImportState,
  UploadStep,
  MappingStep,
  PreviewStep,
  OptionsStep,
  ProgressStep,
  SummaryStep,
  StepIndicator,
} from "./ecms-import";

interface ECMSImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INITIAL_STATE: ImportState = {
  file: null,
  rawData: [],
  headers: [],
  columnMappings: {},
  parsedProducts: [],
  allErrors: [],
  allWarnings: [],
  showOnlyErrors: false,
  batchSize: 100,
  duplicateHandling: "skip",
  createFrameAttributes: true,
};

export const ECMSImportDialog = ({ open, onOpenChange }: ECMSImportDialogProps) => {
  const [step, setStep] = useState<Step>("upload");
  const [state, setState] = useState<ImportState>(INITIAL_STATE);

  const { importProducts, isImporting, progress, cancelImport, resetProgress } = useECMSImport();

  const resetState = useCallback(() => {
    setStep("upload");
    setState(INITIAL_STATE);
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

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      const fileName = uploadedFile.name.toLowerCase();
      if (fileName.endsWith(".csv")) {
        await workbook.csv.read(new Blob([arrayBuffer]).stream() as any);
      } else {
        await workbook.xlsx.load(arrayBuffer);
      }
      const worksheet = workbook.worksheets[0];
      if (!worksheet || worksheet.rowCount === 0) {
        throw new Error("No data found in file");
      }

      // Extract headers from first row
      const headerRow = worksheet.getRow(1);
      const extractedHeaders: string[] = [];
      headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        extractedHeaders[colNumber - 1] = cell.value?.toString() || `Column ${colNumber}`;
      });

      // Convert rows to array of objects (same format as xlsx utils.sheet_to_json)
      const jsonData: Record<string, any>[] = [];
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        const rowObj: Record<string, any> = {};
        extractedHeaders.forEach((header, idx) => {
          const cell = row.getCell(idx + 1);
          rowObj[header] = cell.value ?? "";
        });
        jsonData.push(rowObj);
      });

      if (jsonData.length === 0) {
        throw new Error("No data rows found in file");
      }
      const autoMappings = detectColumnMappings(extractedHeaders);

      setState((prev) => ({
        ...prev,
        file: uploadedFile,
        headers: extractedHeaders,
        rawData: jsonData,
        columnMappings: autoMappings,
      }));

      setStep("mapping");
    } catch (error) {
      console.error("File parsing error:", error);
      alert("Failed to parse file: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }, []);

  const handleMappingChange = useCallback((sourceCol: string, dbField: string) => {
    setState((prev) => ({
      ...prev,
      columnMappings: { ...prev.columnMappings, [sourceCol]: dbField },
    }));
  }, []);

  const processData = useCallback(() => {
    const products: ParsedProduct[] = [];
    const errors: typeof state.allErrors = [];
    const warnings: typeof state.allWarnings = [];

    state.rawData.forEach((row, index) => {
      const result = transformRowToProduct(row, state.columnMappings, index + 2);
      if (result.errors.length === 0 && result.product.name && result.product.sku && result.product.price) {
        products.push(result.product as ParsedProduct);
      }
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    });

    setState((prev) => ({
      ...prev,
      parsedProducts: products,
      allErrors: errors,
      allWarnings: warnings,
    }));
    setStep("preview");
  }, [state.rawData, state.columnMappings]);

  const startImport = useCallback(async () => {
    setStep("importing");

    const options: ImportOptions = {
      batchSize: state.batchSize,
      duplicateHandling: state.duplicateHandling,
      createFrameAttributes: state.createFrameAttributes,
    };

    await importProducts(state.parsedProducts, options, state.file?.name);
    setStep("summary");
  }, [state, importProducts]);

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
    if (state.showOnlyErrors) {
      const errorRows = new Set(state.allErrors.map((e) => e.row));
      return state.rawData.filter((_, i) => errorRows.has(i + 2)).slice(0, 10);
    }
    return state.rawData.slice(0, 10);
  }, [state.rawData, state.allErrors, state.showOnlyErrors]);

  const requiredFieldsMapped = useMemo(() => {
    const mapped = Object.values(state.columnMappings);
    return (
      mapped.includes("name") &&
      mapped.includes("sku") &&
      mapped.includes("brand_line") &&
      mapped.includes("price")
    );
  }, [state.columnMappings]);

  const handleBack = useCallback(() => {
    const steps: Step[] = ["upload", "mapping", "preview", "options"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) setStep(steps[currentIndex - 1]);
  }, [step]);

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

        <StepIndicator currentStep={step} />

        <ScrollArea className="flex-1 pr-4">
          {step === "upload" && (
            <UploadStep
              state={state}
              onFileUpload={handleFileUpload}
              onDownloadTemplate={downloadTemplate}
            />
          )}

          {step === "mapping" && (
            <MappingStep
              state={state}
              onMappingChange={handleMappingChange}
              requiredFieldsMapped={requiredFieldsMapped}
            />
          )}

          {step === "preview" && (
            <PreviewStep
              state={state}
              onToggleShowErrors={(show) => setState((prev) => ({ ...prev, showOnlyErrors: show }))}
              previewProducts={previewProducts}
            />
          )}

          {step === "options" && (
            <OptionsStep
              state={state}
              onBatchSizeChange={(val) => setState((prev) => ({ ...prev, batchSize: val }))}
              onDuplicateHandlingChange={(val) => setState((prev) => ({ ...prev, duplicateHandling: val }))}
              onCreateFrameAttributesChange={(val) => setState((prev) => ({ ...prev, createFrameAttributes: val }))}
            />
          )}

          {step === "importing" && (
            <ProgressStep progress={progress} onCancel={cancelImport} />
          )}

          {step === "summary" && (
            <SummaryStep progress={progress} onDownloadErrorLog={downloadErrorLog} />
          )}
        </ScrollArea>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <div>
            {step !== "upload" && step !== "importing" && step !== "summary" && (
              <Button variant="outline" onClick={handleBack}>
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
              <Button onClick={() => setStep("options")} disabled={state.parsedProducts.length === 0}>
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
