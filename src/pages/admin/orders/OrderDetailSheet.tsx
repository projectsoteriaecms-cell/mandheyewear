import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Glasses,
  User,
  MapPin,
  Package,
  ClipboardList,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  Wrench,
} from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtNum(n: number | null | undefined): string {
  if (n == null) return "—";
  return n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2);
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  try { return format(parseISO(d), "dd MMM yyyy"); } catch { return d; }
}

function labelLens(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── status badge colours ──────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending:        "bg-gray-100 text-gray-700 border-gray-200",
  confirmed:      "bg-blue-100 text-blue-700 border-blue-200",
  processing:     "bg-yellow-100 text-yellow-700 border-yellow-200",
  packed:         "bg-purple-100 text-purple-700 border-purple-200",
  shipped:        "bg-indigo-100 text-indigo-700 border-indigo-200",
  delivered:      "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled:      "bg-red-100 text-red-700 border-red-200",
  paid:           "bg-emerald-100 text-emerald-700 border-emerald-200",
  failed:         "bg-red-100 text-red-700 border-red-200",
};

function StatusPill({ label, status }: { label: string; status: string }) {
  const cls = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  );
}

// ── prescription row ──────────────────────────────────────────────────────────

interface EyeData {
  sph?: number | null;
  cyl?: number | null;
  axis?: number | null;
  add?: number | null;
  pd_distance?: number | null;
  pd_right?: number | null;
  pd_left?: number | null;
}

function EyeRow({ label, data }: { label: string; data: EyeData | null }) {
  if (!data) return null;
  return (
    <div className="flex items-center gap-4 text-sm font-mono">
      <span className="w-7 text-xs font-semibold text-muted-foreground uppercase shrink-0">{label}</span>
      <span className="text-xs"><span className="text-muted-foreground mr-1">Sph</span>{fmtNum(data.sph)}</span>
      <span className="text-xs"><span className="text-muted-foreground mr-1">Cyl</span>{fmtNum(data.cyl)}</span>
      <span className="text-xs"><span className="text-muted-foreground mr-1">Axis</span>{data.axis ?? "—"}°</span>
      {data.add != null && <span className="text-xs"><span className="text-muted-foreground mr-1">Add</span>{fmtNum(data.add)}</span>}
    </div>
  );
}

// ── dispensing card (one per Rx item) ─────────────────────────────────────────

function DispensingCard({ item }: { item: any }) {
  const lensType = item.lens_type as string;
  const rxData = item.prescription_data as any;
  const rxSnap = rxData
    ? {
        right_eye: rxData.right_eye ?? null,
        left_eye: rxData.left_eye ?? null,
        pd_distance: rxData.pd_distance ?? null,
        pd_right: rxData.pd_right ?? null,
        pd_left: rxData.pd_left ?? null,
        prescriber_name: rxData.prescriber_name ?? null,
        issued_date: rxData.issued_date ?? null,
      }
    : null;

  const hasPrescription = rxSnap && (rxSnap.right_eye || rxSnap.left_eye);
  const pdDisplay = rxSnap?.pd_distance
    ? `${rxSnap.pd_distance} mm`
    : rxSnap?.pd_right && rxSnap?.pd_left
    ? `${rxSnap.pd_right} / ${rxSnap.pd_left} mm`
    : null;

  return (
    <div className="rounded-lg border-2 border-primary/20 bg-primary/[0.03] p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-sm text-foreground leading-snug">
              {item.product?.name ?? "Unknown frame"}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {item.product?.sku ?? ""}
            </p>
          </div>
        </div>
        {item.requires_fitting && (
          <Badge className="gap-1 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 shrink-0">
            <AlertTriangle className="h-3 w-3" />
            Fitting Required
          </Badge>
        )}
      </div>

      {/* Lens spec */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm rounded-md bg-muted/50 px-3 py-2">
        <div>
          <span className="text-xs text-muted-foreground">Lens Type</span>
          <p className="font-medium capitalize">{labelLens(lensType)}</p>
        </div>
        {item.lens_index && (
          <div>
            <span className="text-xs text-muted-foreground">Index</span>
            <p className="font-medium">{item.lens_index}</p>
          </div>
        )}
        {item.lens_coatings?.length > 0 && (
          <div className="col-span-2">
            <span className="text-xs text-muted-foreground">Coatings</span>
            <p className="font-medium">{(item.lens_coatings as string[]).join(", ")}</p>
          </div>
        )}
        <div>
          <span className="text-xs text-muted-foreground">Lens Price</span>
          <p className="font-medium text-accent">
            {item.lens_price > 0 ? `+₦${(item.lens_price as number).toLocaleString()}` : "Included"}
          </p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Qty</span>
          <p className="font-medium">{item.quantity}</p>
        </div>
      </div>

      {/* Prescription values */}
      {hasPrescription ? (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Prescription (at time of order)
            </span>
          </div>
          <div className="rounded-md bg-background border px-3 py-2 space-y-1.5">
            <EyeRow label="OD" data={rxSnap!.right_eye} />
            <EyeRow label="OS" data={rxSnap!.left_eye} />
            {pdDisplay && (
              <div className="flex items-center gap-4 text-sm font-mono">
                <span className="w-7 text-xs font-semibold text-muted-foreground uppercase shrink-0">PD</span>
                <span className="text-xs">{pdDisplay}</span>
              </div>
            )}
            {rxSnap!.prescriber_name && (
              <p className="text-xs text-muted-foreground pt-0.5">
                Prescriber: {rxSnap!.prescriber_name}
                {rxSnap!.issued_date ? ` · ${fmtDate(rxSnap!.issued_date)}` : ""}
              </p>
            )}
          </div>
        </div>
      ) : item.prescription_id ? (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Prescription on file (ID: <span className="font-mono">{item.prescription_id.slice(0, 8)}…</span>) — check customer account for values.
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          No prescription snapshot captured. Verify with customer before dispensing.
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

interface Props {
  orderId: string | null;
  onClose: () => void;
}

export function OrderDetailSheet({ orderId, onClose }: Props) {
  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-order-detail", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            quantity,
            price_at_purchase,
            lens_type,
            lens_price,
            lens_index,
            lens_coatings,
            frame_only,
            requires_fitting,
            fitting_booked,
            prescription_id,
            prescription_data,
            product:products (id, name, image_url, sku, price)
          )
        `)
        .eq("id", orderId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  const shippingAddr = (order?.shipping_address as any) ?? {};
  const rxItems = (order?.order_items ?? []).filter(
    (i: any) => i.lens_type && i.lens_type !== "frame_only"
  );
  const needsFitting = rxItems.some((i: any) => i.requires_fitting && !i.fitting_booked);

  return (
    <Sheet open={!!orderId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        {isLoading || !order ? (
          <div className="space-y-4 pt-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        ) : (
          <div className="space-y-6 pt-1 pb-10">
            {/* ── Header ── */}
            <SheetHeader className="space-y-2">
              <SheetTitle className="font-display text-xl flex items-center gap-2 flex-wrap">
                <Package className="h-5 w-5 text-muted-foreground" />
                {order.order_number}
                <StatusPill label={order.order_status.replace(/_/g, " ")} status={order.order_status} />
                <StatusPill label={order.payment_status} status={order.payment_status} />
              </SheetTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {format(parseISO(order.created_at), "PPP 'at' p")}
              </p>
            </SheetHeader>

            {/* ── Fitting alert ── */}
            {needsFitting && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                    Fitting appointment required
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                    One or more lenses on this order require an in-store fitting before dispensing.
                    Contact the customer to schedule.
                  </p>
                </div>
              </div>
            )}

            {/* ── Dispensing section ── */}
            {rxItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <Glasses className="h-4 w-4" />
                  Dispensing ({rxItems.length} Rx item{rxItems.length !== 1 ? "s" : ""})
                </h3>
                {rxItems.map((item: any) => (
                  <DispensingCard key={item.id} item={item} />
                ))}
              </div>
            )}

            <Separator />

            {/* ── All items ── */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Package className="h-4 w-4" />
                All Items
              </h3>
              {(order.order_items ?? []).map((item: any) => {
                const hasLens = item.lens_type && item.lens_type !== "frame_only";
                return (
                  <div key={item.id} className="flex gap-3 items-start">
                    <div
                      className="h-14 w-14 rounded-md overflow-hidden shrink-0"
                      style={{ background: "radial-gradient(ellipse at 50% 42%, #fdfcfa 0%, #f0ede6 55%, #e4e0d8 100%)" }}
                    >
                      {item.product?.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product?.name}
                          className="h-full w-full object-contain p-1.5"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-snug">{item.product?.name ?? "Product"}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.product?.sku ?? ""}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      {hasLens && (
                        <div className="mt-1 flex items-center gap-1.5 rounded-md bg-primary/5 border border-primary/15 px-2 py-1 w-fit">
                          <Glasses className="h-3 w-3 text-primary shrink-0" />
                          <span className="text-[11px] font-medium capitalize">
                            {labelLens(item.lens_type)}
                            {item.lens_index ? ` · ${item.lens_index}` : ""}
                          </span>
                          {item.lens_price > 0 && (
                            <span className="text-[11px] text-accent font-semibold">
                              +₦{(item.lens_price as number).toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-sm text-accent">
                        ₦{(item.price_at_purchase as number).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Order total */}
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-sm font-semibold text-muted-foreground">Order Total</span>
                <span className="text-lg font-bold text-accent">
                  ₦{(order.total_amount as number).toLocaleString()}
                </span>
              </div>
            </div>

            <Separator />

            {/* ── Customer & Shipping ── */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <User className="h-4 w-4" />
                Customer
              </h3>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                {shippingAddr.full_name && (
                  <p className="font-semibold">{shippingAddr.full_name}</p>
                )}
                {shippingAddr.phone && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {shippingAddr.phone}
                  </p>
                )}
                {shippingAddr.email && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {shippingAddr.email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                Delivery Address
              </h3>
              <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground space-y-0.5">
                {shippingAddr.address && <p>{shippingAddr.address}</p>}
                {shippingAddr.landmark && (
                  <p className="text-xs">Near: {shippingAddr.landmark}</p>
                )}
                {(shippingAddr.city || shippingAddr.state) && (
                  <p>
                    {[shippingAddr.city, shippingAddr.state, shippingAddr.country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                {order.tracking_number && (
                  <p className="pt-2 flex items-center gap-1.5 text-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Tracking: <span className="font-mono font-semibold">{order.tracking_number}</span>
                    {order.logistics_partner ? ` · ${order.logistics_partner}` : ""}
                  </p>
                )}
                {order.estimated_delivery_date && (
                  <p className="text-xs">
                    Est. delivery: {fmtDate(order.estimated_delivery_date)}
                  </p>
                )}
              </div>
            </div>

          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
