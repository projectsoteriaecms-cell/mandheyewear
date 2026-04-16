import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductDescriptionProps {
  descriptionHtml?: string | null;
  description?: string | null;
}

const sectionLabels: Record<string, string> = {
  "desc-headline": "Overview",
  "desc-features": "Key Features",
  "desc-measurements": "Measurements",
  "desc-color": "Color & Finish",
  "desc-brand": "Brand Heritage",
  "desc-included": "What's Included",
};

export const ProductDescription = ({
  descriptionHtml,
  description,
}: ProductDescriptionProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["desc-headline", "desc-features"])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  // If no rich description, fall back to plain text
  if (!descriptionHtml) {
    if (!description) return null;
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Parse sections from HTML
  const parser = typeof DOMParser !== "undefined" ? new DOMParser() : null;
  if (!parser) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
        </CardContent>
      </Card>
    );
  }

  const doc = parser.parseFromString(descriptionHtml, "text/html");
  const sections = Array.from(doc.querySelectorAll("section.desc-section"));

  // If no recognized sections, render raw
  if (sections.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div
            className="prose prose-sm dark:prose-invert max-w-none product-description"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {sections.map((section, idx) => {
        const classList = Array.from(section.classList);
        const sectionKey =
          classList.find((c) => c !== "desc-section" && c.startsWith("desc-")) ||
          `section-${idx}`;
        const label = sectionLabels[sectionKey] || `Section ${idx + 1}`;
        const isExpanded = expandedSections.has(sectionKey);
        const isHeadline = sectionKey === "desc-headline";

        // Headline always shows expanded without toggle
        if (isHeadline) {
          return (
            <div
              key={sectionKey}
              className="product-description prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: section.innerHTML }}
            />
          );
        }

        return (
          <Card key={sectionKey} className="overflow-hidden">
            <button
              onClick={() => toggleSection(sectionKey)}
              className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium text-sm sm:text-base">{label}</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            <div
              className={cn(
                "transition-all duration-200 overflow-hidden",
                isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <CardContent className="pt-0 pb-4 sm:pb-6">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none product-description"
                  dangerouslySetInnerHTML={{ __html: section.innerHTML }}
                />
              </CardContent>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
