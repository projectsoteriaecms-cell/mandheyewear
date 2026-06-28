import { useState } from "react";
import { Search, RefreshCw, Copy, Check, CheckCircle2, XCircle } from "lucide-react";
import { AdminLayout } from "@/shared/layouts/admin";
import { RoleGuard } from "@/modules/auth/components/RoleGuard";
import {
  CrmAccessGate,
  PreferenceCenterStats,
  PreferenceLinkCopier,
  useContactPreferences,
  useContactPreferenceLink,
  useRotatePreferenceToken,
} from "@/modules/crm";
import { CrmTabs } from "./CrmTabs";

const EF_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-preference-page`;

function EfUrlCopier() {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(EF_BASE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      title={EF_BASE_URL}
      className="flex items-center gap-1.5 rounded border border-input px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy EF URL"}
    </button>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  marketing:             "Marketing emails",
  newsletter:            "Newsletter",
  appointment_reminders: "Appointment reminders",
  promotions:            "Promotions & discounts",
};

// ── Contact lookup panel ─────────────────────────────────────────────────────

function ContactPreferenceLookup() {
  const [inputEmail, setInputEmail]     = useState("");
  const [searchEmail, setSearchEmail]   = useState<string | undefined>();

  const prefs = useContactPreferences(searchEmail);
  const link  = useContactPreferenceLink(searchEmail);
  const rotate = useRotatePreferenceToken();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const val = inputEmail.toLowerCase().trim();
    if (val.includes("@")) {
      rotate.reset();
      setSearchEmail(val);
    }
  }

  async function handleRotate() {
    if (!searchEmail) return;
    await rotate.mutateAsync(searchEmail);
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/60">
        <h3 className="text-sm font-semibold text-foreground">Contact Preference Lookup</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Look up a contact to view their preferences and generate a preference link.
        </p>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Email search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="email"
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            placeholder="contact@email.com"
            className="flex-1 rounded border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={!inputEmail.includes("@")}
            className="flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            Look up
          </button>
        </form>

        {searchEmail && (
          <>
            {/* Preference link */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-foreground">Preference page link</p>
              <PreferenceLinkCopier url={link.data} isLoading={link.isLoading} />
              {link.error && (
                <p className="text-xs text-destructive">
                  {(link.error as Error).message}
                </p>
              )}
            </div>

            {/* Per-category preferences */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-foreground">Current preferences</p>
              {prefs.isLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 rounded bg-muted animate-pulse" />
                  ))}
                </div>
              ) : prefs.error ? (
                <p className="text-xs text-destructive">
                  {(prefs.error as Error).message}
                </p>
              ) : (
                <div className="divide-y divide-border/60 rounded-md border border-border/60 overflow-hidden">
                  {Object.entries(CATEGORY_LABELS).map(([id, label]) => {
                    const row    = prefs.data?.find((r) => r.category_id === id);
                    const optedIn = row ? row.opted_in : true; // default = true if no row
                    return (
                      <div key={id} className="flex items-center justify-between px-3 py-2 bg-card">
                        <span className="text-xs text-foreground">{label}</span>
                        {optedIn ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Opted in
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <XCircle className="h-3.5 w-3.5" />
                            Opted out
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {prefs.data?.length === 0 && (
                    <div className="px-3 py-3 text-xs text-muted-foreground text-center">
                      No explicit preferences set — contact is opted-in to all categories by default.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Token management */}
            <div className="pt-1 border-t border-border/60">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Rotate the token to invalidate any existing preference links.
                </p>
                <button
                  type="button"
                  onClick={handleRotate}
                  disabled={rotate.isPending}
                  className="flex items-center gap-1.5 rounded border border-input px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${rotate.isPending ? "animate-spin" : ""}`} />
                  Rotate token
                </button>
              </div>
              {rotate.isSuccess && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                  Token rotated — previous link is now invalid.
                </p>
              )}
              {rotate.error && (
                <p className="mt-1 text-xs text-destructive">
                  {(rotate.error as Error).message}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const CrmPreferences = () => {
  return (
    <RoleGuard allowedRoles={["super_admin", "admin", "branch_manager", "branch_staff"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Email Preferences</h1>
              <p className="text-muted-foreground">
                Track category opt-in rates and manage preference links for contacts.
              </p>
            </div>
            <EfUrlCopier />
          </div>

          <CrmTabs />

          <CrmAccessGate>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <PreferenceCenterStats />
              <ContactPreferenceLookup />
            </div>
          </CrmAccessGate>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
};

export default CrmPreferences;
