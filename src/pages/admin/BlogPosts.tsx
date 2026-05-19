import { useState } from "react";
import { AdminLayout } from "@/shared/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash } from "@phosphor-icons/react";
import { useAllBlogPostsAdmin, useUpsertBlogPost, useDeleteBlogPost, type BlogPost } from "@/hooks/useBlogPosts";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const emptyDraft = { slug: "", title: "", excerpt: "", cover_image: "", body_markdown: "", author: "Soteria Eye Clinic", is_published: true };

const BlogPostsAdmin = () => {
  const { toast } = useToast();
  const { data: posts = [], isLoading } = useAllBlogPostsAdmin();
  const upsert = useUpsertBlogPost();
  const del = useDeleteBlogPost();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<typeof emptyDraft & { id?: string }>(emptyDraft);

  const startEdit = (post: BlogPost) => {
    setDraft({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || "",
      cover_image: post.cover_image || "",
      body_markdown: post.body_markdown,
      author: post.author || "Soteria Eye Clinic",
      is_published: post.is_published,
    });
    setOpen(true);
  };

  const startNew = () => { setDraft(emptyDraft); setOpen(true); };

  const save = async () => {
    try {
      await upsert.mutateAsync({
        ...draft,
        slug: draft.slug || slugify(draft.title),
      });
      toast({ title: "Saved", description: "Blog post updated." });
      setOpen(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Blog Posts</h1>
          <p className="text-sm text-muted-foreground">Publish articles to the public blog.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startNew}><Plus className="h-4 w-4 mr-1" /> New Post</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{draft.id ? "Edit Post" : "New Post"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value, slug: draft.slug || slugify(e.target.value) })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })} />
              </div>
              <div>
                <Label>Excerpt</Label>
                <Textarea rows={2} value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} />
              </div>
              <div>
                <Label>Cover image URL</Label>
                <Input value={draft.cover_image} onChange={(e) => setDraft({ ...draft, cover_image: e.target.value })} />
              </div>
              <div>
                <Label>Body (Markdown supported: # ## ###, **bold**, - bullets)</Label>
                <Textarea rows={14} value={draft.body_markdown} onChange={(e) => setDraft({ ...draft, body_markdown: e.target.value })} />
              </div>
              <div>
                <Label>Author</Label>
                <Input value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={draft.is_published} onCheckedChange={(v) => setDraft({ ...draft, is_published: v })} />
                <Label>Published</Label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={save} disabled={upsert.isPending}>{upsert.isPending ? "Saving…" : "Save"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              {p.cover_image && <img src={p.cover_image} alt="" className="w-20 h-14 object-cover rounded" />}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground truncate">/{p.slug} · {p.is_published ? "Published" : "Draft"} · {new Date(p.published_at).toLocaleDateString()}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => startEdit(p)}><Pencil className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete this post?")) del.mutate(p.id); }}>
                <Trash className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {posts.length === 0 && <p className="text-muted-foreground text-center py-12">No posts yet. Click "New Post" to create one.</p>}
        </div>
      )}
    </AdminLayout>
  );
};

export default BlogPostsAdmin;
