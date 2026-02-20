import { useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";
import { JsonLd } from "@/components/seo";

const FAQ = () => {
  useSEO({
    title: "Frequently Asked Questions | M&H Eyewear",
    description: "Find answers to common questions about M&H Eyewear services, frames, appointments, contact lenses, and returns.",
  });

  const faqs = [
    {
      category: "Eye Care Services",
      questions: [
        {
          q: "How often should I get an eye exam?",
          a: "Adults should have a comprehensive eye exam every 1-2 years, or annually if you're over 60, wear contacts, or have chronic conditions like diabetes. Children should have their first exam at 6 months, then at age 3, before starting school, and every 1-2 years thereafter."
        },
        {
          q: "Do you accept insurance?",
          a: "Yes! We accept most major health insurance plans, including Medicare and Medicaid. Contact us or check with your insurance provider to verify coverage. Our team will help maximize your benefits and process claims on your behalf."
        },
        {
          q: "What should I bring to my appointment?",
          a: "Please bring your current glasses or contacts, a list of medications you're taking, your insurance card, a valid ID, and any relevant medical records. If you have specific concerns or symptoms, make note of them to discuss with your doctor."
        },
        {
          q: "How long does a comprehensive eye exam take?",
          a: "A comprehensive eye exam typically takes 45-60 minutes. This includes time for paperwork, pre-testing, examination by the doctor, and discussion of your results and any treatment recommendations."
        }
      ]
    },
    {
      category: "Eyewear & Frames",
      questions: [
        {
          q: "How does the AI Try-On feature work?",
          a: "Our AI Try-On technology uses your uploaded photo to virtually place frames on your face with realistic lighting and perspective. Simply upload a clear, front-facing selfie, and you can preview hundreds of frames instantly to see which styles suit you best."
        },
        {
          q: "Can I return or exchange frames?",
          a: "Yes! We offer a 30-day satisfaction guarantee on all eyewear purchases. If you're not completely happy with your frames, you can return or exchange them within 30 days of purchase (frames must be in original condition with all packaging)."
        },
        {
          q: "How long does it take to get my glasses?",
          a: "Standard prescription glasses typically take 7-10 business days. We also offer expedited service (2-3 days) for an additional fee. For basic non-prescription sunglasses from our ready-to-wear collection, you can take them home the same day."
        },
        {
          q: "Do you offer prescription sunglasses?",
          a: "Absolutely! All of our frame styles can be made with prescription lenses, including sunglasses. We offer various lens options including polarized, photochromic (transition), and specialized tints for different activities."
        }
      ]
    },
    {
      category: "Appointments & Booking",
      questions: [
        {
          q: "Can I book appointments online?",
          a: "Yes! You can easily book appointments through our website 24/7. Simply select your preferred location, service, date, and time. You'll receive an instant confirmation email with all the details and can reschedule or cancel online if needed."
        },
        {
          q: "What's your cancellation policy?",
          a: "We ask that you cancel or reschedule at least 24 hours before your appointment to avoid a cancellation fee. You can easily manage your appointments online or by calling the branch directly."
        },
        {
          q: "Do you offer same-day appointments?",
          a: "We do our best to accommodate same-day requests when possible. Call your preferred branch directly, and our team will check availability. For urgent eye care needs, we reserve time slots for emergency cases."
        }
      ]
    },
    {
      category: "Contact Lenses",
      questions: [
        {
          q: "Is a special fitting required for contacts?",
          a: "Yes, contact lenses require a professional fitting to ensure proper fit, comfort, and eye health. During the fitting, we measure your cornea, discuss your lifestyle needs, and provide training on insertion, removal, and care."
        },
        {
          q: "Can I order contact lenses online?",
          a: "Once you have a current, valid prescription from us, you can order refills through our website or by contacting your branch. For first-time wearers, an in-person fitting is required before we can provide a prescription."
        }
      ]
    }
  ];

  const faqJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.flatMap(cat => cat.questions.map(q => ({
      "@type": "Question",
      name: q.q,
      acceptedAnswer: { "@type": "Answer", text: q.a },
    }))),
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <JsonLd data={faqJsonLd} />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about our services
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((category, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                    {category.category}
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${idx}-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-12 gradient-hero overflow-hidden">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-2xl font-display font-bold text-white">
                Still Have Questions?
              </h2>
              <p className="text-white/90">
                Our team is here to help! Contact us directly for personalized assistance.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;
