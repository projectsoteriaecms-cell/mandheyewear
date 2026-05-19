import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface StylePoll {
  id: string;
  question: string;
  poll_type: "single_select" | "multi_select" | "rating" | "text";
  options: string[];
  category: string;
  display_order: number;
}

export interface PollResponse {
  id: string;
  user_id: string;
  poll_id: string;
  response: string | string[];
  created_at: string;
}

export const useStylePolls = (category?: string) => {
  return useQuery({
    queryKey: ["style-polls", category],
    queryFn: async () => {
      let query = supabase
        .from("style_polls")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map((poll) => ({
        ...poll,
        options: poll.options as string[],
      })) as StylePoll[];
    },
  });
};

export const usePollResponses = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["poll-responses", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("poll_responses")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      return data.map((response) => ({
        ...response,
        response: response.response as string | string[],
      })) as PollResponse[];
    },
    enabled: !!user,
  });
};

export const useSubmitPollResponse = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      pollId,
      response,
    }: {
      pollId: string;
      response: string | string[];
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Check if response already exists
      const { data: existing } = await supabase
        .from("poll_responses")
        .select("id")
        .eq("user_id", user.id)
        .eq("poll_id", pollId)
        .maybeSingle();

      if (existing) {
        // Update existing response
        const { error } = await supabase
          .from("poll_responses")
          .update({ response })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Insert new response
        const { error } = await supabase.from("poll_responses").insert({
          user_id: user.id,
          poll_id: pollId,
          response,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poll-responses", user?.id] });
    },
  });
};

export const useSubmitAllPollResponses = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      responses: Array<{ pollId: string; response: string | string[] }>
    ) => {
      if (!user) throw new Error("User not authenticated");

      // Process all responses
      for (const { pollId, response } of responses) {
        const { data: existing } = await supabase
          .from("poll_responses")
          .select("id")
          .eq("user_id", user.id)
          .eq("poll_id", pollId)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("poll_responses")
            .update({ response })
            .eq("id", existing.id);
        } else {
          await supabase.from("poll_responses").insert({
            user_id: user.id,
            poll_id: pollId,
            response,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poll-responses", user?.id] });
    },
  });
};
