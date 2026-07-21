import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFaceMeasurement, FaceDimensions } from "@/modules/personalization";

import {
  Camera,
  Upload,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

interface FaceScanStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

type ScanMode = "select" | "camera" | "upload" | "analyzing" | "result";

export const FaceScanStep = ({ onNext, onBack, onSkip }: FaceScanStepProps) => {
  const [mode, setMode] = useState<ScanMode>("select");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { analyzeImage, captureFromVideo, isAnalyzing, result, reset } =
    useFaceMeasurement();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      setCameraStream(stream);
      setMode("camera");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera access denied:", error);
      // Fall back to upload mode
      setMode("upload");
    }
  };

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  const handleCapture = async () => {
    if (!videoRef.current) return;

    const imageData = await captureFromVideo(videoRef.current);
    setCapturedImage(imageData);
    stopCamera();
    setMode("analyzing");
    await analyzeImage(imageData);
    setMode("result");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageData = reader.result as string;
      setCapturedImage(imageData);
      setMode("analyzing");
      await analyzeImage(imageData);
      setMode("result");
    };
    reader.readAsDataURL(file);
  };

  const handleRetry = () => {
    setCapturedImage(null);
    reset();
    setMode("select");
  };

  const formatMeasurement = (value: number | undefined, unit: string) => {
    if (!value) return "—";
    return `${value}${unit}`;
  };

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display font-bold">Face Measurement</h2>
        <p className="text-muted-foreground">
          {mode === "select" && "Take a photo or upload one to get precise frame measurements"}
          {mode === "camera" && "Position your face in the frame and take a photo"}
          {mode === "upload" && "Upload a front-facing photo of your face"}
          {mode === "analyzing" && "Analyzing your facial features..."}
          {mode === "result" && (result?.success ? "Your measurements are ready!" : "Let's try again")}
        </p>
      </div>

      {mode === "select" && (
        <div className="grid gap-4 sm:grid-cols-2 max-w-md mx-auto">
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={startCamera}
          >
            <CardContent className="p-6 text-center">
              <Camera className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-medium">Take Photo</h3>
              <p className="text-sm text-muted-foreground">Use your camera</p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="p-6 text-center">
              <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-medium">Upload Photo</h3>
              <p className="text-sm text-muted-foreground">From your device</p>
            </CardContent>
          </Card>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      )}

      {mode === "camera" && (
        <div className="space-y-4">
          <div className="relative aspect-[4/3] max-w-md mx-auto rounded-xl overflow-hidden bg-muted">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.play();
                }
              }}
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-8 border-2 border-dashed border-white/50 rounded-full" />
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => { stopCamera(); setMode("select"); }}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleCapture}>
              <Camera className="mr-2 h-4 w-4" />
              Capture
            </Button>
          </div>
        </div>
      )}

      {mode === "upload" && (
        <div className="text-center space-y-4">
          <div
            className="border-2 border-dashed border-border rounded-xl p-12 cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Click to upload a photo</p>
            <p className="text-sm text-muted-foreground">JPG, PNG up to 10MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button variant="outline" onClick={() => setMode("select")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      )}

      {mode === "analyzing" && (
        <div className="text-center space-y-4 py-8">
          <div className="relative w-32 h-32 mx-auto">
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover rounded-full"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground">Analyzing your facial features...</p>
        </div>
      )}

      {mode === "result" && (
        <div className="space-y-6">
          {result?.success && result.dimensions ? (
            <>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <h3 className="font-medium text-lg">Measurements Complete</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Face Width</p>
                      <p className="font-medium">
                        {formatMeasurement(result.dimensions.faceWidthMm, "mm")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pupillary Distance</p>
                      <p className="font-medium">
                        {formatMeasurement(result.dimensions.pupillaryDistanceMm, "mm")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bridge Width</p>
                      <p className="font-medium">
                        {formatMeasurement(result.dimensions.bridgeWidthMm, "mm")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Face Shape</p>
                      <p className="font-medium capitalize">
                        {result.dimensions.faceShape}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={handleRetry}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retake
                </Button>
                <Button onClick={onNext}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
                <h3 className="font-medium text-lg mb-2">Couldn't Analyze Photo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {result?.error || "Please try again with a clear, front-facing photo."}
                </p>
                <Button onClick={handleRetry}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Navigation footer for select mode */}
      {mode === "select" && (
        <div className="flex justify-between pt-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button variant="ghost" onClick={onSkip}>
            Skip this step
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
