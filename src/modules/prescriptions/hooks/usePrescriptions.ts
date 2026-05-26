import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { toast } from "sonner";
import { differenceInMonths, parseISO } from "date-fns";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface EyeData {
  sph:     number | null;
  cyl:     number | null;
  axis:    number | null;
  add:     number | null;
  prism_h: number | null;
  prism_v: number | null;
}

export interface Prescription {
  id:              string;
  user_id:         string;
  issued_date:     string | null;
  expiry_date:     string | null;
  prescriber_name: string | null;
  clinic_name:     string | null;
  right_eye:       EyeData | null;
  left_eye:        EyeData | null;
  pd_distance:     number | null;
  pd_near:         number | null;
  pd_right:        number | null;
  pd_left:         number | null;
  source:          "manual" | "uploaded" | "clinic_issued";
  document_url:    string | null;
  is_active:       boolean;
  notes:           string | null;
  created_at:      string;
  updated_at:      string;
}

export type PrescriptionInsert = Omit<Prescription, "id" | "user_id" | "created_at" | "updated_at">;

// ── Helpers ───────────────────────────────────────────────────────────────────
export function prescriptionAge(rx: Prescription): number {
  const ref = rx.expiry_date ?? rx.issued_date;
  if (!ref) return Infinity;
  return differenceInMonths(new Date(), parseISO(ref));
}

export function isPrescriptionValid(rx: Prescription): boolean {
  if (rx.expiry_date) return new Date(rx.expiry_date) >= new Date();
  if (rx.issued_date) return differenceInMonths(new Date(), parseISO(rx.issued_date)) < 24;
  return false;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function usePrescriptions() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["prescriptions", user?.id],
    queryFn: async (): Promise<Prescription[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_prescriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Prescription[];
    },
    enabled: !!user,
  });

  const createRx = useMutation({
    mutationFn: async (rx: PrescriptionInsert) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("user_prescriptions")
        .insert({ ...rx, user_id: user.id } as never)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Prescription;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prescriptions", user?.id] });
      toast.success("Prescription saved");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const deleteRx = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_prescriptions")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prescriptions", user?.id] });
      toast.success("Prescription removed");
    },
  });

  const activePrescriptions = (query.data ?? []).filter(isPrescriptionValid);
  const latestValid = activePrescriptions[0] ?? null;

  return {
    prescriptions: query.data ?? [],
    activePrescriptions,
    latestValid,
    isLoading: query.isLoading,
    createRx,
    deleteRx,
  };
}
