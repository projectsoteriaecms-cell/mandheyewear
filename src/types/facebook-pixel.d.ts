// Facebook Pixel type definitions
interface FacebookPixelEventData {
  content_ids?: string[];
  content_type?: 'product' | 'product_group';
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
  num_items?: number;
  search_string?: string;
  status?: string;
  [key: string]: unknown;
}

type FacebookPixelEvent =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'CompleteRegistration'
  | 'Schedule'
  | 'Search'
  | 'Lead'
  | 'AddPaymentInfo'
  | 'AddToWishlist';

interface Fbq {
  (command: 'init', pixelId: string): void;
  (command: 'track', event: FacebookPixelEvent, data?: FacebookPixelEventData): void;
  (command: 'trackCustom', event: string, data?: FacebookPixelEventData): void;
  (command: 'consent', action: 'grant' | 'revoke'): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
  push: (...args: unknown[]) => void;
}

declare global {
  interface Window {
    fbq: Fbq;
    _fbq: Fbq;
  }
}

export {};
