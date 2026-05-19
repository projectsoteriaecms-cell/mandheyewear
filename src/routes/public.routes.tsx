import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import { CircleNotch } from "@phosphor-icons/react";

// Lazy load public pages
const Index = lazy(() => import("@/pages/Index"));
const Booking = lazy(() => import("@/pages/Booking"));
const Shop = lazy(() => import("@/pages/Shop"));
const Branches = lazy(() => import("@/pages/Branches"));
const About = lazy(() => import("@/pages/About"));
const Partners = lazy(() => import("@/pages/Partners"));
const Contact = lazy(() => import("@/pages/Contact"));
const ShopRedirect = lazy(() => import("@/pages/ShopRedirect"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const TryOn = lazy(() => import("@/pages/TryOn"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const Returns = lazy(() => import("@/pages/Returns"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const OrderConfirmation = lazy(() => import("@/pages/OrderConfirmation"));
const OrderTracking = lazy(() => import("@/pages/OrderTracking"));
const StyleQuiz = lazy(() => import("@/pages/StyleQuiz"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Install = lazy(() => import("@/pages/Install"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const OfficeAddin = lazy(() => import("@/pages/OfficeAddin"));

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
  <Route key="/eye-care" path="/eye-care" element={withSuspense(ShopRedirect)} />,
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
  <Route key="/dashboard" path="/dashboard" element={withSuspense(Dashboard)} />,
  <Route key="/product" path="/product/:productId" element={withSuspense(ProductDetail)} />,
  <Route key="/checkout" path="/checkout" element={withSuspense(Checkout)} />,
  <Route key="/order-confirmation" path="/order/:orderId" element={withSuspense(OrderConfirmation)} />,
  <Route key="/track-order" path="/track-order" element={withSuspense(OrderTracking)} />,
  <Route key="/style-quiz" path="/style-quiz" element={withSuspense(StyleQuiz)} />,
  <Route key="/onboarding" path="/onboarding" element={withSuspense(Onboarding)} />,
  <Route key="/install" path="/install" element={withSuspense(Install)} />,
  <Route key="/office-addin" path="/office-addin" element={withSuspense(OfficeAddin)} />,
  <Route key="*" path="*" element={withSuspense(NotFound)} />,
];
