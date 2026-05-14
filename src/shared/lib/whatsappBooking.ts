export const WHATSAPP_NUMBER = "2349169849266";

export interface BookingWhatsAppParams {
  branchName?: string | null;
  serviceLabel?: string | null;
  dateLabel?: string | null;
  timeLabel?: string | null;
  notes?: string | null;
}

const hasAnySelection = (p: BookingWhatsAppParams) =>
  Boolean(p.branchName || p.serviceLabel || p.dateLabel || p.timeLabel);

export const buildBookingWhatsAppMessage = (params: BookingWhatsAppParams = {}): string => {
  if (!hasAnySelection(params)) {
    return [
      "Hello M&H Eye Care 👋",
      "",
      "I'd like to book an eye exam. Please help me confirm:",
      "",
      "• Preferred Branch: ",
      "• Service Needed: ",
      "• Preferred Date & Time: ",
      "• Full Name: ",
      "• Phone Number: ",
      "",
      "Looking forward to your reply.",
    ].join("\n");
  }

  const dash = "—";
  const lines = [
    "Hello M&H Eye Care 👋",
    "",
    "I'd like to book an eye exam with these details:",
    "",
    `• Branch: ${params.branchName || dash}`,
    `• Service: ${params.serviceLabel || dash}`,
    `• Date: ${params.dateLabel || dash}`,
    `• Time: ${params.timeLabel || dash}`,
  ];
  if (params.notes && params.notes.trim()) {
    lines.push("", `Notes: ${params.notes.trim()}`);
  }
  lines.push("", "Please confirm availability. Thank you!");
  return lines.join("\n");
};

export const buildBookingWhatsAppUrl = (params: BookingWhatsAppParams = {}): string =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildBookingWhatsAppMessage(params))}`;
