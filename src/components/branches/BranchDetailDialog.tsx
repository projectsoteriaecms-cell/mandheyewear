import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Navigation as NavIcon } from "lucide-react";
import type { Branch } from "@/modules/branches/types";

interface BranchDetailDialogProps {
  branch: Branch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BranchDetailDialog = ({ branch, open, onOpenChange }: BranchDetailDialogProps) => {
  if (!branch) return null;

  const isMH = branch.is_mh_location;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap font-display text-xl">
            {branch.name}
            {branch.is_head_office && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-semibold uppercase rounded-full">
                Head Office
              </span>
            )}
            {isMH && (
              <span className="px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-semibold uppercase rounded-full">
                Flagship
              </span>
            )}
          </DialogTitle>
          <p className="text-sm text-accent font-medium">{branch.region}</p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Address */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-foreground">{branch.address}</p>
              <p className="text-sm text-muted-foreground">
                {branch.city}, {branch.state}, Nigeria
              </p>
            </div>
          </div>

          {/* Phone */}
          {branch.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary flex-shrink-0" />
              <a
                href={`tel:${branch.phone}`}
                className="text-foreground hover:text-primary transition-colors"
              >
                {branch.phone}
              </a>
            </div>
          )}

          {/* Email */}
          {branch.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary flex-shrink-0" />
              <a
                href={`mailto:${branch.email}`}
                className="text-foreground hover:text-primary transition-colors"
              >
                {branch.email}
              </a>
            </div>
          )}

          {/* Hours */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-foreground">
                Mon–Fri: {branch.hours_weekdays || "9:00am – 6:00pm"}
              </p>
              <p className="text-foreground">
                Saturday: {branch.hours_saturday || "9:00am – 6:00pm"}
              </p>
              <p className="text-foreground">
                Sunday: {branch.hours_sunday || "Closed"}
              </p>
            </div>
          </div>

          {/* Features */}
          {branch.features && branch.features.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {branch.features.map((feature, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            {branch.phone && (
              <Button variant="hero" className="w-full" asChild>
                <a href={`tel:${branch.phone}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call {isMH ? "Store" : "Branch"}
                </a>
              </Button>
            )}
            <Button variant="gold" className="w-full">
              <NavIcon className="mr-2 h-4 w-4" />
              Get Directions
            </Button>
            <Button variant="outline" className="w-full">
              {isMH ? "Shop Eyewear" : "Book Appointment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
