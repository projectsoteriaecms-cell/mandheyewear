import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import { CircleNotch } from "@phosphor-icons/react";

// Retry wrapper for lazy imports to handle stale chunk errors after deployments
function lazyRetry<T extends { default: React.ComponentType<any> }>(importFn: () => Promise<T>) {
  return lazy(() =>
    importFn().catch((err) => {
      const key = `chunk-retry:${importFn.toString()}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
        // Return a never-resolving promise so Suspense keeps showing fallback until reload
        return new Promise<T>(() => {});
      }
      throw err;
    })
  );
}

// Lazy load public pages
const Index = lazyRetry(() => import("@/pages/Index"));
const Booking = lazyRetry(() => import("@/pages/Booking"));
const Shop = lazyRetry(() => import("@/pages/Shop"));
const Branches = lazyRetry(() => import("@/pages/Branches"));
const About = lazyRetry(() => import("@/pages/About"));
const Partners = lazyRetry(() => import("@/pages/Partners"));
const Contact = lazyRetry(() => import("@/pages/Contact"));
const ShopRedirect = lazyRetry(() => import("@/pages/ShopRedirect"));
const EyeCare = lazyRetry(() => import("@/pages/EyeCare"));
const FAQ = lazyRetry(() => import("@/pages/FAQ"));
const TryOn = lazyRetry(() => import("@/pages/TryOn"));
const Privacy = lazyRetry(() => import("@/pages/Privacy"));
const Terms = lazyRetry(() => import("@/pages/Terms"));
const Returns = lazyRetry(() => import("@/pages/Returns"));
const Login = lazyRetry(() => import("@/pages/Login"));
const Signup = lazyRetry(() => import("@/pages/Signup"));
const VerifyEmail = lazyRetry(() => import("@/pages/VerifyEmail"));
const ForgotPassword = lazyRetry(() => import("@/pages/ForgotPassword"));
const Dashboard = lazyRetry(() => import("@/pages/Dashboard"));
const ProductDetail = lazyRetry(() => import("@/pages/ProductDetail"));
const Checkout = lazyRetry(() => import("@/pages/Checkout"));
const OrderConfirmation = lazyRetry(() => import("@/pages/OrderConfirmation"));
const OrderTracking = lazyRetry(() => import("@/pages/OrderTracking"));
const StyleQuiz = lazyRetry(() => import("@/pages/StyleQuiz"));
const Onboarding = lazyRetry(() => import("@/pages/Onboarding"));
const Install = lazyRetry(() => import("@/pages/Install"));
const NotFound = lazyRetry(() => import("@/pages/NotFound"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <CircleNotch weight="bold" className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType<unknown>>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const publicRoutes = [
  <Route key="/" path="/" element={withSuspense(Index)} />,
  <Route key="/booking" path="/booking" element={withSuspense(Booking)} />,
  <Route key="/shop" path="/shop" element={withSuspense(Shop)} />,
  <Route key="/eyewear" path="/eyewear" element={withSuspense(ShopRedirect)} />,
  <Route key="/eye-care" path="/eye-care" element={withSuspense(EyeCare)} />,
  <Route key="/branches" path="/branches" element={withSuspense(Branches)} />,
  <Route key="/about" path="/about" element={withSuspense(About)} />,
  <Route key="/partners" path="/partners" element={withSuspense(Partners)} />,
  <Route key="/contact" path="/contact" element={withSuspense(Contact)} />,
  <Route key="/faq" path="/faq" element={withSuspense(FAQ)} />,
  <Route key="/try-on" path="/try-on" element={withSuspense(TryOn)} />,
  <Route key="/privacy" path="/privacy" element={withSuspense(Privacy)} />,
  <Route key="/terms" path="/terms" element={withSuspense(Terms)} />,
  <Route key="/returns" path="/returns" element={withSuspense(Returns)} />,
  <Route key="/login" path="/login" element={withSuspense(Login)} />,
  <Route key="/signup" path="/signup" element={withSuspense(Signup)} />,
  <Route key="/verify-email" path="/verify-email" element={withSuspense(VerifyEmail)} />,
  <Route key="/forgot-password" path="/forgot-password" element={withSuspense(ForgotPassword)} />,
  <Route key="/dashboard" path="/dashboard" element={withSuspense(Dashboard)} />,
  <Route key="/product" path="/product/:productId" element={withSuspense(ProductDetail)} />,
  <Route key="/checkout" path="/checkout" element={withSuspense(Checkout)} />,
  <Route key="/order-confirmation" path="/order/:orderId" element={withSuspense(OrderConfirmation)} />,
  <Route key="/track-order" path="/track-order" element={withSuspense(OrderTracking)} />,
  <Route key="/style-quiz" path="/style-quiz" element={withSuspense(StyleQuiz)} />,
  <Route key="/onboarding" path="/onboarding" element={withSuspense(Onboarding)} />,
  <Route key="/install" path="/install" element={withSuspense(Install)} />,
  <Route key="*" path="*" element={withSuspense(NotFound)} />,
];
