import { useEffect } from "react";

interface ResourceHint {
  href: string;
  as?: "script" | "style" | "image" | "font" | "fetch";
  type?: string;
  crossOrigin?: "anonymous" | "use-credentials";
}

// Preload critical resources
export const usePreload = (resources: ResourceHint[]) => {
  useEffect(() => {
    const links: HTMLLinkElement[] = [];

    resources.forEach(({ href, as, type, crossOrigin }) => {
      // Check if already preloaded
      const existing = document.querySelector(`link[href="${href}"][rel="preload"]`);
      if (existing) return;

      const link = document.createElement("link");
      link.rel = "preload";
      link.href = href;
      if (as) link.as = as;
      if (type) link.type = type;
      if (crossOrigin) link.crossOrigin = crossOrigin;
      
      document.head.appendChild(link);
      links.push(link);
    });

    return () => {
      links.forEach((link) => link.remove());
    };
  }, [resources]);
};

// Prefetch resources for future navigation
export const usePrefetch = (urls: string[]) => {
  useEffect(() => {
    const links: HTMLLinkElement[] = [];

    // Only prefetch on idle
    if ("requestIdleCallback" in window) {
      (window as Window).requestIdleCallback(() => {
        urls.forEach((url) => {
          const existing = document.querySelector(`link[href="${url}"][rel="prefetch"]`);
          if (existing) return;

          const link = document.createElement("link");
          link.rel = "prefetch";
          link.href = url;
          document.head.appendChild(link);
          links.push(link);
        });
      });
    }

    return () => {
      links.forEach((link) => link.remove());
    };
  }, [urls]);
};

// DNS prefetch for external domains
export const useDnsPrefetch = (domains: string[]) => {
  useEffect(() => {
    const links: HTMLLinkElement[] = [];

    domains.forEach((domain) => {
      const existing = document.querySelector(`link[href="${domain}"][rel="dns-prefetch"]`);
      if (existing) return;

      const link = document.createElement("link");
      link.rel = "dns-prefetch";
      link.href = domain;
      document.head.appendChild(link);
      links.push(link);
    });

    return () => {
      links.forEach((link) => link.remove());
    };
  }, [domains]);
};
