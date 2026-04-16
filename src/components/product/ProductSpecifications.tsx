import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ruler, Palette, Layers, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/modules/products/hooks/useProducts";

interface ProductSpecificationsProps {
  product: Product;
  /** Compact mode for accordion/inline use */
  compact?: boolean;
}

export const ProductSpecifications = ({ product, compact = false }: ProductSpecificationsProps) => {
  const specs = [
    { label: "Frame Width", value: product.frame_width, icon: Ruler },
    { label: "Bridge Size", value: product.bridge_size, icon: Ruler },
    { label: "Temple Length", value: product.temple_length, icon: Ruler },
    { label: "Material", value: product.material, icon: Layers },
    { label: "Color", value: product.color, icon: Palette },
    { label: "Style", value: product.style, icon: Eye },
  ].filter((spec) => spec.value);

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {specs.map((spec) => (
            <div key={spec.label} className="flex items-center gap-1.5">
              <spec.icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">{spec.label}:</span>
              <span className="font-medium capitalize truncate">{spec.value}</span>
            </div>
          ))}
        </div>
        {product.is_prescription_compatible && (
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
            <Eye className="h-4 w-4" />
            <span className="font-medium">Prescription Compatible</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {specs.map((spec) => (
            <div key={spec.label} className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <spec.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{spec.label}</p>
                <p className="font-medium capitalize">{spec.value}</p>
              </div>
            </div>
          ))}
        </div>

        {product.is_prescription_compatible && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">
                Prescription Compatible
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              This frame can be fitted with prescription lenses
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
