import { WhatsappLogo } from "@phosphor-icons/react";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";

const WHATSAPP_NUMBER = "2349169849266";

const EYECARE_MESSAGE = "Hello, I'd like to make an enquiry about your Eye Care services and booking an appointment.";
const EYEWEAR_MESSAGE = "Hello, I'd like to make an enquiry about your eyewear products.";

const EYECARE_PATHS = ["/eyecare", "/booking"];

export const WhatsAppButton = () => {
  const location = useLocation();

  const message = useMemo(() => {
    const isEyeCare = EYECARE_PATHS.some(path => location.pathname.startsWith(path));
    return isEyeCare ? EYECARE_MESSAGE : EYEWEAR_MESSAGE;
  }, [location.pathname]);

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all"
    >
      <WhatsappLogo weight="fill" className="h-7 w-7" />
    </a>
  );
};
