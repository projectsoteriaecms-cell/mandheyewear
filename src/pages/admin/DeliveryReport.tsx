import { Button } from "@/components/ui/button";
import { FileArrowDown } from "@phosphor-icons/react";
import { RoleGuard } from "@/components/admin/RoleGuard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DeliveryReport = () => {
  return (
    <RoleGuard allowedRoles={["super_admin"]}>
      <div className="delivery-report bg-white text-gray-900 min-h-screen">
        {/* Print button - hidden in print */}
        <div className="print:hidden sticky top-0 z-50 bg-white border-b p-4 flex items-center justify-between">
          <h1 className="text-lg font-bold">Platform Delivery Report</h1>
          <Button onClick={() => window.print()} variant="default" className="gap-2">
            <FileArrowDown weight="bold" className="h-4 w-4" />
            Download as PDF
          </Button>
        </div>

        <div className="max-w-4xl mx-auto px-8 py-12 print:px-0 print:py-0 print:max-w-none">
          {/* Cover / Title */}
          <header className="text-center mb-16 print:mb-10">
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">Confidential — Stakeholder Report</p>
            <h1 className="text-4xl font-bold mb-2 print:text-3xl">M&H Eyewear / Soteria Eye Clinic</h1>
            <h2 className="text-2xl font-semibold text-gray-600 mb-6 print:text-xl">Platform Delivery Report</h2>
            <p className="text-gray-500">Prepared: February 2026</p>
          </header>

          {/* Executive Summary */}
          <Section title="Executive Summary">
            <p>
              A full-stack e-commerce and clinical operations platform has been built for M&H Eyewear and
              Soteria Eye Clinic. The platform serves two audiences: <strong>customers</strong> (shopping,
              booking, virtual try-on) and <strong>staff/administrators</strong> (inventory, orders, branch
              management). It is a Progressive Web App (PWA) installable on any device, with offline
              capability, AI-powered features, and social commerce integrations.
            </p>
          </Section>

          {/* Platform at a Glance */}
          <Section title="Platform at a Glance">
            <MetricTable
              rows={[
                ["Total products in catalog", "1,272 active"],
                ["Product types", "Frames (795), Lenses (401), Contact Lenses (10), Accessories (20), Medications (11), Solutions (4), Other (31)"],
                ["Physical branches", "5 locations across 3 states"],
                ["Frame attribute records", "773 (dimensions, materials, colors)"],
                ["Categories", "10 active"],
                ["Registered users", "4 (with roles)"],
                ["Edge functions (backend APIs)", "8 deployed"],
                ["Database tables", "31"],
                ["Database triggers", "20 (automated workflows)"],
                ["Public pages", "22 routes"],
                ["Admin pages", "16 routes"],
              ]}
            />
          </Section>

          {/* 1. Customer-Facing Storefront */}
          <Section title="1. Customer-Facing Storefront" pageBreak>
            <SubSection title="1.1 Homepage">
              <BulletList items={[
                "Hero section with dual branding (Eye Care + Eyewear)",
                "Quick discovery cards for product categories",
                "Featured frames carousel (pulls live from database)",
                "Virtual try-on promotional banner",
                "Style quiz CTA",
                "Trust badges section",
                "Chat assistant launcher",
              ]} />
            </SubSection>
            <SubSection title="1.2 Eyewear Shop (/eyewear)">
              <BulletList items={[
                "Full product catalog with grid and list view toggle",
                "Filters: Gender, Frame Style, Price Sort",
                "Price tier filtering (Budget / Standard / Premium / Luxury)",
                "Pagination (12 products per page)",
                "Quick-view modal on double-click",
                "Personalized \"Recommended For You\" section (for logged-in users with style preferences)",
                "Match score badges and fit indicators based on face measurements",
                "Breadcrumb navigation",
              ]} />
            </SubSection>
            <SubSection title="1.3 Product Detail Pages (/product/:id)">
              <BulletList items={[
                "Multi-image gallery with additional images support",
                "Product specifications section",
                "Add to cart with quantity",
                "Wishlist button",
                "\"Virtual Try-On\" deep link",
                "Related products (\"You May Also Like\")",
                "Mobile sticky action bar (add to cart)",
                "Meta Pixel ViewContent tracking on every product view",
                "Schema.org Product structured data (JSON-LD)",
              ]} />
            </SubSection>
            <SubSection title="1.4 Virtual Try-On (/try-on)">
              <BulletList items={[
                "Photo Mode (AI): Upload a selfie, select any frame, AI generates a photorealistic composite",
                "AR Mode: Live augmented reality via Snap Camera Kit SDK (foundation ready, pending lens creation)",
                "Frame picker carousel with all 795+ frames",
                "Try-on history with save/compare",
                "Deep-link from product pages (/try-on?product=...)",
                "Guided tour for first-time users",
                "Add to cart / Add to wishlist directly from results",
                "Email lead capture modal for VTO downloads",
              ]} />
            </SubSection>
            <SubSection title="1.5 Appointment Booking (/booking)">
              <BulletList items={[
                "4-step wizard: Branch > Service > Date/Time > Review",
                "6 clinical services: Comprehensive Eye Exam, Contact Lens Fitting, Pediatric Eye Exam, Diabetic Eye Screening, Glaucoma Testing, Specialty Consultation",
                "Calendar with disabled past dates and Sundays",
                "Time slot selection (9 AM – 4 PM)",
                "Automated confirmation email via Resend (edge function)",
                "Meta Pixel \"Schedule\" event tracking",
                "Role-based access (only verified customers can book)",
              ]} />
            </SubSection>
            <SubSection title="1.6 E-Commerce Checkout (/checkout)">
              <BulletList items={[
                "Cart drawer with quantity management",
                "Delivery address form with all 37 Nigerian states",
                "Order summary with shipping calculation (free above NGN 50,000)",
                "Profile pre-fill for logged-in users",
                "Paystack payment integration placeholder (ready for integration)",
                "Meta Pixel InitiateCheckout tracking",
                "Role-based access (unverified users blocked)",
              ]} />
            </SubSection>
            <SubSection title="1.7 Style Quiz (/style-quiz)">
              <BulletList items={[
                "5-step interactive quiz: Face Shape > Frame Style > Colors > Usage > Budget",
                "Custom SVG illustrations for face shapes and frame styles",
                "Multi-select support",
                "Saves preferences to user profile",
                "Powers personalized recommendations on the eyewear page",
              ]} />
            </SubSection>
            <SubSection title="1.8 Onboarding Wizard (/onboarding)">
              <BulletList items={[
                "Welcome > Face Scan (AI) > Style Quiz > Lifestyle Poll > Complete",
                "AI-powered face measurement analysis via Gemini",
                "Skip functionality at every step",
                "Progress bar with step tracking",
              ]} />
            </SubSection>
            <SubSection title="1.9 Customer Dashboard (/dashboard)">
              <BulletList items={[
                "7 tabs: Profile, Orders, Appointments, Addresses, Favorites (Wishlist), Frame Profile, Settings",
                "Quick stats (orders, appointments, favorites)",
                "Unverified user view with limited access",
                "Staff auto-redirect to admin panel",
                "Dark mode toggle in settings",
              ]} />
            </SubSection>
            <SubSection title="1.10 Branch Locations (/branches)">
              <BulletList items={[
                "Cards for all 5 branches with address, hours, features",
                "Head office badge",
                "M&H vs Soteria branding distinction",
                "Branch expansion CTA",
              ]} />
            </SubSection>
            <SubSection title="1.11 Additional Pages">
              <BulletList items={[
                "Eye Care (/eye-care): Services overview",
                "About (/about): Company story",
                "Contact (/contact): Contact information",
                "FAQ (/faq): With Schema.org FAQPage structured data",
                "Privacy Policy (/privacy)",
                "Terms of Service (/terms)",
                "Returns Policy (/returns)",
                "Login / Signup (/login, /signup): Full auth flows",
                "Order Confirmation (/order/:orderId)",
                "Order Tracking (/track-order)",
                "PWA Install Guide (/install)",
              ]} />
            </SubSection>
          </Section>

          {/* 2. Admin Dashboard */}
          <Section title="2. Admin Dashboard (/admin)" pageBreak>
            <SubSection title="2.1 Dashboard Home">
              <BulletList items={[
                "Real-time stat cards: Total Stock, Low Stock Alerts, Products, Suppliers",
                "Pending purchase order approvals",
                "Pending stock transfers",
                "Low stock alert list",
                "Quick action buttons",
                "Welcome dialog for newly assigned staff",
                "\"No Branch Assignment\" state for unassigned staff",
              ]} />
            </SubSection>
            <SubSection title="2.2 Inventory Management">
              <BulletList items={[
                "Stock Overview (/admin/inventory): Multi-branch inventory grid with quantities, thresholds, bin locations",
                "Purchase Orders (/admin/inventory/purchase-orders): Full PO lifecycle (Draft → Submitted → Approved → Received), auto-generated PO numbers, item-level tracking",
                "Stock Transfers (/admin/inventory/transfers): Branch-to-branch transfers (Pending → In Transit → Received/Cancelled), auto stock deduction/addition via triggers",
                "Stock Adjustments (/admin/inventory/adjustments): Damage, theft, correction, write-off adjustments with manager approval workflow",
                "Transaction Log (/admin/inventory/transactions): Complete audit trail of all stock movements",
                "Bulk Stock Import: Excel upload with validation",
              ]} />
            </SubSection>
            <SubSection title="2.3 Product Management">
              <BulletList items={[
                "Full CRUD for 1,272 products",
                "ECMS Import: Multi-step wizard to import from clinical management system Excel files with column mapping, validation, duplicate handling, and import history",
                "Bulk Image Upload: Multi-file drag-and-drop with image compression",
                "Product Images Gallery: Grid view of all product images with quick upload modal",
                "Frame attributes management (lens width, bridge size, temple length, materials, colors)",
                "Lens attributes management (SPH, CYL, axis, coatings)",
                "Product list view with search, filtering",
              ]} />
            </SubSection>
            <SubSection title="2.4 Category Management">
              <BulletList items={[
                "Drag-and-drop sortable categories",
                "Parent/child hierarchy",
                "Brand line assignment (M&H Fashion / Soteria Medical)",
                "Create/edit/activate/deactivate",
              ]} />
            </SubSection>
            <SubSection title="2.5 Supplier Management">
              <BulletList items={[
                "Full CRUD for suppliers",
                "Contact details, payment terms, tax IDs",
                "City/state/country tracking",
              ]} />
            </SubSection>
            <SubSection title="2.6–2.11 Other Admin Modules">
              <BulletList items={[
                "Services Management: Clinical service catalog (create/edit/toggle active), duration, pricing, appointment requirement flag",
                "Appointment Management: View all appointments across branches, status management",
                "Branch Management (Super Admin): Branch CRUD, head office designation, M&H vs Soteria branding, operating hours",
                "User Management: Invitation system via email, role assignment, branch assignment, pending invitation tracking with expiry",
                "Reports: Dashboard framework ready",
                "Settings (Super Admin): System configuration",
              ]} />
            </SubSection>
          </Section>

          {/* 3. RBAC */}
          <Section title="3. Role-Based Access Control (RBAC)" pageBreak>
            <p className="mb-4">5-tier permission hierarchy enforced at both <strong>frontend</strong> (UI gating) and <strong>backend</strong> (PostgreSQL Row-Level Security policies on every table).</p>
            <ReportTable
              headers={["Role", "Access Level"]}
              rows={[
                ["User (Unverified)", "Browse only. Cannot purchase, book, or wishlist"],
                ["Customer (Verified)", "Full storefront: purchase, book appointments, wishlist, frame profile"],
                ["Branch Staff", "Admin dashboard: view inventory, create POs/transfers/adjustments, view appointments"],
                ["Branch Manager", "All staff permissions + approve POs/transfers, manage products/categories/suppliers/services, view reports"],
                ["Super Admin", "Full system access: manage branches, users, settings, all operations"],
              ]}
            />
          </Section>

          {/* 4. Backend Infrastructure */}
          <Section title="4. Backend Infrastructure" pageBreak>
            <SubSection title="4.1 Database (31 Tables)">
              <BulletList items={[
                "products, categories, frame_attributes, lens_attributes — Catalog",
                "inventory, inventory_transactions — Stock tracking",
                "purchase_orders, purchase_order_items — Procurement",
                "stock_transfers, stock_transfer_items — Inter-branch logistics",
                "stock_adjustments — Corrections",
                "suppliers — Vendor management",
                "branches, branch_assignments — Location management",
                "orders, order_items — E-commerce",
                "cart_items, wishlist — Shopping",
                "appointments, services — Clinical",
                "prescriptions — Patient records",
                "profiles, user_roles, user_invitations — Users",
                "notifications — Real-time alerts",
                "user_measurements, personalization_analytics — AI/personalization",
                "style_polls, poll_responses — Style preferences",
                "import_history — Data import tracking",
                "vto_email_leads — Lead capture",
              ]} />
            </SubSection>
            <SubSection title="4.2 Database Triggers (20 Active)">
              <BulletList items={[
                "Auto-calculate price tiers on product insert/update",
                "Validate lens axis values (0–180 degrees)",
                "Auto-generate order numbers (ORD-YYYYMMDD-XXXX)",
                "Auto-generate PO numbers (PO-YYYYMMDD-XXXX)",
                "Auto-generate transfer numbers (TRF-YYYYMMDD-XXXX)",
                "Deduct inventory on order item creation",
                "Return inventory on order cancellation",
                "Handle PO received (add stock + log transactions)",
                "Handle stock transfer lifecycle (deduct/add/return on status changes)",
                "Auto-create profile and role on new user signup",
                "Process invitations on signup",
                "Auto-update updated_at timestamps (10 tables)",
              ]} />
            </SubSection>
            <SubSection title="4.3 Edge Functions (8 Deployed)">
              <ReportTable
                headers={["Function", "Purpose"]}
                rows={[
                  ["analyze-face", "AI face measurement via Gemini (face shape, dimensions)"],
                  ["virtual-try-on", "AI frame overlay generation with Gemini + Lovable AI fallback"],
                  ["meta-product-feed", "XML product catalog for Facebook/Instagram Shopping"],
                  ["sitemap", "Dynamic XML sitemap for SEO (static + 1,272 product URLs)"],
                  ["send-appointment-confirmation", "Email confirmation via Resend"],
                  ["send-tryon-result", "Email VTO results to users"],
                  ["send-user-invitation", "Staff invitation emails via Resend"],
                  ["sync-offline-changes", "PWA offline data synchronization"],
                ]}
              />
            </SubSection>
            <SubSection title="4.4 Storage">
              <BulletList items={["product-images bucket (public) for product photography"]} />
            </SubSection>
          </Section>

          {/* 5. Branch Network */}
          <Section title="5. Branch Network" pageBreak>
            <ReportTable
              headers={["Branch", "City", "State", "Type"]}
              rows={[
                ["Soteria Eye Clinic — Warri (Head Office)", "Warri", "Delta", "Physical Store"],
                ["Soteria Eye Clinic — Lagos (Lekki)", "Lekki, Lagos", "Lagos", "Physical Store"],
                ["Soteria Eye Clinic — Effurun (Delta Mall)", "Effurun", "Delta", "Physical Store"],
                ["Soteria Eye Clinic — Uyo (Tropicana Mall)", "Uyo", "Akwa Ibom", "Physical Store"],
                ["M&H Eyewear — Lagos (Lekki Flagship)", "Eti-Osa, Lekki", "Lagos", "Physical Store"],
              ]}
            />
          </Section>

          {/* 6. SEO & Marketing */}
          <Section title="6. SEO and Marketing" pageBreak>
            <SubSection title="6.1 On-Page SEO">
              <BulletList items={[
                "Dynamic meta titles and descriptions on every page (22 routes)",
                "Canonical URLs per page",
                "Open Graph and Twitter Card tags",
                "Schema.org JSON-LD: Organization, Product, FAQPage",
                "Proper heading hierarchy (h1/h2/h3)",
                "robots.txt with sitemap directive",
              ]} />
            </SubSection>
            <SubSection title="6.2 Dynamic XML Sitemap">
              <BulletList items={[
                "Edge function generating sitemap with all static pages + 1,272 product URLs",
                "Proper lastmod, changefreq, priority values",
              ]} />
            </SubSection>
            <SubSection title="6.3 Meta Pixel (Facebook/Instagram)">
              <BulletList items={[
                "Pixel ID: 1429642005500083",
                "Events tracked: PageView (SPA-aware), ViewContent, AddToCart, InitiateCheckout, CompleteRegistration, Schedule, Search, Lead, AddToWishlist",
                "noscript fallback for non-JS browsers",
              ]} />
            </SubSection>
            <SubSection title="6.4 Meta Product Feed">
              <BulletList items={[
                "Live XML feed for Facebook/Instagram Shopping",
                "Auto-generated descriptions for products without descriptions",
                "All 1,272 active products included",
              ]} />
            </SubSection>
            <SubSection title="6.5 VTO Email Lead Capture">
              <BulletList items={[
                "Email collection modal on virtual try-on download",
                "Marketing consent checkbox",
                "3 leads captured to date",
              ]} />
            </SubSection>
          </Section>

          {/* 7. PWA */}
          <Section title="7. Progressive Web App (PWA)" pageBreak>
            <BulletList items={[
              "Installable on iOS, Android, and desktop",
              "Offline indicator with connectivity status",
              "Service worker with intelligent caching: Google Fonts (cache-first, 1 year), Images (cache-first, 30 days), API calls (network-first with 5-minute cache fallback)",
              "Background sync queue for offline mutations (24-hour retry)",
              "Install prompt with dedicated install guide page (/install)",
              "App manifest with icons, theme colors, categories",
            ]} />
          </Section>

          {/* 8. Mobile */}
          <Section title="8. Mobile Optimization">
            <BulletList items={[
              "Responsive design across all pages",
              "Mobile-specific navigation: top bar + bottom nav",
              "Mobile sticky action bars on product pages",
              "Touch-optimized targets",
              "Pull-to-refresh capability (hook ready)",
              "Swipe gesture support (hook ready)",
              "Lazy-loaded routes for faster initial load",
            ]} />
          </Section>

          {/* 9. Tech Architecture */}
          <Section title="9. Technical Architecture" pageBreak>
            <SubSection title="Frontend Stack">
              <BulletList items={[
                "React 18 + TypeScript",
                "Vite (build tool) with SWC compiler",
                "TailwindCSS + Radix UI component library",
                "React Router v6 (SPA routing)",
                "TanStack React Query (server state management)",
                "Phosphor Icons + Lucide Icons",
                "Recharts (data visualization)",
              ]} />
            </SubSection>
            <SubSection title="Backend Stack">
              <BulletList items={[
                "Lovable Cloud (Supabase)",
                "PostgreSQL database with RLS",
                "Deno edge functions",
                "Resend for transactional emails",
                "Gemini AI (face analysis + virtual try-on)",
              ]} />
            </SubSection>
            <SubSection title="Code Organization">
              <BulletList items={[
                "Modular architecture: src/modules/ (products, inventory, categories, branches, services, suppliers, users)",
                "Shared components: src/shared/",
                "Custom hooks pattern for all data operations",
                "Barrel exports for clean imports",
              ]} />
            </SubSection>
          </Section>

          {/* 10. Pending */}
          <Section title="10. Pending / Future Work" pageBreak>
            <ReportTable
              headers={["Item", "Status", "Dependency"]}
              rows={[
                ["Paystack payment integration", "Checkout UI ready, integration pending", "Paystack API keys"],
                ["Google Analytics 4", "Not configured", "GA4 Measurement ID"],
                ["Google Search Console", "Not verified", "Verification code"],
                ["TikTok Pixel", "Not started", "TikTok Business account"],
                ["Snap Camera Kit lenses", "SDK integrated, lenses not created", "Snap developer account + Lens Studio 3D models"],
                ["Custom domain", "Using lovable.app subdomain", "Domain purchase + DNS config"],
                ["Seed suppliers data", "Table empty (0 records)", "Client to provide supplier list"],
                ["Seed services data", "Table empty (0 records)", "Client to confirm service catalog and pricing"],
                ["Product images", "~20% coverage", "Product photography"],
                ["Inventory stock levels", "~92% at zero", "Initial stock count from branches"],
              ]}
            />
          </Section>

          {/* 11. Security */}
          <Section title="11. Security">
            <BulletList items={[
              "Row-Level Security (RLS) on all 31 tables",
              "Role-based policies enforcing the 5-tier permission hierarchy",
              "SECURITY DEFINER functions for cross-role operations (notifications, triggers)",
              "Email-based authentication (no anonymous signups)",
              "Invitation-based staff onboarding with token expiry (7 days)",
              "Edge functions with JWT verification where required",
            ]} />
          </Section>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t text-center text-sm text-gray-400 print:mt-8">
            <p>End of Report — M&H Eyewear / Soteria Eye Clinic Platform Delivery</p>
            <p>Prepared February 2026 • Confidential</p>
          </footer>
        </div>
      </div>
    </RoleGuard>
  );
};

/* ---- Helper Components ---- */

const Section = ({
  title,
  children,
  pageBreak,
}: {
  title: string;
  children: React.ReactNode;
  pageBreak?: boolean;
}) => (
  <section className={`mb-12 ${pageBreak ? "print:break-before-page" : ""}`}>
    <h2 className="text-2xl font-bold border-b-2 border-gray-800 pb-2 mb-6 print:text-xl">{title}</h2>
    {children}
  </section>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-3 print:text-base">{title}</h3>
    {children}
  </div>
);

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="list-disc pl-6 space-y-1 text-sm leading-relaxed">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);

const MetricTable = ({ rows }: { rows: string[][] }) => (
  <Table className="report-table">
    <TableHeader>
      <TableRow>
        <TableHead className="font-bold w-1/3">Metric</TableHead>
        <TableHead className="font-bold">Value</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map(([metric, value], i) => (
        <TableRow key={i}>
          <TableCell className="font-medium">{metric}</TableCell>
          <TableCell>{value}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const ReportTable = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <Table className="report-table">
    <TableHeader>
      <TableRow>
        {headers.map((h, i) => (
          <TableHead key={i} className="font-bold">{h}</TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((row, i) => (
        <TableRow key={i}>
          {row.map((cell, j) => (
            <TableCell key={j}>{cell}</TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default DeliveryReport;
