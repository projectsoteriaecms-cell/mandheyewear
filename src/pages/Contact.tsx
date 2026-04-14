import { useState } from "react";
import { useSEO } from "@/shared/hooks/useSEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Envelope, MapPin, Clock, ChatCircle } from "@phosphor-icons/react";
import { useToast } from "@/shared/hooks/use-toast";
import { z } from "zod";

const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

const WHATSAPP_NUMBER = "2348063363506";

const Contact = () => {
  useSEO({
    title: "Contact Us | M&H Eyewear",
    description: "Get in touch with M&H Eyewear. Questions about orders, appointments, or eyewear products? Call, email, or visit any of our branches.",
  });

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      toast({ title: "Validation Error", description: firstError || "Please check your inputs.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    // Send via mailto as a reliable fallback
    const { firstName, lastName, email, phone, subject, message } = parsed.data;
    const body = `Name: ${firstName} ${lastName}%0AEmail: ${email}%0APhone: ${phone || "N/A"}%0A%0A${encodeURIComponent(message)}`;
    const mailtoUrl = `mailto:info@soteriaeyeclinic.com?subject=${encodeURIComponent(subject)}&body=${body}`;

    window.open(mailtoUrl, "_blank");

    toast({
      title: "Message Ready",
      description: "Your email client has been opened with your message. If it didn't open, please email us directly at info@soteriaeyeclinic.com.",
    });

    setForm({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      detail: "08063363506",
      action: "tel:08063363506",
      color: "text-primary"
    },
    {
      icon: Envelope,
      title: "Email Us",
      detail: "info@soteriaeyeclinic.com",
      action: "mailto:info@soteriaeyeclinic.com",
      color: "text-primary"
    },
    {
      icon: ChatCircle,
      title: "WhatsApp",
      detail: "Chat with us now",
      action: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello, I'd like to make an enquiry.")}`,
      color: "text-accent"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      detail: "5 Locations Available",
      action: "/branches",
      color: "text-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-36 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're here to help with your eye care and eyewear needs
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              const isExternal = method.action.startsWith("http") || method.action.startsWith("tel:") || method.action.startsWith("mailto:");
              const Wrapper = isExternal ? "a" : "a";
              return (
                <Card key={index} className="hover:shadow-lg transition-all cursor-pointer">
                  <Wrapper href={method.action} target={method.action.startsWith("http") ? "_blank" : undefined} rel={method.action.startsWith("http") ? "noopener noreferrer" : undefined}>
                    <CardContent className="p-6 text-center space-y-3">
                      <div className="inline-flex p-3 rounded-full bg-secondary">
                        <Icon weight="duotone" className={`h-6 w-6 ${method.color}`} />
                      </div>
                      <h3 className="font-semibold text-foreground">{method.title}</h3>
                      <p className="text-sm text-muted-foreground">{method.detail}</p>
                    </CardContent>
                  </Wrapper>
                </Card>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                  Send Us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" value={form.firstName} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input id="phone" type="tel" placeholder="08012345678" value={form.phone} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help you?" value={form.subject} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Button variant="hero" className="w-full" size="lg" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info & Hours */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                      General Information
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Whether you have questions about our services, need help scheduling an appointment, 
                      or want to learn more about our eyewear collection, we're here to assist you.
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-start gap-3">
                      <Clock weight="duotone" className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground mb-1">Office Hours</p>
                        <p className="text-sm text-muted-foreground">Monday – Saturday: 9:00am – 6:00pm</p>
                        <p className="text-sm text-muted-foreground">Sunday: Closed</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone weight="duotone" className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground mb-1">Phone Support</p>
                        <p className="text-sm text-muted-foreground">Available during office hours</p>
                        <a 
                          href="tel:08063363506" 
                          className="text-sm text-primary hover:underline"
                        >
                          08063363506
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Envelope weight="duotone" className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground mb-1">Email Response</p>
                        <p className="text-sm text-muted-foreground">We respond within 24 hours</p>
                        <a 
                          href="mailto:info@soteriaeyeclinic.com" 
                          className="text-sm text-primary hover:underline"
                        >
                          info@soteriaeyeclinic.com
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-gold">
                <CardContent className="p-8 text-center space-y-4">
                  <h3 className="text-2xl font-display font-bold text-accent-foreground">
                    Emergency Eye Care
                  </h3>
                  <p className="text-accent-foreground/90">
                    For urgent eye care needs, please call us immediately or visit the nearest emergency room.
                  </p>
                  <Button variant="secondary" size="lg" asChild>
                    <a href="tel:08063363506">
                      Call Now: 08063363506
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
