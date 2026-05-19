import { useState, useEffect } from "react";

export type OfficeApp = "word" | "excel" | "powerpoint" | "outlook" | "unknown";

interface OfficeContext {
  isOfficeReady: boolean;
  officeApp: OfficeApp;
  isLoading: boolean;
  isOfficeEnvironment: boolean;
}

declare global {
  interface Window {
    Office?: {
      onReady: (cb: (info: { host: string | null }) => void) => void;
      HostType: {
        Word: string;
        Excel: string;
        PowerPoint: string;
        Outlook: string;
      };
    };
    Word?: unknown;
    Excel?: unknown;
  }
}

export function useOfficeContext(): OfficeContext {
  const [isOfficeReady, setIsOfficeReady] = useState(false);
  const [officeApp, setOfficeApp] = useState<OfficeApp>("unknown");
  const [isLoading, setIsLoading] = useState(true);
  const [isOfficeEnvironment, setIsOfficeEnvironment] = useState(false);

  useEffect(() => {
    // If Office.js is already loaded (e.g. from manifest injection)
    if (window.Office) {
      initOffice();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://appsforoffice.microsoft.com/lib/1/hosted/office.js";
    script.async = true;
    script.onload = initOffice;
    script.onerror = () => setIsLoading(false);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  function initOffice() {
    if (!window.Office) {
      setIsLoading(false);
      return;
    }

    window.Office.onReady((info) => {
      setIsOfficeEnvironment(true);
      setIsOfficeReady(true);
      setIsLoading(false);

      if (!info.host) {
        setOfficeApp("unknown");
        return;
      }

      const { HostType } = window.Office!;
      if (info.host === HostType.Word) setOfficeApp("word");
      else if (info.host === HostType.Excel) setOfficeApp("excel");
      else if (info.host === HostType.PowerPoint) setOfficeApp("powerpoint");
      else if (info.host === HostType.Outlook) setOfficeApp("outlook");
    });
  }

  return { isOfficeReady, officeApp, isLoading, isOfficeEnvironment };
}
