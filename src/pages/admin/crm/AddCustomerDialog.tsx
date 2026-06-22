import { useState } from "react";
import { useAddCustomer } from "@/modules/crm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCustomerDialog({ open, onOpenChange }: AddCustomerDialogProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);

  const { mutate, isPending, isSuccess, error } = useAddCustomer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({
      email: email.trim(),
      full_name: fullName.trim() || undefined,
      phone: phone.trim() || undefined,
      marketing_consent: marketingConsent,
      newsletter_opt_in: newsletterOptIn,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setEmail("");
      setFullName("");
      setPhone("");
      setMarketingConsent(false);
      setNewsletterOptIn(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Add a customer to your CRM database. They'll appear in the contacts list immediately.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="space-y-4 py-6">
            <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-900/20">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Customer added!</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">{email}</p>
              </div>
            </div>
            <Button
              onClick={() => handleOpenChange(false)}
              className="w-full"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                required
              />
              {email && !email.includes("@") && (
                <p className="text-xs text-red-500">Please enter a valid email</p>
              )}
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Full Name <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isPending}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 (123) 456-7890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isPending}
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="marketing"
                  checked={marketingConsent}
                  onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
                  disabled={isPending}
                />
                <Label htmlFor="marketing" className="cursor-pointer text-sm">
                  Has marketing consent
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="newsletter"
                  checked={newsletterOptIn}
                  onCheckedChange={(checked) => setNewsletterOptIn(checked as boolean)}
                  disabled={isPending}
                />
                <Label htmlFor="newsletter" className="cursor-pointer text-sm">
                  Subscribe to newsletter
                </Label>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">
                  {error instanceof Error ? error.message : "Failed to add customer"}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!email.trim() || isPending}
                className="flex-1"
              >
                {isPending ? "Adding..." : "Add Customer"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
