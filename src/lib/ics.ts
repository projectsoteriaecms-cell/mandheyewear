// Minimal ICS file builder for appointment "Add to Calendar" download.

export interface IcsEvent {
  title: string;
  description?: string;
  location?: string;
  start: Date;
  durationMinutes: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

const toIcsDate = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

const escapeText = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

export const buildIcs = (event: IcsEvent): string => {
  const end = new Date(event.start.getTime() + event.durationMinutes * 60_000);
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@soteriaeyeclinic`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Soteria Eye Clinic//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(event.start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    event.description ? `DESCRIPTION:${escapeText(event.description)}` : "",
    event.location ? `LOCATION:${escapeText(event.location)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
};

export const downloadIcs = (filename: string, event: IcsEvent) => {
  const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
