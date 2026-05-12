import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

interface DataProtectionConsentProps {
  /** Whether the user has consented to data processing (required). */
  consent: boolean;
  onConsentChange: (value: boolean) => void;
  /** Whether the user opts in to marketing communications (optional). */
  marketing?: boolean;
  onMarketingChange?: (value: boolean) => void;
  disabled?: boolean;
  error?: string;
  /** Compact mode for modals/email capture. */
  compact?: boolean;
  idPrefix?: string;
}

/**
 * Nigeria Data Protection Act (NDPA) 2023 compliant consent block.
 * Use anywhere we collect personal data from a customer.
 */
export const DataProtectionConsent = ({
  consent,
  onConsentChange,
  marketing,
  onMarketingChange,
  disabled,
  error,
  compact = false,
  idPrefix = "dpc",
}: DataProtectionConsentProps) => {
  const consentId = `${idPrefix}-consent`;
  const marketingId = `${idPrefix}-marketing`;

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
      {!compact && (
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Data Protection &amp; Privacy
        </div>
      )}

      <div className="flex items-start gap-3">
        <Checkbox
          id={consentId}
          checked={consent}
          onCheckedChange={(c) => onConsentChange(c === true)}
          disabled={disabled}
          className="mt-0.5"
          aria-describedby={error ? `${consentId}-error` : undefined}
          aria-invalid={!!error}
        />
        <Label
          htmlFor={consentId}
          className="text-xs text-muted-foreground font-normal cursor-pointer leading-relaxed"
        >
          I consent to M&amp;H Eyewear collecting and processing my personal data
          (including contact details and, where applicable, health information)
          for the purpose of providing the requested service, in accordance with
          the{" "}
          <Link to="/privacy" target="_blank" className="text-primary hover:underline">
            Privacy Policy
          </Link>{" "}
          and the Nigeria Data Protection Act 2023. I understand I can withdraw
          consent or request deletion at any time by contacting M&amp;H.
        </Label>
      </div>
      {error && (
        <p id={`${consentId}-error`} className="text-xs text-destructive pl-7">
          {error}
        </p>
      )}

      {onMarketingChange && (
        <div className="flex items-start gap-3 pt-1 border-t border-border/50">
          <Checkbox
            id={marketingId}
            checked={!!marketing}
            onCheckedChange={(c) => onMarketingChange(c === true)}
            disabled={disabled}
            className="mt-0.5"
          />
          <Label
            htmlFor={marketingId}
            className="text-xs text-muted-foreground font-normal cursor-pointer leading-relaxed"
          >
            (Optional) Send me style tips, offers, and updates from M&amp;H Eyewear.
            I can unsubscribe at any time.
          </Label>
        </div>
      )}
    </div>
  );
};

export default DataProtectionConsent;
