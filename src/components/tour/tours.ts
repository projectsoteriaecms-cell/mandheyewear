import type { TourStep } from "./TourProvider";

// ─── Tour IDs ─────────────────────────────────────────────────────────────────

export const TOUR_IDS = {
  SHOP: "shop",
  PRODUCT: "product",
  CART: "cart",
  CHECKOUT: "checkout",
  SIGNUP: "signup",
} as const;

// ─── Tour Definitions ─────────────────────────────────────────────────────────

export const SHOP_TOUR: TourStep[] = [
  {
    target: "shop-category-bar",
    title: "Browse by category",
    body: "Tap any icon here to filter by Eyeglasses, Sunglasses, or Accessories. The count badge shows how many are in stock.",
    placement: "bottom",
  },
  {
    target: "shop-filter-btn",
    title: "Narrow it down",
    body: "Use Filters to sort by price, gender, or frame style. Active filters are shown as a count badge on this button.",
    placement: "bottom",
  },
  {
    target: "shop-first-product",
    title: "Product cards",
    body: "Tap any card to Quick View without leaving the page. The gold cart button adds directly — no extra clicks. Wishlist (heart) saves for later.",
    placement: "bottom",
  },
];

export const PRODUCT_TOUR: TourStep[] = [
  {
    target: "pdp-gallery",
    title: "Product gallery",
    body: "Swipe or tap thumbnails to see the product from every angle — front, side, lifestyle shots, and on-mannequin views.",
    placement: "bottom",
    scrollTo: false,
  },
  {
    target: "pdp-description",
    title: "Product description",
    body: "Key details about fit, material, and style are right here. Tap 'Read more' to expand the full description.",
    placement: "bottom",
  },
  {
    target: "pdp-tryon",
    title: "Virtual Try-On",
    body: "Upload your photo and see how these frames look on your face in seconds — no app download needed.",
    placement: "top",
  },
  {
    target: "pdp-buy-now",
    title: "Buy Now or Add to Cart",
    body: "Buy Now takes you straight to checkout. Add to Cart lets you keep browsing and check out later.",
    placement: "top",
  },
];

export const CART_TOUR: TourStep[] = [
  {
    target: "cart-item",
    title: "Your cart items",
    body: "Each item shows the product, price, and quantity. Adjust the quantity or remove items here before checkout.",
    placement: "bottom",
  },
  {
    target: "cart-lens-upsell",
    title: "Add prescription lenses",
    body: "If you need prescription lenses for your frames, add them here for a complete pair — priced separately.",
    placement: "bottom",
  },
  {
    target: "cart-checkout-btn",
    title: "Ready to pay?",
    body: "Tap Checkout when you're happy with your order. You'll confirm your address and choose a delivery zone next.",
    placement: "top",
  },
];

export const CHECKOUT_TOUR: TourStep[] = [
  {
    target: "checkout-order-summary",
    title: "Order summary",
    body: "Your items, subtotal, delivery fee, and estimated arrival date are all here at a glance.",
    placement: "bottom",
  },
  {
    target: "checkout-contact",
    title: "Delivery details",
    body: "Enter your delivery address and phone number. M&H delivers to all states — choose your zone to see the fee.",
    placement: "bottom",
  },
  {
    target: "checkout-pay-btn",
    title: "Secure checkout",
    body: "Payment is handled securely through Paystack. You can pay with card, bank transfer, or USSD — no CVV stored.",
    placement: "top",
  },
];

export const SIGNUP_TOUR: TourStep[] = [
  {
    target: "signup-form",
    title: "Create your account",
    body: "Fill in your name, email, and a secure password. Your phone number lets us send order delivery updates via SMS.",
    placement: "bottom",
  },
];
