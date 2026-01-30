import { useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, RefreshCw } from "lucide-react";

interface PhotoUploadProps {
  photo: string | null;
  onPhotoChange: (photo: string | null) => void;
  isProcessing?: boolean;
}

export const PhotoUpload = ({
  photo,
  onPhotoChange,
  isProcessing = false,
}: PhotoUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onPhotoChange(result);
      };
      reader.readAsDataURL(file);
    }
    
    // Reset input
    if (e.target) {
      e.target.value = "";
    }
  }, [onPhotoChange]);

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const clearPhoto = () => {
    onPhotoChange(null);
  };

  if (photo) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Your Photo</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={triggerUpload}
                disabled={isProcessing}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Change
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearPhoto}
                disabled={isProcessing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden">
            <img
              src={photo}
              alt="Your uploaded photo"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground text-sm">Tips for best results:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Face the camera directly</li>
              <li>Use good lighting</li>
              <li>Remove existing glasses</li>
              <li>Keep a neutral expression</li>
            </ul>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Upload Your Photo</h3>
        <p className="text-sm text-muted-foreground">
          For best results, use a clear front-facing photo with good lighting.
        </p>

        <div
          onClick={triggerUpload}
          className="border-2 border-dashed border-border rounded-lg p-8 sm:p-12 text-center space-y-4 hover:border-primary hover:bg-muted/50 transition-all cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
            <Camera className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-foreground font-medium mb-1">
              Click to upload a photo
            </p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG or HEIC (max. 10MB)
            </p>
          </div>
          <Button variant="outline" type="button">
            <Upload className="h-4 w-4 mr-2" />
            Choose Photo
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};
