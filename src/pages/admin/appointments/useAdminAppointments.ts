import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isToday, isPast, parseISO } from "date-fns";

export const useAdminAppointments = () => {
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

  const todayCount = appointments.filter((apt) => {
    try { return isToday(parseISO(apt.scheduled_date)); } catch { return false; }
  }).length;

  const upcomingCount = appointments.filter((apt) => {
    try { const date = parseISO(apt.scheduled_date); return !isPast(date) || isToday(date); } catch { return false; }
  }).length;

  const completedCount = appointments.filter((apt) => apt.status === "completed").length;

  return { appointments, isLoading, branches, todayCount, upcomingCount, completedCount };
};
