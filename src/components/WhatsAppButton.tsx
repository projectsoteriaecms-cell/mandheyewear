import { WhatsappLogo } from "@phosphor-icons/react";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useCurrentProduct } from "@/shared/hooks/useCurrentProduct";
import { WHATSAPP_NUMBER, buildBookingWhatsAppMessage } from "@/shared/lib/whatsappBooking";

const EYECARE_MESSAGE = "Hello, I'd like to make an enquiry about your Eye Care services and booking an appointment.";
const EYEWEAR_MESSAGE = "Hello, I'd like to make an enquiry about your eyewear products.";

const EYECARE_PATHS = ["/eyecare", "/booking"];

export const WhatsAppButton = () => {
  const location = useLocation();
  const { product } = useCurrentProduct();

  const message = useMemo(() => {
    const isBooking = location.pathname.startsWith("/booking");
    if (isBooking) {
      return buildBookingWhatsAppMessage();
    }

    const isEyeCare = EYECARE_PATHS.some(path => location.pathname.startsWith(path));
    const baseMessage = isEyeCare ? EYECARE_MESSAGE : EYEWEAR_MESSAGE;

    if (product?.name) {
      return `Hello, I'm interested in the "${product.name}". I'd like to make an enquiry about this eyewear frame.`;
    }

    return baseMessage;
  }, [location.pathname, product]);

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  // Stacks above the Feedback pill (bottom-20 mobile / bottom-6 from sm up),
  // which itself clears the mobile bottom nav. Keep in step with FeedbackWidget.
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-36 right-4 sm:bottom-20 sm:right-6 z-40 flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all"
    >
      <WhatsappLogo weight="fill" className="h-7 w-7" />
    </a>
  );
};
