import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

interface PhotoConsentCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
  idPrefix?: string;
}

/**
 * Shared photo-usage consent checkbox -- the exact same markup and legal
 * copy everywhere a visitor is about to hand over a photo (the main upload
 * flow, the inline product-card modal). Keeping this in one place means the
 * consent text can't drift between the two entry points.
 */
export const PhotoConsentCheckbox = ({
  checked,
  onCheckedChange,
  error,
  idPrefix = "photo-consent",
}: PhotoConsentCheckboxProps) => (
  <div
    className={`space-y-2 rounded-lg border p-3 bg-muted/30 ${
      error ? "border-destructive" : "border-border"
    }`}
  >
    <div className="flex items-start gap-3">
      <Checkbox
        id={idPrefix}
        checked={checked}
        onCheckedChange={(c) => onCheckedChange(c === true)}
        className="mt-0.5"
        aria-invalid={!!error}
      />
      <Label
        htmlFor={idPrefix}
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
    {error && <p className="text-xs text-destructive pl-7">{error}</p>}
  </div>
);
