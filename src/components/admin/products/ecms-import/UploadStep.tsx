import { Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UploadStepProps } from "./types";

export const UploadStep = ({ onFileUpload, onDownloadTemplate }: UploadStepProps) => {
  return (
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
          onChange={onFileUpload}
          className="max-w-xs mx-auto"
        />
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="sm" onClick={onDownloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>
    </div>
  );
};
