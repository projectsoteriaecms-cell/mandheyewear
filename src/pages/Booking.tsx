import { useState } from "react";
import { useSEO } from "@/shared/hooks/useSEO";
import { useNavigate, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Loader2,
  LogIn,
  Clock,
} from "lucide-react";
import { useBranches } from "@/modules/branches/hooks/useBranches";
import { useCreateAppointment, type Appointment } from "@/modules/appointments/hooks/useAppointments";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useProfile } from "@/modules/personalization/hooks/useProfile";
import { useUserRole } from "@/modules/auth/hooks/useUserRole";
import { useMetaPixel } from "@/shared/hooks/useMetaPixel";
import { canBookAppointments } from "@/shared/lib/permissions";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { DataProtectionConsent } from "@/components/legal/DataProtectionConsent";
import { BookingAuthPanel } from "@/components/auth/BookingAuthPanel";
import { useToast } from "@/shared/hooks/use-toast";
import { WhatsappLogo } from "@phosphor-icons/react";
import { buildBookingWhatsAppUrl } from "@/shared/lib/whatsappBooking";

const SERVICES = [
  { value: "comprehensive_eye_exam", label: "Comprehensive Eye Exam", duration: 45 },
  { value: "contact_lens_fitting", label: "Contact Lens Fitting", duration: 30 },
  { value: "pediatric_eye_exam", label: "Pediatric Eye Exam", duration: 45 },
  { value: "diabetic_eye_screening", label: "Diabetic Eye Screening", duration: 30 },
  { value: "glaucoma_testing", label: "Glaucoma Testing", duration: 30 },
  { value: "specialty_consultation", label: "Specialty Consultation", duration: 60 },
];

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

const formatTimeSlot = (time: string) => {
  const [hours] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${ampm}`;
};

const Booking = () => {
  useSEO({
    title: "Book an Eye Exam | M&H Eyewear Nigeria",
    description: "Schedule your eye exam at any M&H branch. Professional optometry services across Nigeria. Book online in minutes.",
  });

  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: role, isLoading: roleLoading } = useUserRole();
  const { data: branches, isLoading: branchesLoading } = useBranches();
  const createAppointment = useCreateAppointment();
  const { trackSchedule } = useMetaPixel();

  const [step, setStep] = useState(1);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [dataConsent, setDataConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [consentError, setConsentError] = useState("");
  const { toast } = useToast();

  const selectedBranch = branches?.find((b) => b.id === selectedBranchId);
  const selectedServiceData = SERVICES.find((s) => s.value === selectedService);

  // Check if user can book appointments
  const userCanBook = canBookAppointments(role ?? null);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!date || !selectedTime || !selectedBranchId || !selectedService) return;
    if (!dataConsent) {
      setConsentError("Please consent to data processing to confirm your booking.");
      toast({
        title: "Consent Required",
        description: "We need your consent to process your booking under the Nigeria Data Protection Act.",
        variant: "destructive",
      });
      return;
    }
    setConsentError("");

    const appointment = await createAppointment.mutateAsync({
      branch_id: selectedBranchId,
      service_type: selectedService,
      scheduled_date: format(date, "yyyy-MM-dd"),
      scheduled_time: selectedTime,
      duration_minutes: selectedServiceData?.duration || 30,
      notes: notes || null,
    });

    // Send confirmation email (fire and forget - don't block the UI)
    const emailAddress = profile?.email || user?.email;
    if (emailAddress && appointment.branch) {
      supabase.functions.invoke("send-appointment-confirmation", {
        body: {
          email: emailAddress,
          patientName: profile?.full_name || "Valued Patient",
          serviceType: selectedService,
          scheduledDate: format(date, "yyyy-MM-dd"),
          scheduledTime: selectedTime,
          branchName: appointment.branch.name,
          branchAddress: appointment.branch.address,
          branchCity: appointment.branch.city,
          notes: notes || undefined,
        },
      }).catch((err) => console.error("Email notification failed:", err));
    }

    // Track Schedule event for Meta Pixel
    trackSchedule({
      content_category: selectedService,
      content_name: selectedBranch?.name,
    });

    setConfirmedAppointment(appointment);
    setStep(5);
  };

  // Loading state
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-36 pb-16 px-4 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  // Not authenticated - show inline sign in / sign up
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-56 sm:pt-60 lg:pt-52 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <LogIn className="h-10 w-10 mx-auto text-primary mb-3" />
              <h1 className="text-2xl font-bold mb-2">Sign in or Create an Account to Book</h1>
              <p className="text-muted-foreground text-sm">
                New here? Switch to <span className="font-medium text-foreground">Create Account</span> below to register in seconds.
              </p>
            </div>
            <BookingAuthPanel />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // User not verified - cannot book
  if (!userCanBook) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-36 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <div className="p-8 rounded-2xl bg-card border border-amber-200 dark:border-amber-900 shadow-float">
              <Clock className="h-16 w-16 mx-auto text-amber-500 mb-4" />
              <h1 className="text-2xl font-display font-semibold mb-2">Account Verification Required</h1>
              <p className="text-muted-foreground mb-6">
                Your account is pending verification. Once verified, you'll be able to book appointments at any of our locations.
              </p>
              <div className="space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/branches">View Our Locations</Link>
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/dashboard">View Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-36 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display font-bold text-foreground mb-4">
              Book Your Appointment
            </h1>
            <p className="text-muted-foreground">
              Schedule your visit in just a few simple steps
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      step > s ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* WhatsApp shortcut */}
          <div className="mb-6 flex justify-center">
            <a
              href={buildBookingWhatsAppUrl({
                branchName: selectedBranch?.name,
                serviceLabel: selectedServiceData?.label,
                dateLabel: date ? format(date, "EEEE, MMMM d, yyyy") : undefined,
                timeLabel: selectedTime ? formatTimeSlot(selectedTime) : undefined,
                notes: notes || undefined,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-2 text-sm font-medium text-foreground hover:bg-[#25D366]/20 transition-colors"
            >
              <WhatsappLogo weight="fill" className="h-4 w-4 text-[#25D366]" />
              Prefer WhatsApp? Chat to book directly →
            </a>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-display">
                {step === 1 && "Select Branch"}
                {step === 2 && "Choose Service"}
                {step === 3 && "Pick Date & Time"}
                {step === 4 && "Review & Confirm"}
                {step === 5 && "Confirmation"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Select Branch */}
              {step === 1 && (
                <div className="space-y-4">
                  <Label>Select a branch location</Label>
                  {branchesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {branches?.map((branch) => (
                        <Card
                          key={branch.id}
                          className={`cursor-pointer transition-all ${
                            selectedBranchId === branch.id
                              ? "border-primary border-2 bg-primary/5"
                              : "hover:border-primary/50"
                          }`}
                          onClick={() => setSelectedBranchId(branch.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium">
                                  {branch.name}
                                  {branch.is_head_office && (
                                    <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded">
                                      Head Office
                                    </span>
                                  )}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {branch.address}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {branch.city}, {branch.state}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Choose Service */}
              {step === 2 && (
                <div className="space-y-4">
                  <Label>What service do you need?</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICES.map((service) => (
                        <SelectItem key={service.value} value={service.value}>
                          {service.label} ({service.duration} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid gap-3 mt-4">
                    {SERVICES.map((service) => (
                      <Card
                        key={service.value}
                        className={`cursor-pointer transition-all ${
                          selectedService === service.value
                            ? "border-primary border-2 bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedService(service.value)}
                      >
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{service.label}</p>
                            <p className="text-sm text-muted-foreground">
                              Duration: {service.duration} minutes
                            </p>
                          </div>
                          {selectedService === service.value && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Pick Date & Time */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label className="mb-2 block">Select a date</Label>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border pointer-events-auto mx-auto"
                      disabled={(d) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        // Disable past dates and Sundays
                        return d < today || d.getDay() === 0;
                      }}
                    />
                  </div>
                  {date && (
                    <div>
                      <Label className="mb-2 block">Available time slots</Label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {TIME_SLOTS.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            onClick={() => setSelectedTime(time)}
                            className="w-full"
                          >
                            {formatTimeSlot(time)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Review & Confirm */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold">Booking Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Branch:</span>
                        <span className="font-medium text-right">
                          {selectedBranch?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service:</span>
                        <span className="font-medium">
                          {selectedServiceData?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">
                          {date && format(date, "EEEE, MMMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium">
                          {formatTimeSlot(selectedTime)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">
                          {selectedServiceData?.duration} minutes
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold">Patient Information</h3>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-muted-foreground">Name: </span>
                        {profile?.full_name || "Not provided"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Email: </span>
                        {profile?.email || user?.email}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Phone: </span>
                        {profile?.phone_number || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any specific concerns, allergies, or requests?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="resize-none"
                      maxLength={500}
                    />
                  </div>

                  <DataProtectionConsent
                    consent={dataConsent}
                    onConsentChange={(v) => {
                      setDataConsent(v);
                      if (v) setConsentError("");
                    }}
                    marketing={marketingConsent}
                    onMarketingChange={setMarketingConsent}
                    error={consentError}
                    idPrefix="booking"
                  />
                </div>
              )}

              {/* Step 5: Confirmation */}
              {step === 5 && confirmedAppointment && (
                <div className="text-center space-y-6 py-8">
                  <div className="inline-flex p-4 rounded-full bg-primary/10">
                    <CheckCircle className="h-16 w-16 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                      Appointment Confirmed!
                    </h3>
                    <p className="text-muted-foreground">
                      A confirmation email has been sent to your email address
                    </p>
                  </div>
                  <Card className="bg-muted/50">
                    <CardContent className="p-6 space-y-3 text-left">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Branch:</span>
                        <span className="font-medium text-right">
                          {confirmedAppointment.branch?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">
                          {format(new Date(confirmedAppointment.scheduled_date), "EEEE, MMMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium">
                          {formatTimeSlot(confirmedAppointment.scheduled_time)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="outline" asChild>
                      <Link to="/dashboard?tab=appointments">View My Appointments</Link>
                    </Button>
                    <Button variant="hero" asChild>
                      <Link to="/">Back to Home</Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {step < 5 && (
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={step === 1 ? () => navigate(-1) : handleBack}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {step === 1 ? "Cancel" : "Back"}
                  </Button>
                  {step < 4 ? (
                    <Button
                      onClick={handleNext}
                      disabled={
                        (step === 1 && !selectedBranchId) ||
                        (step === 2 && !selectedService) ||
                        (step === 3 && (!date || !selectedTime))
                      }
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="hero"
                      onClick={handleSubmit}
                      disabled={createAppointment.isPending}
                    >
                      {createAppointment.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        "Confirm Booking"
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Booking;
