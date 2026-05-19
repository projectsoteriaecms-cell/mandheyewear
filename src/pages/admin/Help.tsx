import { AdminLayout } from "@/shared/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { LifeBuoy } from "lucide-react";

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <Card id={id} className="scroll-mt-24">
    <CardHeader>
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent className="prose prose-sm max-w-none dark:prose-invert text-sm leading-relaxed space-y-3">
      {children}
    </CardContent>
  </Card>
);

const Step = ({ children }: { children: React.ReactNode }) => (
  <li className="ml-4 list-decimal">{children}</li>
);

export default function Help() {
  const toc = [
    ["getting-started", "Getting Started"],
    ["dashboard", "Dashboard"],
    ["clinic-board", "Clinic — Today's Board"],
    ["clinic-emr", "Clinic — Patients & EMR"],
    ["clinic-hmo", "Clinic — HMO & Claims"],
    ["clinic-recalls", "Clinic — Recalls"],
    ["clinic-reports", "Clinic — Reports"],
    ["inventory", "Inventory & Products"],
    ["permissions", "Permissions Matrix"],
    ["faq", "FAQ & Troubleshooting"],
  ];

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <LifeBuoy className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Admin Help & Walkthrough</h1>
          <p className="text-sm text-muted-foreground">
            One-page reference for the Soteria + M&amp;H admin. Use the table of contents to jump to a section.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">On this page</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {toc.map(([id, label]) => (
                <a key={id} href={`#${id}`} className="block text-muted-foreground hover:text-primary">
                  {label}
                </a>
              ))}
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-6">
          <Section id="getting-started" title="Getting Started">
            <p>The admin is shared by Soteria Eye Clinic and M&amp;H Eyewear staff. Access is gated by your role.</p>
            <ol className="space-y-1">
              <Step>Sign in at <Link to="/login" className="text-primary underline">/login</Link> with your work email.</Step>
              <Step>Navigate to <code>/admin</code>. If you see "Access Denied", your account hasn't been promoted yet — ask a super admin.</Step>
              <Step>Use the sidebar to switch sections. Items you don't have access to are hidden automatically.</Step>
              <Step>To invite a teammate, go to <Link to="/admin/users" className="text-primary underline">Users</Link> → "Invite user", pick their role, and send.</Step>
            </ol>
          </Section>

          <Section id="dashboard" title="Dashboard">
            <p><Link to="/admin" className="text-primary underline">/admin</Link> shows two KPI strips:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong>Inventory</strong> — total products, low stock, out of stock, today's sales.</li>
              <li><strong>Clinic Today</strong> — visits today, checked-in, completed, no-shows, open encounters, pending claims, recalls due.</li>
            </ul>
            <p>Numbers are live — refresh the page to recompute (cached for ~30s).</p>
          </Section>

          <Section id="clinic-board" title="Clinic — Today's Board">
            <p>Path: <Link to="/admin/clinic/board" className="text-primary underline">/admin/clinic/board</Link>. A Kanban view of every appointment scheduled for today.</p>
            <ol className="space-y-1">
              <Step>Patient arrives → click <Badge variant="secondary">Check In</Badge> on their card. Stamps <code>checked_in_at</code>.</Step>
              <Step>Doctor calls them in → click <Badge variant="secondary">In Room</Badge>. Stamps <code>in_room_at</code>.</Step>
              <Step>After consultation → click <Badge variant="secondary">Complete</Badge>. Stamps <code>completed_at</code>.</Step>
              <Step>If they don't show up → click <Badge variant="destructive">No-show</Badge>. Counts against the no-show KPI.</Step>
              <Step>"Open Encounter" jumps straight to the EMR editor pre-filled for that patient.</Step>
            </ol>
          </Section>

          <Section id="clinic-emr" title="Clinic — Patients & EMR">
            <p>Patient directory: <Link to="/admin/clinic/patients" className="text-primary underline">/admin/clinic/patients</Link>. Click any patient to see their full history.</p>
            <p><strong>Starting an encounter:</strong></p>
            <ol className="space-y-1">
              <Step>From the patient page or Today's Board, click "New Encounter".</Step>
              <Step>Fill in chief complaint and history.</Step>
              <Step>Capture vitals (BP, IOP) and refraction (SPH / CYL / AXIS / PD per eye).</Step>
              <Step>Note anterior/posterior segment findings, diagnoses, and plan.</Step>
              <Step>Click <Badge>Sign & Lock</Badge> when done — sets status to <code>signed</code> and stamps the doctor.</Step>
              <Step>Use <Badge variant="secondary">Issue Rx</Badge> to convert the refraction into a patient prescription.</Step>
            </ol>
            <p className="text-muted-foreground">Drafts auto-save. You can come back to an in-progress encounter from the Encounters list.</p>
          </Section>

          <Section id="clinic-hmo" title="Clinic — HMO & Claims">
            <p>HMO providers: <Link to="/admin/clinic/hmo" className="text-primary underline">/admin/clinic/hmo</Link>. Add/edit insurers, contact info, tariff sheets.</p>
            <p>Claims: <Link to="/admin/clinic/claims" className="text-primary underline">/admin/clinic/claims</Link>.</p>
            <ol className="space-y-1">
              <Step>From a signed encounter, click "Create Claim". Auto-fills patient, HMO, and services.</Step>
              <Step>Status flow: <code>draft → submitted → approved → paid</code> (or <code>rejected</code>).</Step>
              <Step>On approval, enter <em>amount approved</em>. On payment, enter <em>amount paid</em> and date.</Step>
              <Step>Outstanding total = sum of <code>submitted</code> + <code>approved</code> claim amounts (visible on Reports).</Step>
            </ol>
          </Section>

          <Section id="clinic-recalls" title="Clinic — Recalls">
            <p>Path: <Link to="/admin/clinic/recalls" className="text-primary underline">/admin/clinic/recalls</Link>.</p>
            <p>Recalls remind patients to book follow-ups (annual exam, post-op check, contact lens review).</p>
            <ol className="space-y-1">
              <Step>Create from an encounter ("Schedule Recall") or manually for any patient.</Step>
              <Step>Set type and due date. Status starts as <code>pending</code>.</Step>
              <Step>"Send" triggers a Resend email and stamps <code>sent_at</code>.</Step>
              <Step>When the patient books or visits, mark <Badge>Completed</Badge>.</Step>
            </ol>
          </Section>

          <Section id="clinic-reports" title="Clinic — Reports">
            <p>Path: <Link to="/admin/clinic/reports" className="text-primary underline">/admin/clinic/reports</Link>. All numbers come from the <code>clinic_kpis()</code> Postgres function.</p>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong>Visits today / Completed / No-shows</strong> — appointments where <code>scheduled_date = today</code>.</li>
              <li><strong>Upcoming 7d</strong> — appointments scheduled in the next week.</li>
              <li><strong>Open encounters</strong> — encounters in <code>draft</code> or <code>in_progress</code>.</li>
              <li><strong>Pending claims</strong> — claims in <code>draft</code> or <code>submitted</code>.</li>
              <li><strong>Claims outstanding (₦)</strong> — billed amount of submitted+approved claims.</li>
              <li><strong>Recalls due (7d)</strong> — pending recalls with due_date in the next week.</li>
              <li><strong>Active patients (30d)</strong> — distinct patients seen in the last 30 days.</li>
              <li><strong>Lapsed patients</strong> — last visit &gt; 365 days ago.</li>
            </ul>
          </Section>

          <Section id="inventory" title="Inventory & Products">
            <p>The retail side is unchanged. Quick links:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li><Link to="/admin/inventory" className="text-primary underline">Stock overview</Link> — quantities per branch.</li>
              <li><Link to="/admin/inventory/purchase-orders" className="text-primary underline">Purchase orders</Link> — auto-receives stock when marked received.</li>
              <li><Link to="/admin/inventory/transfers" className="text-primary underline">Transfers</Link> — move stock between branches.</li>
              <li><Link to="/admin/products" className="text-primary underline">Products</Link> + <Link to="/admin/products/images" className="text-primary underline">Image generation</Link> (Admin role required).</li>
            </ul>
          </Section>

          <Section id="permissions" title="Permissions Matrix">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2 border">Area</th>
                    <th className="p-2 border">user</th>
                    <th className="p-2 border">branch_staff</th>
                    <th className="p-2 border">branch_manager</th>
                    <th className="p-2 border">admin</th>
                    <th className="p-2 border">super_admin</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Access /admin", "—", "✓", "✓", "✓", "✓"],
                    ["Today's Board / EMR", "—", "✓", "✓", "✓", "✓"],
                    ["Sign encounters", "—", "✓", "✓", "✓", "✓"],
                    ["HMO providers / claims", "—", "view+create", "manage", "manage", "manage"],
                    ["Manage products / images", "—", "—", "—", "✓", "✓"],
                    ["Inventory adjustments", "—", "create", "approve", "approve", "approve"],
                    ["Branches / Settings / Users", "—", "—", "users", "—", "✓"],
                  ].map((row, i) => (
                    <tr key={i} className="even:bg-muted/30">
                      {row.map((cell, j) => (
                        <td key={j} className={`p-2 border ${j === 0 ? "text-left font-medium" : "text-center"}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="faq" title="FAQ & Troubleshooting">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="q1">
                <AccordionTrigger>I signed in but /admin says "Access Denied"</AccordionTrigger>
                <AccordionContent>
                  Your account is on the default <code>user</code> role. A super admin needs to promote you via the Users page, or invite you with the right role before you sign up.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger>I don't see new changes after a deploy</AccordionTrigger>
                <AccordionContent>
                  Just refresh the page (Ctrl/Cmd+R). The service worker now picks up new builds automatically — no need to clear cookies.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger>Why can't I see another branch's data?</AccordionTrigger>
                <AccordionContent>
                  Branch staff/managers are scoped to branches assigned in <Link to="/admin/users" className="text-primary underline">Users</Link>. Super admins see everything.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q4">
                <AccordionTrigger>An appointment is missing from Today's Board</AccordionTrigger>
                <AccordionContent>
                  Check the date — the board only shows <code>scheduled_date = today</code>. Past/future appointments live under <Link to="/admin/appointments" className="text-primary underline">Appointments</Link>.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q5">
                <AccordionTrigger>Who do I contact for help?</AccordionTrigger>
                <AccordionContent>
                  Reach the system administrator via the email on the Branches page, or email <code>admin@soteriaeyeclinic.com</code>.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Section>
        </div>
      </div>
    </AdminLayout>
  );
}
