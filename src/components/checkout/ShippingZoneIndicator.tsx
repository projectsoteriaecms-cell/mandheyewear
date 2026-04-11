import { Truck, Clock, MapPin } from "lucide-react";
import { getZoneInfo, getDeliveryEstimate, calculateShippingFee } from "@/shared/lib/shippingZones";

interface ShippingZoneIndicatorProps {
  zoneKey: string;
  subtotal: number;
}

export const ShippingZoneIndicator = ({ zoneKey, subtotal }: ShippingZoneIndicatorProps) => {
  const zone = getZoneInfo(zoneKey);
  const fee = calculateShippingFee(zoneKey, subtotal);
  const estimate = getDeliveryEstimate(zoneKey);

  return (
    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <MapPin className="h-4 w-4" />
        <span>Shipping Zone: {zone.label}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Truck className="h-3.5 w-3.5" />
          <span>Shipping Fee:</span>
        </div>
        <span className="font-semibold">
          {fee === 0 ? (
            <span className="text-green-600">FREE</span>
          ) : (
            `₦${fee.toLocaleString()}`
          )}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Est. Delivery:</span>
        </div>
        <span className="font-medium">{estimate}</span>
      </div>
      {zone.freeShippingThreshold && subtotal < zone.freeShippingThreshold && (
        <p className="text-xs text-muted-foreground">
          Add ₦{(zone.freeShippingThreshold - subtotal).toLocaleString()} more for free shipping
        </p>
      )}
    </div>
  );
};
