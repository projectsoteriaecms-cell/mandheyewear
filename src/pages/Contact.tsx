import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";

const Contact = () => {
  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      detail: "+1 (234) 567-890",
      action: "tel:+1234567890",
      color: "text-primary"
    },
    {
      icon: Mail,
      title: "Email Us",
      detail: "info@soteria-mh.com",
      action: "mailto:info@soteria-mh.com",
      color: "text-primary"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      detail: "Available 9 AM - 6 PM",
      action: "#",
      color: "text-accent"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      detail: "3 Locations Available",
      action: "/branches",
      color: "text-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
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
              return (
                <Card key={index} className="hover:shadow-lg transition-all cursor-pointer">
                  <a href={method.action}>
                    <CardContent className="p-6 text-center space-y-3">
                      <div className="inline-flex p-3 rounded-full bg-secondary">
                        <Icon className={`h-6 w-6 ${method.color}`} />
                      </div>
                      <h3 className="font-semibold text-foreground">{method.title}</h3>
                      <p className="text-sm text-muted-foreground">{method.detail}</p>
                    </CardContent>
                  </a>
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
                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input id="phone" type="tel" placeholder="+1 (234) 567-890" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help you?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                    />
                  </div>
                  <Button variant="hero" className="w-full" size="lg">
                    Send Message
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
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground mb-1">Office Hours</p>
                        <p className="text-sm text-muted-foreground">Monday - Friday: 8:00 AM - 6:00 PM</p>
                        <p className="text-sm text-muted-foreground">Saturday: 9:00 AM - 4:00 PM</p>
                        <p className="text-sm text-muted-foreground">Sunday: Closed</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground mb-1">Phone Support</p>
                        <p className="text-sm text-muted-foreground">Available during office hours</p>
                        <a 
                          href="tel:+1234567890" 
                          className="text-sm text-primary hover:underline"
                        >
                          +1 (234) 567-890
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground mb-1">Email Response</p>
                        <p className="text-sm text-muted-foreground">We respond within 24 hours</p>
                        <a 
                          href="mailto:info@soteria-mh.com" 
                          className="text-sm text-primary hover:underline"
                        >
                          info@soteria-mh.com
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
                  <Button variant="secondary" size="lg">
                    Emergency Contact
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
