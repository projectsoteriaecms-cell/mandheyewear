import { useState } from "react";
import { AdminLayout } from "@/shared/layouts/admin";
import { RoleGuard } from "@/modules/auth/components/RoleGuard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Search, ChevronLeft, ChevronRight, Users, Eye, Mail, Sparkles, UserCheck, ShoppingBag, Ban,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  CrmAccessGate,
  useCrmContacts,
  useContactStats,
  useContactPreferenceLink,
  PreferenceLinkCopier,
  type CrmContact,
  type ContactFilter,
} from "@/modules/crm";
import { CrmTabs } from "./CrmTabs";

// ── Helpers ─────────────────────────────────────────────────────────────────────

const naira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";

const FILTERS: { key: ContactFilter; label: string }[] = [
  { key: "all",         label: "All" },
  { key: "leads",       label: "VTO Leads" },
  { key: "subscribers", label: "Subscribers" },
  { key: "registered",  label: "Registered" },
  { key: "customers",   label: "Customers" },
  { key: "suppressed",  label: "Suppressed" },
];

// ── Stat cards ───────────────────────────────────────────────────────────────────

function StatCards() {
  const { data, isLoading } = useContactStats();
  const cards = [
    { label: "Total Contacts", value: data?.total_contacts,   icon: Users,      color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20" },
    { label: "VTO Leads",      value: data?.vto_leads,        icon: Sparkles,   color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20" },
    { label: "Subscribers",    value: data?.subscribers,      icon: Mail,       color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
    { label: "Registered",     value: data?.registered,       icon: UserCheck,  color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Customers",      value: data?.paying_customers, icon: ShoppingBag,color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
    { label: "Suppressed",     value: data?.suppressed,       icon: Ban,        color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((c) => (
        <Card key={c.label} className="p-4">
          <div className={cn("mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg", c.color)}>
            <c.icon className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold tabular-nums">
            {isLoading ? <Skeleton className="h-7 w-14" /> : (c.value ?? 0).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">{c.label}</div>
        </Card>
      ))}
    </div>
  );
}

// ── Contact detail dialog ────────────────────────────────────────────────────────

function ContactDetail({ contact, onClose }: { contact: CrmContact | null; onClose: () => void }) {
  const { data: url, isLoading } = useContactPreferenceLink(contact?.email ?? undefined);

  if (!contact) return null;
  return (
    <Dialog open={!!contact} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{contact.full_name || contact.email}</DialogTitle>
          <DialogDescription>{contact.email}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {contact.is_vto_lead && <Badge variant="secondary">VTO Lead</Badge>}
            {contact.is_newsletter_subscriber && <Badge variant="secondary">Subscriber</Badge>}
            {contact.is_registered && <Badge variant="secondary">Registered</Badge>}
            {contact.marketing_consent && <Badge variant="outline">Marketing OK</Badge>}
            {contact.is_suppressed && <Badge variant="destructive">Suppressed</Badge>}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Lifetime Value" value={naira(contact.lifetime_value)} />
            <Field label="Orders" value={String(contact.order_count)} />
            <Field label="Try-ons" value={String(contact.try_on_count)} />
            <Field label="Phone" value={contact.phone || "—"} />
            <Field label="Last order" value={fmtDate(contact.last_order_at)} />
            <Field label="Last activity" value={fmtDate(contact.last_activity_at)} />
            <Field label="First seen" value={fmtDate(contact.first_seen)} />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Email preference link</p>
            <PreferenceLinkCopier url={url} isLoading={isLoading} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────────

const CrmCustomers = () => {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<ContactFilter>("all");
  const [page, setPage]       = useState(0);
  const [selected, setSelected] = useState<CrmContact | null>(null);

  const { data, isLoading, isFetching } = useCrmContacts({ search, filter, page });

  function applyFilter(f: ContactFilter) { setFilter(f); setPage(0); }
  function applySearch(v: string)        { setSearch(v); setPage(0); }

  return (
    <RoleGuard allowedRoles={["super_admin", "admin", "branch_manager"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">CRM Customers</h1>
            <p className="text-muted-foreground">Unified contacts across try-on leads, subscribers, and buyers.</p>
          </div>

          <CrmTabs />

          <CrmAccessGate>
            <div className="space-y-4">
              <StatCards />

              {/* Search + filters */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search name or email…"
                    value={search}
                    onChange={(e) => applySearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {FILTERS.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => applyFilter(f.key)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        filter === f.key
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">LTV</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead>Last activity</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={6}><Skeleton className="h-6 w-full" /></TableCell>
                        </TableRow>
                      ))
                    ) : data && data.rows.length > 0 ? (
                      data.rows.map((c) => (
                        <TableRow key={c.email} className="cursor-pointer" onClick={() => setSelected(c)}>
                          <TableCell>
                            <div className="font-medium">{c.full_name || "—"}</div>
                            <div className="text-xs text-muted-foreground">{c.email}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {c.is_vto_lead && <Badge variant="secondary" className="text-[10px]">VTO</Badge>}
                              {c.is_newsletter_subscriber && <Badge variant="secondary" className="text-[10px]">News</Badge>}
                              {c.is_registered && <Badge variant="secondary" className="text-[10px]">User</Badge>}
                              {c.is_suppressed && <Badge variant="destructive" className="text-[10px]">Supp</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{naira(c.lifetime_value)}</TableCell>
                          <TableCell className="text-right tabular-nums">{c.order_count}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{fmtDate(c.last_activity_at)}</TableCell>
                          <TableCell>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                          No contacts match these filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>

              {/* Pagination */}
              {data && data.total > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {(page * data.pageSize + 1).toLocaleString()}–
                    {Math.min((page + 1) * data.pageSize, data.total).toLocaleString()} of {data.total.toLocaleString()}
                    {isFetching && " · updating…"}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                      <ChevronLeft className="h-4 w-4" /> Prev
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      disabled={page >= data.pageCount - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CrmAccessGate>
        </div>

        <ContactDetail contact={selected} onClose={() => setSelected(null)} />
      </AdminLayout>
    </RoleGuard>
  );
};

export default CrmCustomers;
