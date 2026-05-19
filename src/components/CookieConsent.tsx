import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { X } from "@phosphor-icons/react";

const STORAGE_KEY = "soteria-cookie-consent";

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) setTimeout(() => setVisible(true), 1200);
  }, []);

  const decide = (value: "accept" | "reject") => {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 lg:left-6 lg:right-auto lg:max-w-md z-50 bg-card border border-border rounded-2xl shadow-2xl p-5 animate-pop-in">
      <button
        onClick={() => decide("reject")}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
      <h3 className="font-display font-semibold text-foreground mb-1">Cookie Consent</h3>
      <p className="text-sm text-muted-foreground mb-4">
        We use cookies to improve your experience on our site. See our{" "}
        <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>.
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => decide("reject")}>Reject</Button>
        <Button size="sm" onClick={() => decide("accept")}>Accept All</Button>
      </div>
    </div>
  );
};
