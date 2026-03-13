import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, CalendarCheck, Calendar } from "lucide-react";

interface AppointmentStatsProps {
  todayCount: number;
  upcomingCount: number;
  completedCount: number;
}

export const AppointmentStats = ({ todayCount, upcomingCount, completedCount }: AppointmentStatsProps) => (
  <div className="grid gap-4 md:grid-cols-3">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <CalendarClock className="h-4 w-4" />
          Today's Appointments
        </CardTitle>
      </CardHeader>
      <CardContent><p className="text-2xl font-bold">{todayCount}</p></CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <CalendarCheck className="h-4 w-4" />
          Upcoming
        </CardTitle>
      </CardHeader>
      <CardContent><p className="text-2xl font-bold">{upcomingCount}</p></CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Completed
        </CardTitle>
      </CardHeader>
      <CardContent><p className="text-2xl font-bold">{completedCount}</p></CardContent>
    </Card>
  </div>
);
