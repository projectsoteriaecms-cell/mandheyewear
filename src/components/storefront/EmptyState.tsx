import { LucideIcon, Package, ShoppingBag, Heart, Search, Calendar, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type EmptyStateType = "cart" | "orders" | "wishlist" | "search" | "appointments" | "products";

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

const emptyStateConfig: Record<EmptyStateType, {
  icon: LucideIcon;
  defaultTitle: string;
  defaultDescription: string;
  defaultActionLabel: string;
  defaultActionHref: string;
  iconBgClass: string;
  iconClass: string;
}> = {
  cart: {
    icon: ShoppingBag,
    defaultTitle: "Your cart is empty",
    defaultDescription: "Looks like you haven't added any items to your cart yet. Start shopping to fill it up!",
    defaultActionLabel: "Shop Eyewear",
    defaultActionHref: "/eyewear",
    iconBgClass: "bg-accent/10",
    iconClass: "text-accent",
  },
  orders: {
    icon: Package,
    defaultTitle: "No orders yet",
    defaultDescription: "Your order history will appear here once you make a purchase. Ready to find your perfect frames?",
    defaultActionLabel: "Start Shopping",
    defaultActionHref: "/eyewear",
    iconBgClass: "bg-primary/10",
    iconClass: "text-primary",
  },
  wishlist: {
    icon: Heart,
    defaultTitle: "Your wishlist is empty",
    defaultDescription: "Save items you love by clicking the heart icon. They'll be waiting for you here!",
    defaultActionLabel: "Browse Collection",
    defaultActionHref: "/eyewear",
    iconBgClass: "bg-destructive/10",
    iconClass: "text-destructive",
  },
  search: {
    icon: Search,
    defaultTitle: "No results found",
    defaultDescription: "We couldn't find any products matching your search. Try adjusting your filters or search terms.",
    defaultActionLabel: "Clear Filters",
    defaultActionHref: "/eyewear",
    iconBgClass: "bg-muted",
    iconClass: "text-muted-foreground",
  },
  appointments: {
    icon: Calendar,
    defaultTitle: "No appointments",
    defaultDescription: "You don't have any scheduled appointments. Book an eye exam to take care of your vision.",
    defaultActionLabel: "Book Appointment",
    defaultActionHref: "/booking",
    iconBgClass: "bg-primary/10",
    iconClass: "text-primary",
  },
  products: {
    icon: FileX,
    defaultTitle: "No products available",
    defaultDescription: "There are no products matching your criteria. Check back later or try different filters.",
    defaultActionLabel: "View All Products",
    defaultActionHref: "/eyewear",
    iconBgClass: "bg-muted",
    iconClass: "text-muted-foreground",
  },
};

export const EmptyState = ({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) => {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  const displayTitle = title || config.defaultTitle;
  const displayDescription = description || config.defaultDescription;
  const displayActionLabel = actionLabel || config.defaultActionLabel;
  const displayActionHref = actionHref || config.defaultActionHref;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Illustrated Icon Container */}
      <div className={`relative mb-6`}>
        <div className={`h-24 w-24 rounded-full ${config.iconBgClass} flex items-center justify-center`}>
          <Icon className={`h-12 w-12 ${config.iconClass}`} />
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-accent/30" />
        <div className="absolute -bottom-1 -left-3 h-3 w-3 rounded-full bg-primary/30" />
      </div>

      {/* Text Content */}
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {displayTitle}
      </h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        {displayDescription}
      </p>

      {/* Action Button */}
      {onAction ? (
        <Button variant="hero" onClick={onAction}>
          {displayActionLabel}
        </Button>
      ) : (
        <Button variant="hero" asChild>
          <Link to={displayActionHref}>{displayActionLabel}</Link>
        </Button>
      )}
    </div>
  );
};
