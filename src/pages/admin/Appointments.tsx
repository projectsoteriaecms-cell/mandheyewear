import { useState } from "react";
import { AdminLayout, RoleGuard } from "@/shared/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Search,
  Building2,
  Clock,
  User,
  Filter,
  CalendarCheck,
  CalendarX,
  CalendarClock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
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

const AdminAppointments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");

  // Fetch all appointments with branch and profile info
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          branch:branches(id, name, city),
          profile:profiles!appointments_user_id_fkey(full_name, email)
        `)
        .order("scheduled_date", { ascending: false })
        .order("scheduled_time", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch branches for filter dropdown
  const { data: branches = [] } = useQuery({
    queryKey: ["branches-for-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("id, name, city")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    const profile = apt.profile as any;
    const matchesSearch =
      (profile?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (profile?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.service_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    const matchesBranch = branchFilter === "all" || apt.branch_id === branchFilter;
    return matchesSearch && matchesStatus && matchesBranch;
  });

  // Calculate stats
  const todayCount = appointments.filter((apt) => {
    try {
      return isToday(parseISO(apt.scheduled_date));
    } catch {
      return false;
    }
  }).length;

  const upcomingCount = appointments.filter((apt) => {
    try {
      const date = parseISO(apt.scheduled_date);
      return !isPast(date) || isToday(date);
    } catch {
      return false;
    }
  }).length;

  const completedCount = appointments.filter((apt) => apt.status === "completed").length;

  const getDateLabel = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return "Today";
      if (isTomorrow(date)) return "Tomorrow";
      return format(date, "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <RoleGuard allowedRoles={["branch_staff", "branch_manager", "super_admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Appointment History</h1>
              <p className="text-muted-foreground">
                View all appointments across all branches
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CalendarClock className="h-4 w-4" />
                  Today's Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{todayCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{upcomingCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{completedCount}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name, email, or service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="w-[200px]">
                    <Building2 className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="checked_in">Checked In</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Appointments Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                All Appointments ({filteredAppointments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredAppointments.length === 0 ? (
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
                      {filteredAppointments.map((apt) => {
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
                                  <p className="font-medium">
                                    {profile?.full_name || "Unknown Patient"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {profile?.email || "No email"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{apt.service_type}</span>
                              {apt.duration_minutes && (
                                <p className="text-xs text-muted-foreground">
                                  {apt.duration_minutes} mins
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{getDateLabel(apt.scheduled_date)}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {apt.scheduled_time}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="gap-1">
                                <Building2 className="h-3 w-3" />
                                {branch?.name || "Unknown Branch"}
                              </Badge>
                              {branch?.city && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {branch.city}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusVariants[apt.status]}>
                                {statusLabels[apt.status]}
                              </Badge>
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
        </div>
      </AdminLayout>
    </RoleGuard>
  );
};

export default AdminAppointments;
