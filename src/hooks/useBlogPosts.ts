import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase as _supabase } from "@/integrations/supabase/client";
// Cast to any until generated types include blog_posts table
const supabase = _supabase as any;

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  body_markdown: string;
  author: string | null;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export function useBlogPosts(limit?: number) {
  return useQuery({
    queryKey: ["blog_posts", limit],
    queryFn: async () => {
      let q = supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog_post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data as BlogPost | null;
    },
    enabled: !!slug,
  });
}

export function useAllBlogPostsAdmin() {
  return useQuery({
    queryKey: ["blog_posts_admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

export function useUpsertBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (post: Partial<BlogPost> & { slug: string; title: string; body_markdown: string }) => {
      const { data, error } = await supabase
        .from("blog_posts")
        .upsert(post, { onConflict: "slug" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog_posts"] });
      qc.invalidateQueries({ queryKey: ["blog_posts_admin"] });
    },
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog_posts"] });
      qc.invalidateQueries({ queryKey: ["blog_posts_admin"] });
    },
  });
}
