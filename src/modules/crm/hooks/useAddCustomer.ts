import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AddCustomerInput {
  email: string;
  full_name?: string;
  phone?: string;
  marketing_consent?: boolean;
  newsletter_opt_in?: boolean;
}

export interface AddCustomerResponse {
  success: boolean;
  email?: string;
  message: string;
}

export function useAddCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddCustomerInput): Promise<AddCustomerResponse> => {
      const { data, error } = await supabase.rpc("crm_add_customer", {
        p_email: input.email,
        p_full_name: input.full_name || null,
        p_phone: input.phone || null,
        p_marketing_consent: input.marketing_consent ?? false,
        p_newsletter_opt_in: input.newsletter_opt_in ?? false,
      });

      if (error) throw error;
      return (data as AddCustomerResponse) || { success: false, message: "Unknown error" };
    },

    onSuccess: () => {
      // Invalidate contacts list and stats so they refetch
      queryClient.invalidateQueries({ queryKey: ["crm_contacts"] });
      queryClient.invalidateQueries({ queryKey: ["crm_contact_stats"] });
    },

    onError: (error: any) => {
      console.error("Add customer error:", error);
    },
  });
}
