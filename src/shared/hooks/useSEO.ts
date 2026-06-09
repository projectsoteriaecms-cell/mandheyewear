import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BASE_URL = "https://mandheyewear.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

function setMetaTag(property: string, content: string, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}

export function useSEO({ title, description, canonical, ogImage, ogType = "website", noindex }: SEOProps) {
  const location = useLocation();
  const fullCanonical = canonical || `${BASE_URL}${location.pathname}`;
  const fullOgImage = ogImage || DEFAULT_OG_IMAGE;

  useEffect(() => {
    document.title = title;

    setMetaTag("description", description);
    setCanonical(fullCanonical);

    // Open Graph
    setMetaTag("og:title", title, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:url", fullCanonical, true);
    setMetaTag("og:image", fullOgImage, true);
    setMetaTag("og:type", ogType, true);

    // Twitter Card
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    setMetaTag("twitter:image", fullOgImage);

    // Robots
    if (noindex) {
      setMetaTag("robots", "noindex, nofollow");
    } else {
      setMetaTag("robots", "index, follow");
    }

    return () => {
      // Reset to defaults on unmount (optional, next page will override)
    };
  }, [title, description, fullCanonical, fullOgImage, ogType, noindex]);
}
