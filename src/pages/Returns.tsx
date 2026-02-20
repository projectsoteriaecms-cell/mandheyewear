import { useSEO } from "@/hooks/useSEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

const Returns = () => {
  useSEO({ title: "Returns & Exchanges | M&H Eyewear", description: "M&H Eyewear 30-day satisfaction guarantee. Learn about our return and exchange policy for eyewear purchases." });
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              Returns & Exchanges
            </h1>
            <p className="text-xl text-muted-foreground">
              Your satisfaction is our priority
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8 space-y-6">
              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  30-Day Satisfaction Guarantee
                </h2>
                <p className="text-muted-foreground">
                  We want you to love your eyewear! If you're not completely satisfied with your purchase, 
                  you may return or exchange it within 30 days of receipt. Items must be in original 
                  condition with all packaging, tags, and accessories.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  What Can Be Returned
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Prescription Glasses & Sunglasses</p>
                      <p className="text-sm text-muted-foreground">
                        Unworn and in original condition with prescription verification
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Non-Prescription Eyewear</p>
                      <p className="text-sm text-muted-foreground">
                        Unworn with original packaging and tags attached
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Accessories</p>
                      <p className="text-sm text-muted-foreground">
                        Cases, cleaning kits, and other accessories in original condition
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  What Cannot Be Returned
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Contact Lenses</p>
                      <p className="text-sm text-muted-foreground">
                        Due to health and safety regulations, opened contact lenses cannot be returned
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Worn or Damaged Items</p>
                      <p className="text-sm text-muted-foreground">
                        Items showing signs of wear, scratches, or damage
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Custom/Special Orders</p>
                      <p className="text-sm text-muted-foreground">
                        Specially ordered or customized items (unless defective)
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  How to Return or Exchange
                </h2>
                <ol className="list-decimal pl-6 text-muted-foreground space-y-3">
                  <li>
                    <strong className="text-foreground">Contact Us:</strong> Email returns@soteria-mh.com 
                    or call +1 (234) 567-890 to initiate your return
                  </li>
                  <li>
                    <strong className="text-foreground">Receive Authorization:</strong> We'll provide a 
                    return authorization number and shipping instructions
                  </li>
                  <li>
                    <strong className="text-foreground">Pack Securely:</strong> Return items in their 
                    original packaging with all accessories
                  </li>
                  <li>
                    <strong className="text-foreground">Ship Back:</strong> Use the prepaid return label 
                    we provide (or we'll deduct shipping from your refund)
                  </li>
                  <li>
                    <strong className="text-foreground">Get Refunded:</strong> Refunds are processed 
                    within 5-7 business days of receiving your return
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  Exchanges
                </h2>
                <p className="text-muted-foreground">
                  If you'd like to exchange your eyewear for a different style, color, or size, follow 
                  the same return process and indicate you'd like an exchange. We'll ship your new item 
                  as soon as we receive your return.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  Damaged or Defective Items
                </h2>
                <p className="text-muted-foreground">
                  If your eyewear arrives damaged or defective, please contact us immediately. We'll 
                  arrange for a replacement or full refund at no cost to you, including return shipping. 
                  All eyewear is covered by our manufacturer's warranty against defects.
                </p>
              </section>
            </CardContent>
          </Card>

          <Card className="gradient-hero overflow-hidden">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-2xl font-display font-bold text-white">
                Need Help?
              </h2>
              <p className="text-white/90">
                Our customer service team is here to assist with returns, exchanges, or any questions
              </p>
              <p className="text-white font-medium">
                Email: returns@soteria-mh.com | Phone: +1 (234) 567-890
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Returns;
