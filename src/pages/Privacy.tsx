import { useSEO } from "@/shared/hooks/useSEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const Privacy = () => {
  useSEO({ title: "Privacy Policy | M&H Eyewear", description: "M&H Eyewear privacy policy. Learn how we collect, use, and protect your personal information." });
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-36 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card>
            <CardContent className="p-8 space-y-6 prose prose-slate max-w-none">
              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  Introduction
                </h2>
                <p className="text-muted-foreground">
                  At M&H Eyewear, we are committed to protecting your privacy and 
                  ensuring the security of your personal information. This Privacy Policy explains how we 
                  collect, use, disclose, and safeguard your information when you visit our website or use 
                  our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  Information We Collect
                </h2>
                <p className="text-muted-foreground mb-3">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Personal identification information (name, email, phone number)</li>
                  <li>Health information relevant to your eye care</li>
                  <li>Payment and billing information</li>
                  <li>Appointment preferences and history</li>
                  <li>Photos uploaded for AI try-on features</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  How We Use Your Information
                </h2>
                <p className="text-muted-foreground mb-3">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process appointments and transactions</li>
                  <li>Send you appointment reminders and updates</li>
                  <li>Respond to your comments and questions</li>
                  <li>Comply with legal obligations (HIPAA, etc.)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  Data Security
                </h2>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational measures to protect your personal 
                  information against unauthorized access, alteration, disclosure, or destruction. All 
                  health information is handled in compliance with HIPAA regulations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  Your Rights
                </h2>
                <p className="text-muted-foreground mb-3">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Receive a copy of your health records</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  Contact Us
                </h2>
                <p className="text-muted-foreground">
                  If you have questions about this Privacy Policy, please contact us at:
                </p>
                <p className="text-muted-foreground">
                  Email: info@mheyewear.com<br />
                  Phone: 08063363506
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
