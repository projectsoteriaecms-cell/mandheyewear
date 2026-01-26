import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export const BranchMapPlaceholder = () => {
  return (
    <Card className="mb-12 overflow-hidden">
      <div className="h-96 bg-gradient-subtle flex items-center justify-center">
        <div className="text-center space-y-4">
          <MapPin className="h-16 w-16 mx-auto text-primary" />
          <p className="text-lg font-medium text-foreground">Interactive Map</p>
          <p className="text-sm text-muted-foreground">
            Branch locations would be displayed here
          </p>
        </div>
      </div>
    </Card>
  );
};
