import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";

const PIXEL_ID = "1429642005500083";

interface ViewContentParams {
  content_ids: string[];
  content_name: string;
  content_type?: "product" | "product_group";
  value?: number;
  currency?: string;
}

interface AddToCartParams {
  content_ids: string[];
  content_type?: "product" | "product_group";
  value: number;
  currency?: string;
}

interface InitiateCheckoutParams {
  content_ids: string[];
  value: number;
  currency?: string;
  num_items: number;
}

interface ScheduleParams {
  content_category?: string;
  content_name?: string;
}

interface SearchParams {
  search_string: string;
}

interface LeadParams {
  content_name?: string;
  content_category?: string;
}

// Check if fbq is available
const fbq = () => {
  if (typeof window !== "undefined" && window.fbq) {
    return window.fbq;
  }
  return null;
};

// Track page views on route changes
export const useMetaPixelPageView = () => {
  const location = useLocation();
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip the initial mount since the pixel script fires PageView on init
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Track page view on route change
    const pixel = fbq();
    if (pixel) {
      pixel("track", "PageView");
    }
  }, [location.pathname]);
};

// Hook for tracking Meta Pixel events
export const useMetaPixel = () => {
  // Track ViewContent (product page views)
  const trackViewContent = useCallback((params: ViewContentParams) => {
    const pixel = fbq();
    if (pixel) {
      pixel("track", "ViewContent", {
        content_ids: params.content_ids,
        content_name: params.content_name,
        content_type: params.content_type || "product",
        value: params.value,
        currency: params.currency || "NGN",
      });
    }
  }, []);

  // Track AddToCart
  const trackAddToCart = useCallback((params: AddToCartParams) => {
    const pixel = fbq();
    if (pixel) {
      pixel("track", "AddToCart", {
        content_ids: params.content_ids,
        content_type: params.content_type || "product",
        value: params.value,
        currency: params.currency || "NGN",
      });
    }
  }, []);

  // Track InitiateCheckout
  const trackInitiateCheckout = useCallback((params: InitiateCheckoutParams) => {
    const pixel = fbq();
    if (pixel) {
      pixel("track", "InitiateCheckout", {
        content_ids: params.content_ids,
        value: params.value,
        currency: params.currency || "NGN",
        num_items: params.num_items,
      });
    }
  }, []);

  // Track CompleteRegistration
  const trackCompleteRegistration = useCallback(() => {
    const pixel = fbq();
    if (pixel) {
      pixel("track", "CompleteRegistration", {
        status: "complete",
      });
    }
  }, []);

  // Track Schedule (appointment booking)
  const trackSchedule = useCallback((params: ScheduleParams) => {
    const pixel = fbq();
    if (pixel) {
      pixel("track", "Schedule", {
        content_category: params.content_category,
        content_name: params.content_name,
      });
    }
  }, []);

  // Track Search
  const trackSearch = useCallback((params: SearchParams) => {
    const pixel = fbq();
    if (pixel) {
      pixel("track", "Search", {
        search_string: params.search_string,
      });
    }
  }, []);

  // Track Lead (contact form submissions)
  const trackLead = useCallback((params: LeadParams) => {
    const pixel = fbq();
    if (pixel) {
      pixel("track", "Lead", {
        content_name: params.content_name,
        content_category: params.content_category,
      });
    }
  }, []);

  // Track AddToWishlist
  const trackAddToWishlist = useCallback((contentId: string, value?: number) => {
    const pixel = fbq();
    if (pixel) {
      pixel("track", "AddToWishlist", {
        content_ids: [contentId],
        content_type: "product",
        value,
        currency: "NGN",
      });
    }
  }, []);

  return {
    trackViewContent,
    trackAddToCart,
    trackInitiateCheckout,
    trackCompleteRegistration,
    trackSchedule,
    trackSearch,
    trackLead,
    trackAddToWishlist,
  };
};
