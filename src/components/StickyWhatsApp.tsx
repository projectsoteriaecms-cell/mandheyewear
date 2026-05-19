import { WhatsappLogo } from "@phosphor-icons/react";
import { useLocation } from "react-router-dom";

export const StickyWhatsApp = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;

  return (
    <a
      href="https://wa.me/2349169849266?text=Hi%20Soteria%20Eye%20Clinic"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 group flex items-center gap-2 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all px-4 py-3"
    >
      <WhatsappLogo weight="fill" className="h-6 w-6" />
      <span className="hidden lg:inline-block text-sm font-medium pr-1">Chat with us</span>
    </a>
  );
};
