import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAdminProducts, useProductImageUpload } from "@/modules/products";
import { Upload, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";

interface BulkImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FileMatch {
  file: File;
  sku: string;
  productId: string | null;
  productName: string | null;
  status: "matched" | "unmatched" | "uploading" | "success" | "error";
}

export const BulkImageUploadDialog = ({
  open,
  onOpenChange,
}: BulkImageUploadDialogProps) => {
  const { products } = useAdminProducts();
  const { uploadBulkImagesBySku } = useProductImageUpload();
  
  const [files, setFiles] = useState<FileMatch[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const productsWithoutImages = products.filter((p) => !p.image_url);

  const matchFilesToProducts = useCallback(
    (selectedFiles: File[]) => {
      const matches: FileMatch[] = selectedFiles.map((file) => {
        const filenameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        const product = products.find(
          (p) => p.sku.toLowerCase() === filenameWithoutExt.toLowerCase()
        );

        return {
          file,
          sku: filenameWithoutExt,
          productId: product?.id || null,
          productName: product?.name || null,
          status: product ? "matched" : "unmatched",
        };
      });

      setFiles(matches);
    },
    [products]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      matchFilesToProducts(droppedFiles);
    },
    [matchFilesToProducts]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    matchFilesToProducts(selectedFiles);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    const matchedFiles = files.filter((f) => f.status === "matched");
    if (matchedFiles.length === 0) {
      toast.error("No matched files to upload");
      return;
    }

    setIsUploading(true);
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "matched" ? { ...f, status: "uploading" } : f
      )
    );

    try {
      const result = await uploadBulkImagesBySku(
        matchedFiles.map((f) => f.file),
        products.map((p) => ({ id: p.id, sku: p.sku }))
      );

      // Update statuses based on results
      setFiles((prev) =>
        prev.map((f) => {
          if (f.status === "uploading") {
            const matchedProduct = products.find(
              (p) => p.sku.toLowerCase() === f.sku.toLowerCase()
            );
            return matchedProduct
              ? { ...f, status: "success" }
              : { ...f, status: "error" };
          }
          return f;
        })
      );

      toast.success(`Uploaded ${result.matched} images successfully`);
      if (result.failed > 0) {
        toast.error(`${result.failed} uploads failed`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFiles([]);
  };

  const matchedCount = files.filter((f) => f.status === "matched").length;
  const unmatchedCount = files.filter((f) => f.status === "unmatched").length;
  const successCount = files.filter((f) => f.status === "success").length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Bulk Image Upload</DialogTitle>
          <DialogDescription>
            Upload images named by SKU to auto-match with products (e.g., MH-RND-001.jpg)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">
              Products without images: <strong>{productsWithoutImages.length}</strong>
            </span>
          </div>

          {/* Drop Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="bulk-image-upload"
            />
            <label htmlFor="bulk-image-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="font-medium">
                Drop images here or click to browse
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Name files by SKU (e.g., MH-RND-001.jpg, RB-AV-002.png)
              </p>
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">
                    <CheckCircle className="inline h-4 w-4 mr-1" />
                    Matched: {matchedCount}
                  </span>
                  {unmatchedCount > 0 && (
                    <span className="text-amber-600">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      Unmatched: {unmatchedCount}
                    </span>
                  )}
                  {successCount > 0 && (
                    <span className="text-blue-600">
                      Uploaded: {successCount}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiles([])}
                  disabled={isUploading}
                >
                  Clear All
                </Button>
              </div>

              <ScrollArea className="h-[250px] border rounded-lg">
                <div className="p-2 space-y-2">
                  {files.map((fileMatch, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg",
                        fileMatch.status === "matched" && "bg-green-50 dark:bg-green-950/20",
                        fileMatch.status === "unmatched" && "bg-amber-50 dark:bg-amber-950/20",
                        fileMatch.status === "success" && "bg-blue-50 dark:bg-blue-950/20",
                        fileMatch.status === "error" && "bg-red-50 dark:bg-red-950/20"
                      )}
                    >
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                        {fileMatch.file.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(fileMatch.file)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm truncate">
                          {fileMatch.sku}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {fileMatch.productName || "No matching product"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {fileMatch.status === "uploading" && (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        )}
                        {fileMatch.status === "success" && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {fileMatch.status === "matched" && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {fileMatch.status === "unmatched" && (
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                        )}
                        {fileMatch.status === "error" && (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        
                        {!isUploading && fileMatch.status !== "success" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeFile(idx)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}

          {/* Unmatched Warning */}
          {unmatchedCount > 0 && (
            <Alert variant="default" className="bg-amber-50 dark:bg-amber-950/20 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                {unmatchedCount} file(s) don't match any product SKU and will be skipped.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              {successCount > 0 ? "Done" : "Cancel"}
            </Button>
            {matchedCount > 0 && successCount === 0 && (
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload {matchedCount} Image{matchedCount > 1 ? "s" : ""}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
