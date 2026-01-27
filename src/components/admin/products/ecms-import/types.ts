import type { ParsedProduct, ValidationError, ImportProgress, DuplicateHandling } from "@/modules/products";

export type Step = "upload" | "mapping" | "preview" | "options" | "importing" | "summary";

export interface ImportState {
  file: File | null;
  rawData: Record<string, any>[];
  headers: string[];
  columnMappings: Record<string, string>;
  parsedProducts: ParsedProduct[];
  allErrors: ValidationError[];
  allWarnings: ValidationError[];
  showOnlyErrors: boolean;
  batchSize: number;
  duplicateHandling: DuplicateHandling;
  createFrameAttributes: boolean;
}

export interface StepProps {
  state: ImportState;
}

export interface UploadStepProps extends StepProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
}

export interface MappingStepProps extends StepProps {
  onMappingChange: (sourceCol: string, dbField: string) => void;
  requiredFieldsMapped: boolean;
}

export interface PreviewStepProps extends StepProps {
  onToggleShowErrors: (show: boolean) => void;
  previewProducts: Record<string, any>[];
}

export interface OptionsStepProps extends StepProps {
  onBatchSizeChange: (value: number) => void;
  onDuplicateHandlingChange: (value: DuplicateHandling) => void;
  onCreateFrameAttributesChange: (value: boolean) => void;
}

export interface ProgressStepProps {
  progress: ImportProgress | null;
  onCancel: () => void;
}

export interface SummaryStepProps {
  progress: ImportProgress | null;
  onDownloadErrorLog: () => void;
}
