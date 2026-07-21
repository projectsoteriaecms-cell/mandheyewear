import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/modules/auth";
import { useToast } from "@/shared/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Appointment = Tables<"appointments"> & {
  branch?: Tables<"branches"> | null;
};

export const useAppointments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          branch:branches (*)
        `)
        .eq("user_id", user.id)
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true });

      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!user,
  });
};

export const useCreateAppointment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      appointmentData: Omit<TablesInsert<"appointments">, "user_id">
    ) => {
      if (!user) throw new Error("Must be logged in to book an appointment");

      const { data, error } = await supabase
        .from("appointments")
        .insert({
          ...appointmentData,
          user_id: user.id,
        })
        .select(`
          *,
          branch:branches (*)
        `)
        .single();

      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", user?.id] });
      toast({
        title: "Appointment Booked!",
        description: "Your appointment has been confirmed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book appointment.",
        variant: "destructive",
      });
    },
  });
};

export const useCancelAppointment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", user?.id] });
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel appointment.",
        variant: "destructive",
      });
    },
  });
};