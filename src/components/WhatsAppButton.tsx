import { WhatsappLogo } from "@phosphor-icons/react";

const WHATSAPP_NUMBER = "2349169849266";
const DEFAULT_MESSAGE = "Hello, I'd like to make an enquiry about your eyewear products.";

export const WhatsAppButton = () => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

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
