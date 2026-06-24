import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type TemplateType = "welcome" | "promotion" | "appointment" | "campaign";

interface TemplateFormProps {
  templateType: TemplateType;
  onSubmit: (data: Record<string, string>) => Promise<void>;
  isLoading: boolean;
}

// Welcome Email Form
function WelcomeEmailForm({ onSubmit, isLoading }: Omit<TemplateFormProps, "templateType">) {
  const [formData, setFormData] = useState({
    recipient_email: "",
    recipient_name: "",
    welcome_message: "",
    first_time_discount: "",
    booking_link: "https://mandheyewear.com/book",
    shop_link: "https://mandheyewear.com/shop",
  });

  const handleSubmit = async () => {
    if (!formData.recipient_email || !formData.recipient_name || !formData.booking_link) {
      toast.error("Please fill in required fields (email, name, booking link)");
      return;
    }
    await onSubmit(formData);
    setFormData({
      recipient_email: "",
      recipient_name: "",
      welcome_message: "",
      first_time_discount: "",
      booking_link: "https://mandheyewear.com/book",
      shop_link: "https://mandheyewear.com/shop",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Recipient Email *</label>
        <Input
          type="email"
          placeholder="customer@example.com"
          value={formData.recipient_email}
          onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Recipient Name *</label>
        <Input
          placeholder="John Doe"
          value={formData.recipient_name}
          onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Welcome Message (optional)</label>
        <Textarea
          placeholder="Custom welcome message..."
          value={formData.welcome_message}
          onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
          disabled={isLoading}
          rows={3}
        />
      </div>
      <div>
        <label className="text-sm font-medium">First Time Discount % (optional)</label>
        <Input
          placeholder="e.g., 15"
          value={formData.first_time_discount}
          onChange={(e) => setFormData({ ...formData, first_time_discount: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Booking Link *</label>
        <Input
          placeholder="https://mandheyewear.com/book"
          value={formData.booking_link}
          onChange={(e) => setFormData({ ...formData, booking_link: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Shop Link (optional)</label>
        <Input
          placeholder="https://mandheyewear.com/shop"
          value={formData.shop_link}
          onChange={(e) => setFormData({ ...formData, shop_link: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send Welcome Email
      </Button>
    </div>
  );
}

// Promotion Email Form
function PromotionEmailForm({ onSubmit, isLoading }: Omit<TemplateFormProps, "templateType">) {
  const [formData, setFormData] = useState({
    recipient_email: "",
    recipient_name: "",
    promotion_title: "Summer Sale",
    promotion_description: "Get amazing discounts on premium designer frames",
    discount_percentage: "20",
    offer_code: "SUMMER20",
    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    cta_link: "https://mandheyewear.com/shop",
    cta_text: "Shop Now",
  });

  const handleSubmit = async () => {
    if (!formData.recipient_email || !formData.promotion_title || !formData.cta_link) {
      toast.error("Please fill in required fields");
      return;
    }
    await onSubmit(formData);
    setFormData({
      recipient_email: "",
      recipient_name: "",
      promotion_title: "Summer Sale",
      promotion_description: "Get amazing discounts on premium designer frames",
      discount_percentage: "20",
      offer_code: "SUMMER20",
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      cta_link: "https://mandheyewear.com/shop",
      cta_text: "Shop Now",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Recipient Email *</label>
        <Input
          type="email"
          placeholder="customer@example.com"
          value={formData.recipient_email}
          onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Recipient Name (optional)</label>
        <Input
          placeholder="John Doe"
          value={formData.recipient_name}
          onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Promotion Title *</label>
        <Input
          placeholder="e.g., Summer Sale"
          value={formData.promotion_title}
          onChange={(e) => setFormData({ ...formData, promotion_title: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description *</label>
        <Textarea
          placeholder="Describe your promotion..."
          value={formData.promotion_description}
          onChange={(e) => setFormData({ ...formData, promotion_description: e.target.value })}
          disabled={isLoading}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-sm font-medium">Discount % (optional)</label>
          <Input
            placeholder="e.g., 20"
            value={formData.discount_percentage}
            onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Offer Code (optional)</label>
          <Input
            placeholder="e.g., SUMMER20"
            value={formData.offer_code}
            onChange={(e) => setFormData({ ...formData, offer_code: e.target.value })}
            disabled={isLoading}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Valid Until *</label>
        <Input
          type="date"
          value={formData.valid_until}
          onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="text-sm font-medium">CTA Link *</label>
        <Input
          placeholder="https://mandheyewear.com/shop"
          value={formData.cta_link}
          onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="text-sm font-medium">CTA Text (optional)</label>
        <Input
          placeholder="e.g., Shop Now"
          value={formData.cta_text}
          onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send Promotion Email
      </Button>
    </div>
  );
}

// Appointment Reminder Form
function AppointmentReminderForm({ onSubmit, isLoading }: Omit<TemplateFormProps, "templateType">) {
  const [formData, setFormData] = useState({
    recipient_email: "",
    recipient_name: "",
    appointment_date: "",
    appointment_time: "",
    service_type: "Eye Exam",
    practitioner_name: "",
    location: "M&H Eyewear Main Branch",
    confirm_link: "https://mandheyewear.com/confirm",
    reschedule_link: "https://mandheyewear.com/reschedule",
  });

  const handleSubmit = async () => {
    if (!formData.recipient_email || !formData.recipient_name || !formData.appointment_date || !formData.appointment_time) {
      toast.error("Please fill in required fields");
      return;
    }
    await onSubmit(formData);
    setFormData({
      recipient_email: "",
      recipient_name: "",
      appointment_date: "",
      appointment_time: "",
      service_type: "Eye Exam",
      practitioner_name: "",
      location: "M&H Eyewear Main Branch",
      confirm_link: "https://mandheyewear.com/confirm",
      reschedule_link: "https://mandheyewear.com/reschedule",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Recipient Email *</label>
        <Input
          type="email"
          placeholder="customer@example.com"
          value={formData.recipient_email}
          onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Recipient Name *</label>
        <Input
          placeholder="John Doe"
          value={formData.recipient_name}
          onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-sm font-medium">Appointment Date *</label>
          <Input
            type="date"
            value={formData.appointment_date}
            onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Appointment Time *</label>
          <Input
            type="time"
            value={formData.appointment_time}
            onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
            disabled={isLoading}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Service Type *</label>
        <Input
          placeholder="e.g., Eye Exam"
          value={formData.service_type}
          onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Practitioner Name (optional)</label>
        <Input
          placeholder="e.g., Dr. Smith"
          value={formData.practitioner_name}
          onChange={(e) => setFormData({ ...formData, practitioner_name: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Location *</label>
        <Input
          placeholder="M&H Eyewear Main Branch"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Confirm Link *</label>
        <Input
          placeholder="https://mandheyewear.com/confirm"
          value={formData.confirm_link}
          onChange={(e) => setFormData({ ...formData, confirm_link: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Reschedule Link *</label>
        <Input
          placeholder="https://mandheyewear.com/reschedule"
          value={formData.reschedule_link}
          onChange={(e) => setFormData({ ...formData, reschedule_link: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send Appointment Reminder
      </Button>
    </div>
  );
}

// Campaign Test Email Form
function CampaignTestEmailForm({ onSubmit, isLoading }: Omit<TemplateFormProps, "templateType">) {
  const [formData, setFormData] = useState({
    campaign_name: "",
    test_email: "",
    subject_line: "",
  });

  const handleSubmit = async () => {
    if (!formData.campaign_name || !formData.test_email) {
      toast.error("Please fill in campaign name and test email");
      return;
    }
    await onSubmit(formData);
    setFormData({
      campaign_name: "",
      test_email: "",
      subject_line: "",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Campaign Name *</label>
        <Input
          placeholder="e.g., Summer Sale"
          value={formData.campaign_name}
          onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Test Email *</label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={formData.test_email}
          onChange={(e) => setFormData({ ...formData, test_email: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Subject Line (optional)</label>
        <Input
          placeholder="Email subject"
          value={formData.subject_line}
          onChange={(e) => setFormData({ ...formData, subject_line: e.target.value })}
          disabled={isLoading}
        />
      </div>
      <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send Campaign Test
      </Button>
    </div>
  );
}

// Main Tester Component
export function EmailTemplateTester() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("welcome");
  const [isLoading, setIsLoading] = useState(false);

  const sendTestEmail = async (data: Record<string, string>) => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      let endpoint = "";
      let body: Record<string, any> = {};

      switch (selectedTemplate) {
        case "welcome":
          endpoint = "send-welcome";
          body = {
            recipient_email: data.recipient_email,
            recipient_name: data.recipient_name,
            welcome_message: data.welcome_message || undefined,
            first_time_discount: data.first_time_discount || undefined,
            booking_link: data.booking_link,
            shop_link: data.shop_link || undefined,
          };
          break;
        case "promotion":
          endpoint = "send-promotion";
          body = {
            recipient_email: data.recipient_email,
            recipient_name: data.recipient_name || undefined,
            promotion_title: data.promotion_title,
            promotion_description: data.promotion_description,
            discount_percentage: data.discount_percentage || undefined,
            offer_code: data.offer_code || undefined,
            valid_until: data.valid_until,
            cta_link: data.cta_link,
            cta_text: data.cta_text || undefined,
          };
          break;
        case "appointment":
          endpoint = "send-appointment-reminder";
          body = {
            recipient_email: data.recipient_email,
            recipient_name: data.recipient_name,
            appointment_date: data.appointment_date,
            appointment_time: data.appointment_time,
            service_type: data.service_type,
            practitioner_name: data.practitioner_name || undefined,
            location: data.location,
            confirm_link: data.confirm_link,
            reschedule_link: data.reschedule_link,
          };
          break;
        case "campaign":
          endpoint = "send-test-email";
          body = {
            campaign_name: data.campaign_name,
            test_email: data.test_email,
            subject_line: data.subject_line || undefined,
          };
          break;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error || `Failed to send email (${res.status})`);
      }

      toast.success("Test email sent successfully! Check your inbox.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send test email";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
          <Mail className="h-5 w-5" />
          Email Template Tester
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Test M&H Eyewear email templates by sending samples to your inbox
        </p>

        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Select Template</label>
          <Select value={selectedTemplate} onValueChange={(v) => setSelectedTemplate(v as TemplateType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="welcome">Welcome Email</SelectItem>
              <SelectItem value="promotion">Promotion Email</SelectItem>
              <SelectItem value="appointment">Appointment Reminder</SelectItem>
              <SelectItem value="campaign">Campaign Test Email</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedTemplate === "welcome" && (
        <WelcomeEmailForm onSubmit={sendTestEmail} isLoading={isLoading} />
      )}
      {selectedTemplate === "promotion" && (
        <PromotionEmailForm onSubmit={sendTestEmail} isLoading={isLoading} />
      )}
      {selectedTemplate === "appointment" && (
        <AppointmentReminderForm onSubmit={sendTestEmail} isLoading={isLoading} />
      )}
      {selectedTemplate === "campaign" && (
        <CampaignTestEmailForm onSubmit={sendTestEmail} isLoading={isLoading} />
      )}
    </Card>
  );
}
