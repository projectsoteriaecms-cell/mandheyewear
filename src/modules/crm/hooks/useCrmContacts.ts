import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CrmContact {
  email:                    string;
  user_id:                  string | null;
  profile_id:               string | null;
  full_name:                string | null;
  phone:                    string | null;
  is_vto_lead:              boolean;
  is_newsletter_subscriber: boolean;
  is_registered:            boolean;
  marketing_consent:        boolean;
  newsletter_active:        boolean;
  is_suppressed:            boolean;
  try_on_count:             number;
  lifetime_value:           number;
  order_count:              number;
  last_order_at:            string | null;
  first_seen:               string | null;
  last_activity_at:         string | null;
}

export type ContactFilter =
  | "all"
  | "leads"
  | "subscribers"
  | "registered"
  | "customers"   // lifetime_value > 0
  | "suppressed";

export interface ContactStats {
  total_contacts:   number;
  vto_leads:        number;
  subscribers:      number;
  registered:       number;
  paying_customers: number;
  suppressed:       number;
}

export interface UseCrmContactsParams {
  search?: string;
  filter?: ContactFilter;
  page?:   number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 25;

// ── useCrmContacts — paginated, filtered contact list ──────────────────────────

export function useCrmContacts({
  search = "",
  filter = "all",
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE,
}: UseCrmContactsParams = {}) {
  return useQuery({
    queryKey: ["crm_contacts", { search, filter, page, pageSize }],
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    queryFn: async () => {
      let q = supabase
        .from("crm_contacts")
        .select(
          "email, user_id, profile_id, full_name, phone, is_vto_lead, is_newsletter_subscriber, is_registered, marketing_consent, newsletter_active, is_suppressed, try_on_count, lifetime_value, order_count, last_order_at, first_seen, last_activity_at",
          { count: "exact" },
        );

      // Filter chips → predicates
      switch (filter) {
        case "leads":       q = q.eq("is_vto_lead", true); break;
        case "subscribers": q = q.eq("is_newsletter_subscriber", true); break;
        case "registered":  q = q.eq("is_registered", true); break;
        case "customers":   q = q.gt("lifetime_value", 0); break;
        case "suppressed":  q = q.eq("is_suppressed", true); break;
        default: break;
      }

      if (search.trim()) {
        const term = `%${search.trim()}%`;
        q = q.or(`email.ilike.${term},full_name.ilike.${term}`);
      }

      const from = page * pageSize;
      const to   = from + pageSize - 1;
      q = q.order("last_activity_at", { ascending: false, nullsFirst: false }).range(from, to);

      const { data, error, count } = await q;
      if (error) throw error;

      return {
        rows:  (data ?? []) as CrmContact[],
        total: count ?? 0,
        page,
        pageSize,
        pageCount: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
      };
    },
  });
}

// ── useContactStats — stat cards ────────────────────────────────────────────────

export function useContactStats() {
  return useQuery({
    queryKey: ["crm_contact_stats"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<ContactStats | null> => {
      const { data, error } = await supabase.rpc("crm_contact_stats");
      if (error) throw error;
      return ((data as ContactStats[] | null)?.[0]) ?? null;
    },
  });
}
