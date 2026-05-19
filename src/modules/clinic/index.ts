// Clinic module — hooks for Soteria clinical management
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ============= TYPES =============
export interface ClinicKpis {
  visits_today: number;
  checked_in: number;
  completed_today: number;
  no_shows_today: number;
  upcoming_7d: number;
  open_encounters: number;
  pending_claims: number;
  claims_outstanding_amount: number;
  recalls_due: number;
  active_patients_30d: number;
  lapsed_patients: number;
}

// ============= KPIs =============
export const useClinicKpis = () => {
  return useQuery({
    queryKey: ["clinic-kpis"],
    queryFn: async (): Promise<ClinicKpis> => {
      const { data, error } = await supabase.rpc("clinic_kpis");
      if (error) throw error;
      return data as unknown as ClinicKpis;
    },
    staleTime: 60_000,
  });
};

// ============= PATIENTS =============
export const usePatients = (search?: string) => {
  return useQuery({
    queryKey: ["clinic-patients", search],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (search && search.length > 1) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone_number.ilike.%${search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const usePatient = (userId?: string) => {
  return useQuery({
    queryKey: ["clinic-patient", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
};

export const usePatientHistory = (userId?: string) => {
  return useQuery({
    queryKey: ["clinic-patient-history", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [appts, encs, rxs, claims] = await Promise.all([
        supabase.from("appointments").select("*, branch:branches(name)").eq("user_id", userId!).order("scheduled_date", { ascending: false }),
        supabase.from("clinical_encounters").select("*").eq("user_id", userId!).order("created_at", { ascending: false }),
        supabase.from("prescriptions").select("*").eq("user_id", userId!).order("issue_date", { ascending: false }),
        supabase.from("insurance_claims").select("*, hmo:hmo_providers(name)").eq("user_id", userId!).order("created_at", { ascending: false }),
      ]);
      return {
        appointments: appts.data ?? [],
        encounters: encs.data ?? [],
        prescriptions: rxs.data ?? [],
        claims: claims.data ?? [],
      };
    },
  });
};

// ============= ENCOUNTERS =============
export const useEncounters = (status?: string) => {
  return useQuery({
    queryKey: ["clinic-encounters", status ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("clinical_encounters")
        .select("*, doctor:doctors(full_name), patient:profiles!clinical_encounters_user_id_fkey(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (status && status !== "all") q = q.eq("status", status as any);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
};

export const useEncounter = (id?: string) => {
  return useQuery({
    queryKey: ["clinic-encounter", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinical_encounters")
        .select("*, doctor:doctors(full_name, license_number), patient:profiles!clinical_encounters_user_id_fkey(*)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
};

export const useSaveEncounter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { id, ...rest } = payload;
      if (id) {
        const { data, error } = await supabase.from("clinical_encounters").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("clinical_encounters").insert({ ...rest, created_by: u.user?.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clinic-encounters"] });
      qc.invalidateQueries({ queryKey: ["clinic-kpis"] });
      toast.success("Encounter saved");
    },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });
};

// ============= DOCTORS =============
export const useDoctors = () => {
  return useQuery({
    queryKey: ["clinic-doctors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("doctors").select("*").order("full_name");
      if (error) throw error;
      return data;
    },
  });
};

// ============= HMO PROVIDERS =============
export const useHmoProviders = () => {
  return useQuery({
    queryKey: ["hmo-providers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("hmo_providers").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
};

export const useSaveHmoProvider = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { id, ...rest } = payload;
      if (id) {
        const { data, error } = await supabase.from("hmo_providers").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("hmo_providers").insert(rest).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hmo-providers"] });
      toast.success("HMO provider saved");
    },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });
};

// ============= CLAIMS =============
export const useClaims = (status?: string) => {
  return useQuery({
    queryKey: ["clinic-claims", status ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("insurance_claims")
        .select("*, hmo:hmo_providers(name, short_code), patient:profiles!insurance_claims_user_id_fkey(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (status && status !== "all") q = q.eq("status", status as any);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateClaimStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === "submitted") updates.submitted_at = new Date().toISOString();
      if (status === "paid") updates.paid_at = new Date().toISOString();
      const { error } = await supabase.from("insurance_claims").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clinic-claims"] });
      qc.invalidateQueries({ queryKey: ["clinic-kpis"] });
      toast.success("Claim updated");
    },
    onError: (e: any) => toast.error(e.message ?? "Update failed"),
  });
};

// ============= RECALLS =============
export const useRecalls = (status?: string) => {
  return useQuery({
    queryKey: ["clinic-recalls", status ?? "pending"],
    queryFn: async () => {
      let q = supabase
        .from("patient_recalls")
        .select("*, patient:profiles!patient_recalls_user_id_fkey(full_name, email, phone_number)")
        .order("due_date", { ascending: true })
        .limit(200);
      if (status && status !== "all") q = q.eq("status", status as any);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
};

export const useMarkRecallSent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("patient_recalls")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clinic-recalls"] }),
  });
};

// ============= APPOINTMENT BOARD =============
export const useTodaysAppointments = () => {
  return useQuery({
    queryKey: ["appointments-today"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("appointments")
        .select("*, branch:branches(name), patient:profiles!appointments_user_id_fkey(full_name, email, phone_number)")
        .eq("scheduled_date", today)
        .order("scheduled_time");
      if (error) throw error;
      return data;
    },
    refetchInterval: 30_000,
  });
};

export const useUpdateAppointmentStage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: "checked_in" | "in_room" | "completed" | "no_show" }) => {
      const updates: any = {};
      const now = new Date().toISOString();
      if (stage === "checked_in") { updates.checked_in_at = now; updates.status = "checked_in"; }
      if (stage === "in_room") { updates.in_room_at = now; updates.status = "in_progress"; }
      if (stage === "completed") { updates.completed_at = now; updates.status = "completed"; }
      if (stage === "no_show") { updates.no_show = true; updates.status = "no_show"; }
      const { error } = await supabase.from("appointments").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments-today"] });
      qc.invalidateQueries({ queryKey: ["clinic-kpis"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Update failed"),
  });
};
