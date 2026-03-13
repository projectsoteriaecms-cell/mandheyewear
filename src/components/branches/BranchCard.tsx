import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Navigation as NavIcon } from "lucide-react";
import type { Branch } from "@/modules/branches/types";

interface BranchCardProps {
  branch: Branch;
}

export const BranchCard = ({ branch }: BranchCardProps) => {
  const isMH = branch.is_mh_location;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all">
      <div className="grid md:grid-cols-3 gap-6 p-6">
        {/* Location Info */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h2 className="text-2xl font-display font-bold text-foreground">
                {branch.name}
              </h2>
              {branch.is_head_office && (
                <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                  Head Office
                </span>
              )}
              {isMH && (
                <span className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full">
                  Flagship Store
                </span>
              )}
            </div>
            <p className="text-sm text-accent font-medium">{branch.region}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-foreground">{branch.address}</p>
                <p className="text-sm text-muted-foreground">
                  {branch.city}, {branch.state}, Nigeria
                </p>
              </div>
            </div>

            {branch.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a
                  href={`tel:${branch.phone}`}
                  className="text-foreground hover:text-primary transition-smooth"
                >
                  {branch.phone}
                </a>
              </div>
            )}

            {branch.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <a
                  href={`mailto:${branch.email}`}
                  className="text-foreground hover:text-primary transition-smooth"
                >
                  {branch.email}
                </a>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-foreground">
                  Mon-Fri: {branch.hours_weekdays || "9:00am – 6:00pm"}
                </p>
                <p className="text-foreground">
                  Saturday: {branch.hours_saturday || "9:00am – 6:00pm"}
                </p>
                <p className="text-foreground">
                  Sunday: {branch.hours_sunday || "Closed"}
                </p>
              </div>
            </div>
          </div>

          {branch.features && branch.features.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
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
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button variant="hero" className="w-full" asChild>
            <a href={`tel:${branch.phone}`}>
              <Phone className="mr-2 h-4 w-4" />
              Call {isMH ? "Store" : "Branch"}
            </a>
          </Button>
          <Button variant="gold" className="w-full">
            <NavIcon className="mr-2 h-4 w-4" />
            Get Directions
          </Button>
          {!isMH && (
            <Button variant="outline" className="w-full">
              Book Appointment
            </Button>
          )}
          {isMH && (
            <Button variant="outline" className="w-full">
              Shop Eyewear
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
