import { useSEO } from "@/shared/hooks/useSEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const Terms = () => {
  useSEO({ title: "Terms of Service | M&H Eyewear", description: "M&H Eyewear terms of service. Read our terms and conditions for using our services and purchasing eyewear." });
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card>
            <CardContent className="p-8 space-y-6 prose prose-slate max-w-none">
              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  Agreement to Terms
                </h2>
                <p className="text-muted-foreground">
                  By accessing or using M&H Eyewear services, you agree to be bound 
                  by these Terms of Service and all applicable laws and regulations. If you do not agree 
                  with any of these terms, you are prohibited from using our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  Medical Services
                </h2>
                <p className="text-muted-foreground mb-3">
                  Our eye care services are provided by licensed medical professionals. By booking an 
                  appointment:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>You agree to provide accurate health information</li>
                  <li>You understand that virtual consultations have limitations</li>
                  <li>You agree to follow prescribed treatment plans</li>
                  <li>You acknowledge emergency conditions require immediate medical attention</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  Eyewear Purchases
                </h2>
                <p className="text-muted-foreground mb-3">
                  When purchasing eyewear:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>All sales are subject to availability</li>
                  <li>Prescription eyewear requires a valid prescription</li>
                  <li>Returns are accepted within 30 days per our return policy</li>
                  <li>Custom orders may have different terms</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  AI Try-On Feature
                </h2>
                <p className="text-muted-foreground">
                  Our AI try-on technology is provided for preview purposes only. Actual product appearance 
                  may vary. We do not guarantee perfect accuracy and encourage in-person fitting when possible.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  Intellectual Property
                </h2>
                <p className="text-muted-foreground">
                  All content, including text, graphics, logos, and software, is the property of M&H Eyewear 
                  and protected by copyright and trademark laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  Limitation of Liability
                </h2>
                <p className="text-muted-foreground">
                  To the fullest extent permitted by law, M&H Eyewear shall not be 
                  liable for any indirect, incidental, or consequential damages arising from your use of 
                  our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  Changes to Terms
                </h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. Continued use of our services 
                  after changes constitutes acceptance of the modified terms.
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

export default Terms;
