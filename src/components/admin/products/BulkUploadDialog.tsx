import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAdminProducts } from "@/hooks/admin/useAdminProducts";
import { Upload, FileSpreadsheet, Download, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedProduct {
  name: string;
  sku: string;
  brand_line: "soteria_medical" | "m_and_h_fashion";
  price: number;
  cost_price?: number;
  description?: string;
  item_type?: string;
  color?: string;
  material?: string;
  style?: string;
  gender?: string;
  frame_width?: string;
  bridge_size?: string;
  temple_length?: string;
  reorder_level?: number;
  reorder_quantity?: number;
  lead_time_days?: number;
}

interface ParseResult {
  success: ParsedProduct[];
  errors: string[];
}

const CSV_TEMPLATE = `name,sku,brand_line,price,cost_price,description,item_type,color,material,style,gender,frame_width,bridge_size,temple_length,reorder_level,reorder_quantity,lead_time_days
"Ray-Ban Aviator Classic",RB-AV-001,soteria_medical,85000,45000,"Classic aviator style sunglasses",frames,Gold,Metal,Aviator,unisex,140mm,14mm,145mm,10,20,7
"Gucci Round Frame",GC-RF-002,m_and_h_fashion,120000,65000,"Luxury round frame glasses",frames,Black,Acetate,Round,female,138mm,16mm,140mm,5,10,14`;

export const BulkUploadDialog = ({
  open,
  onOpenChange,
}: BulkUploadDialogProps) => {
  const { bulkCreateProducts } = useAdminProducts();
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = useCallback((content: string): ParseResult => {
    const lines = content.split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      return { success: [], errors: ["File must have a header row and at least one data row"] };
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
    const requiredHeaders = ["name", "sku", "brand_line", "price"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      return { success: [], errors: [`Missing required columns: ${missingHeaders.join(", ")}`] };
    }

    const success: ParsedProduct[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Simple CSV parsing (handles quoted fields)
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx]?.replace(/"/g, "") || "";
      });

      // Validate required fields
      if (!row.name || !row.sku) {
        errors.push(`Row ${i + 1}: Missing name or SKU`);
        continue;
      }

      const brandLine = row.brand_line?.toLowerCase();
      if (brandLine !== "soteria_medical" && brandLine !== "m_and_h_fashion") {
        errors.push(`Row ${i + 1}: Invalid brand_line "${row.brand_line}" (must be soteria_medical or m_and_h_fashion)`);
        continue;
      }

      const price = parseFloat(row.price);
      if (isNaN(price) || price < 0) {
        errors.push(`Row ${i + 1}: Invalid price "${row.price}"`);
        continue;
      }

      success.push({
        name: row.name,
        sku: row.sku,
        brand_line: brandLine as "soteria_medical" | "m_and_h_fashion",
        price,
        cost_price: row.cost_price ? parseFloat(row.cost_price) : undefined,
        description: row.description || undefined,
        item_type: row.item_type || undefined,
        color: row.color || undefined,
        material: row.material || undefined,
        style: row.style || undefined,
        gender: row.gender || undefined,
        frame_width: row.frame_width || undefined,
        bridge_size: row.bridge_size || undefined,
        temple_length: row.temple_length || undefined,
        reorder_level: row.reorder_level ? parseInt(row.reorder_level) : undefined,
        reorder_quantity: row.reorder_quantity ? parseInt(row.reorder_quantity) : undefined,
        lead_time_days: row.lead_time_days ? parseInt(row.lead_time_days) : undefined,
      });
    }

    return { success, errors };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setParseResult({ success: [], errors: ["Please upload a CSV file"] });
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = parseCSV(content);
      setParseResult(result);
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (!parseResult?.success.length) return;

    setIsUploading(true);
    try {
      await bulkCreateProducts.mutateAsync(
        parseResult.success.map((p) => ({
          name: p.name,
          sku: p.sku,
          brand_line: p.brand_line,
          price: p.price,
          cost_price: p.cost_price ?? null,
          description: p.description ?? null,
          item_type: p.item_type as any ?? "frames",
          color: p.color ?? null,
          material: p.material ?? null,
          style: p.style ?? null,
          gender: p.gender ?? null,
          frame_width: p.frame_width ?? null,
          bridge_size: p.bridge_size ?? null,
          temple_length: p.temple_length ?? null,
          reorder_level: p.reorder_level ?? 10,
          reorder_quantity: p.reorder_quantity ?? 20,
          lead_time_days: p.lead_time_days ?? 7,
        }))
      );
      onOpenChange(false);
      setFile(null);
      setParseResult(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFile(null);
    setParseResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Upload Products</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple products at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">CSV Template</p>
                <p className="text-xs text-muted-foreground">
                  Download and fill out the template
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="font-medium">
                {file ? file.name : "Click to upload CSV file"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or drag and drop
              </p>
            </label>
          </div>

          {/* Parse Results */}
          {parseResult && (
            <div className="space-y-3">
              {parseResult.success.length > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    {parseResult.success.length} products ready to import
                  </AlertDescription>
                </Alert>
              )}

              {parseResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-1">{parseResult.errors.length} errors found:</p>
                    <ul className="list-disc list-inside text-sm max-h-32 overflow-y-auto">
                      {parseResult.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                      {parseResult.errors.length > 5 && (
                        <li>...and {parseResult.errors.length - 5} more</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!parseResult?.success.length || isUploading}
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import {parseResult?.success.length || 0} Products
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
