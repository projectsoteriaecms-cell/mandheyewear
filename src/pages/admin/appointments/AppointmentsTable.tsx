import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Clock, User, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type AppointmentStatus = Database["public"]["Enums"]["appointment_status"];

const statusLabels: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

const statusVariants: Record<AppointmentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "outline",
  confirmed: "secondary",
  checked_in: "default",
  in_progress: "default",
  completed: "secondary",
  cancelled: "destructive",
  no_show: "destructive",
};

const getDateLabel = (dateStr: string) => {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d, yyyy");
  } catch { return dateStr; }
};

interface AppointmentsTableProps {
  appointments: any[];
  isLoading: boolean;
}

export const AppointmentsTable = ({ appointments, isLoading }: AppointmentsTableProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        All Appointments ({appointments.length})
      </CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No appointments found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((apt) => {
                const profile = apt.profile as any;
                const branch = apt.branch as any;
                return (
                  <TableRow key={apt.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{profile?.full_name || "Unknown Patient"}</p>
                          <p className="text-xs text-muted-foreground">{profile?.email || "No email"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{apt.service_type}</span>
                      {apt.duration_minutes && (
                        <p className="text-xs text-muted-foreground">{apt.duration_minutes} mins</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{getDateLabel(apt.scheduled_date)}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />{apt.scheduled_time}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Building2 className="h-3 w-3" />{branch?.name || "Unknown Branch"}
                      </Badge>
                      {branch?.city && <p className="text-xs text-muted-foreground mt-1">{branch.city}</p>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[apt.status]}>{statusLabels[apt.status]}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </CardContent>
  </Card>
);
