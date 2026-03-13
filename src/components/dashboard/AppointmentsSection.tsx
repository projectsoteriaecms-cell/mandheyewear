import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppointments, useCancelAppointment } from "@/modules/appointments/hooks/useAppointments";
import { Calendar, Clock, MapPin, Loader2, X } from "lucide-react";
import { format, isPast, isToday } from "date-fns";

const SERVICES: Record<string, string> = {
  comprehensive_eye_exam: "Comprehensive Eye Exam",
  contact_lens_fitting: "Contact Lens Fitting",
  pediatric_eye_exam: "Pediatric Eye Exam",
  diabetic_eye_screening: "Diabetic Eye Screening",
  glaucoma_testing: "Glaucoma Testing",
  specialty_consultation: "Specialty Consultation",
};

const formatTimeSlot = (time: string) => {
  const [hours] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${ampm}`;
};

const getStatusBadge = (status: string, scheduledDate: string) => {
  const date = new Date(scheduledDate);
  
  if (status === "cancelled") {
    return <Badge variant="destructive">Cancelled</Badge>;
  }
  if (status === "completed") {
    return <Badge variant="secondary">Completed</Badge>;
  }
  if (isPast(date) && !isToday(date)) {
    return <Badge variant="secondary">Past</Badge>;
  }
  if (isToday(date)) {
    return <Badge className="bg-green-500 hover:bg-green-600">Today</Badge>;
  }
  if (status === "confirmed") {
    return <Badge variant="default">Confirmed</Badge>;
  }
  return <Badge variant="outline">Scheduled</Badge>;
};

export const AppointmentsSection = () => {
  const { data: appointments, isLoading } = useAppointments();
  const cancelAppointment = useCancelAppointment();

  // Sort: upcoming first, then past
  const sortedAppointments = appointments?.slice().sort((a, b) => {
    const dateA = new Date(a.scheduled_date);
    const dateB = new Date(b.scheduled_date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const aIsPast = dateA < now;
    const bIsPast = dateB < now;

    if (aIsPast !== bIsPast) return aIsPast ? 1 : -1;
    return dateA.getTime() - dateB.getTime();
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            My Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          My Appointments ({appointments?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!sortedAppointments || sortedAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No appointments scheduled
            </p>
            <Button variant="hero" asChild>
              <Link to="/booking">Book an Appointment</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAppointments.map((appointment) => {
              const appointmentDate = new Date(appointment.scheduled_date);
              const canCancel =
                appointment.status !== "cancelled" &&
                appointment.status !== "completed" &&
                !isPast(appointmentDate);

              return (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">
                        {SERVICES[appointment.service_type] || appointment.service_type}
                      </p>
                      {getStatusBadge(appointment.status, appointment.scheduled_date)}
                    </div>
                    {canCancel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => cancelAppointment.mutate(appointment.id)}
                        disabled={cancelAppointment.isPending}
                      >
                        {cancelAppointment.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(appointmentDate, "EEEE, MMMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatTimeSlot(appointment.scheduled_time)}
                      {appointment.duration_minutes && (
                        <span>({appointment.duration_minutes} min)</span>
                      )}
                    </div>
                  </div>

                  {appointment.branch && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        {appointment.branch.name} — {appointment.branch.address},{" "}
                        {appointment.branch.city}
                      </span>
                    </div>
                  )}

                  {appointment.notes && (
                    <p className="text-sm text-muted-foreground bg-secondary/50 rounded p-2">
                      <span className="font-medium">Notes:</span> {appointment.notes}
                    </p>
                  )}
                </div>
              );
            })}

            <div className="pt-4 text-center">
              <Button variant="outline" asChild>
                <Link to="/booking">Book Another Appointment</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
