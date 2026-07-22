import { useRef, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Camera, Upload, X, RefreshCw, Save, Check, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { toast } from "sonner";
import { useAuth } from "@/modules/auth";
import { useUpdateProfile } from "@/modules/personalization";
import { track } from "@/shared/lib/telemetry";

/**
 * Photo-usage consent, required once per session before any upload.
 *
 * Why it exists: a try-on photo is biometric-adjacent personal data, and we
 * cannot verify whose face is in an upload. The self-certification checkbox
 * ("my photo, or I have their permission") plus the tracked consent event
 * (timestamp + session in platform_events) is the audit trail that puts
 * responsibility for third-party photos on the uploader -- NDPA 2023 diligence
 * without adding a second screen to the flow.
 */
const PHOTO_CONSENT_VERSION = "v1.0";
const PHOTO_CONSENT_KEY = "mh_photo_consent";

const hasSessionPhotoConsent = (): boolean => {
  try {
    return sessionStorage.getItem(PHOTO_CONSENT_KEY) === PHOTO_CONSENT_VERSION;
  } catch {
    return false;
  }
};

interface PhotoUploadProps {
  photo: string | null;
  onPhotoChange: (photo: string | null) => void;
  isProcessing?: boolean;
  compact?: boolean;
}

export const PhotoUpload = ({
  photo,
  onPhotoChange,
  isProcessing = false,
  compact = false,
}: PhotoUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isAuthenticated } = useAuth();
  const updateProfile = useUpdateProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [photoConsent, setPhotoConsent] = useState(hasSessionPhotoConsent);
  const [consentError, setConsentError] = useState("");

  const handleConsentChange = useCallback((checked: boolean) => {
    setPhotoConsent(checked);
    setConsentError("");
    try {
      if (checked) {
        sessionStorage.setItem(PHOTO_CONSENT_KEY, PHOTO_CONSENT_VERSION);
        // Audit trail: timestamp, session and page land in platform_events.
        void track("tryon.photo_consent_given", { version: PHOTO_CONSENT_VERSION });
      } else {
        sessionStorage.removeItem(PHOTO_CONSENT_KEY);
      }
    } catch {
      // Private mode: in-memory state still gates this visit.
    }
  }, []);

  const handleSaveAsVtoPhoto = useCallback(async () => {
    if (!user || !photo) return;
    setIsSaving(true);
    try {
      // Convert base64 to blob
      const res = await fetch(photo);
      const blob = await res.blob();
      const ext = blob.type.includes("png") ? "png" : "webp";
      const filePath = `vto-photos/${user.id}.${ext}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, blob, { upsert: true, contentType: blob.type });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      // Update profile
      await updateProfile.mutateAsync({
        userId: user.id,
        updates: { vto_photo_url: publicUrl },
      });

      setIsSaved(true);
      toast.success("Photo saved! You can now use one-click try-on from any product page.");
    } catch (err) {
      console.error("Failed to save VTO photo:", err);
      toast.error("Failed to save photo. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [user, photo, updateProfile]);

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
    if (!photoConsent) {
      setConsentError("Please confirm the photo consent below first.");
      toast.error("Please tick the photo consent box to continue.");
      return;
    }
    fileInputRef.current?.click();
  };

  const clearPhoto = () => {
    onPhotoChange(null);
  };

  if (photo && compact) {
    return (
      <Card>
        <CardContent className="p-3 flex items-center gap-3">
          <div className="h-14 w-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
            <img src={photo} alt="Your photo" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Your photo is ready</p>
            <p className="text-xs text-muted-foreground">Tap a frame below to try it on</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={triggerUpload} disabled={isProcessing}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {isAuthenticated && (
              <Button
                variant={isSaved ? "ghost" : "outline"}
                size="sm"
                onClick={handleSaveAsVtoPhoto}
                disabled={isSaving || isSaved}
                title="Save as my try-on photo"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={clearPhoto} disabled={isProcessing}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </CardContent>
      </Card>
    );
  }

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

          {/* Save as VTO photo */}
          {isAuthenticated && (
            <Button
              variant={isSaved ? "outline" : "gold"}
              size="sm"
              className="w-full"
              onClick={handleSaveAsVtoPhoto}
              disabled={isSaving || isSaved}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isSaved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved as my try-on photo
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save as my try-on photo
                </>
              )}
            </Button>
          )}

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

        {/* Photo-usage consent — gates the file picker, once per session */}
        <div
          className={`space-y-2 rounded-lg border p-3 bg-muted/30 ${
            consentError ? "border-destructive" : "border-border"
          }`}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              id="photo-consent"
              checked={photoConsent}
              onCheckedChange={(c) => handleConsentChange(c === true)}
              className="mt-0.5"
              aria-invalid={!!consentError}
            />
            <Label
              htmlFor="photo-consent"
              className="text-xs text-muted-foreground font-normal cursor-pointer leading-relaxed"
            >
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                This photo is of me
              </span>{" "}
              — or I have that person's clear permission to use it. I consent to
              M&amp;H Eyewear processing it to generate my virtual try-on preview,
              per the{" "}
              <Link to="/privacy" target="_blank" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              . Uploading someone else's photo without their consent is not permitted.
            </Label>
          </div>
          {consentError && (
            <p className="text-xs text-destructive pl-7">{consentError}</p>
          )}
        </div>

        <div
          onClick={triggerUpload}
          className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center space-y-4 transition-all cursor-pointer ${
            photoConsent
              ? "border-border hover:border-primary hover:bg-muted/50"
              : "border-border opacity-60"
          }`}
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
