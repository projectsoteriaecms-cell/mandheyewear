import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";

const Booking = () => {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date>();
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const branches = [
    "Soteria Eye Clinic – Lagos (Lekki)",
    "Soteria Eye Clinic – Warri (Head Office)",
    "Soteria Eye Clinic – Effurun (Delta Mall)",
    "Soteria Eye Clinic – Uyo (Tropicana Mall)"
  ];

  const services = [
    "Comprehensive Eye Exam",
    "Contact Lens Fitting",
    "Pediatric Eye Exam",
    "Diabetic Eye Screening",
    "Glaucoma Testing",
    "Specialty Consultation"
  ];

  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM"
  ];

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // Mock submission
    setStep(5);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
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

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-display">
                {step === 1 && "Select Branch"}
                {step === 2 && "Choose Service"}
                {step === 3 && "Pick Date & Time"}
                {step === 4 && "Your Details"}
                {step === 5 && "Confirmation"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Select Branch */}
              {step === 1 && (
                <div className="space-y-4">
                  <Label htmlFor="branch">Select a branch location</Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="Choose your preferred location" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid gap-3 mt-4">
                    {branches.map((branch) => (
                      <Card
                        key={branch}
                        className={`cursor-pointer transition-all ${
                          selectedBranch === branch
                            ? "border-primary border-2"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedBranch(branch)}
                      >
                        <CardContent className="p-4">
                          <p className="font-medium">{branch}</p>
                          <p className="text-sm text-muted-foreground">Nigeria</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Choose Service */}
              {step === 2 && (
                <div className="space-y-4">
                  <Label htmlFor="service">What service do you need?</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger id="service">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid gap-3 mt-4">
                    {services.map((service) => (
                      <Card
                        key={service}
                        className={`cursor-pointer transition-all ${
                          selectedService === service
                            ? "border-primary border-2"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedService(service)}
                      >
                        <CardContent className="p-4">
                          <p className="font-medium">{service}</p>
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
                      disabled={(date) =>
                        date < new Date() || date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                    />
                  </div>
                  {date && (
                    <div>
                      <Label className="mb-2 block">Available time slots</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            onClick={() => setSelectedTime(time)}
                            className="w-full"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: User Details */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="08012345678" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Input id="notes" placeholder="Any specific concerns or requests?" />
                  </div>
                </div>
              )}

              {/* Step 5: Confirmation */}
              {step === 5 && (
                <div className="text-center space-y-6 py-8">
                  <div className="inline-flex p-4 rounded-full bg-primary/10">
                    <CheckCircle className="h-16 w-16 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                      Appointment Confirmed!
                    </h3>
                    <p className="text-muted-foreground">
                      We've sent a confirmation email with all the details
                    </p>
                  </div>
                  <Card className="bg-muted/50">
                    <CardContent className="p-6 space-y-3 text-left">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Branch:</span>
                        <span className="font-medium">{selectedBranch}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service:</span>
                        <span className="font-medium">{selectedService}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">{date?.toDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Button variant="hero" size="lg" onClick={() => (window.location.href = "/")}>
                    Back to Home
                  </Button>
                </div>
              )}

              {/* Navigation Buttons */}
              {step < 5 && (
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={step === 1}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  {step === 4 ? (
                    <Button variant="hero" onClick={handleSubmit}>
                      Confirm Booking
                    </Button>
                  ) : (
                    <Button
                      variant="hero"
                      onClick={handleNext}
                      disabled={
                        (step === 1 && !selectedBranch) ||
                        (step === 2 && !selectedService) ||
                        (step === 3 && (!date || !selectedTime))
                      }
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
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
