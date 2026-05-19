import { useParams, Link, Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useBlogPost } from "@/hooks/useBlogPosts";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarCheck } from "@phosphor-icons/react";

// Tiny markdown -> HTML renderer (headings, bold, lists, paragraphs)
function renderMarkdown(md: string): string {
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = md.split("\n");
  const html: string[] = [];
  let inList = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^### /.test(line)) { if (inList) { html.push("</ul>"); inList = false; } html.push(`<h3>${escape(line.slice(4))}</h3>`); }
    else if (/^## /.test(line)) { if (inList) { html.push("</ul>"); inList = false; } html.push(`<h2>${escape(line.slice(3))}</h2>`); }
    else if (/^# /.test(line)) { if (inList) { html.push("</ul>"); inList = false; } html.push(`<h1>${escape(line.slice(2))}</h1>`); }
    else if (/^- /.test(line)) { if (!inList) { html.push("<ul>"); inList = true; } html.push(`<li>${escape(line.slice(2))}</li>`); }
    else if (line.trim() === "") { if (inList) { html.push("</ul>"); inList = false; } }
    else { if (inList) { html.push("</ul>"); inList = false; } html.push(`<p>${escape(line)}</p>`); }
  }
  if (inList) html.push("</ul>");
  return html.join("\n").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

const BlogPost = () => {
  const { slug = "" } = useParams();
  const { data: post, isLoading } = useBlogPost(slug);

  useSEO({
    title: post ? `${post.title} – Soteria Eye Clinic` : "Article – Soteria Eye Clinic",
    description: post?.excerpt || "Eye health article from Soteria Eye Clinic",
    ogImage: post?.cover_image || undefined,
    ogType: "article",
  });

  if (!isLoading && !post) return <Navigate to="/blog" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="h-16 lg:h-[104px]" />

      {isLoading ? (
        <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted-foreground">Loading…</div>
      ) : post ? (
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link to="/blog" className="inline-flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Link>
          </Button>

          <p className="text-xs text-muted-foreground mb-3">
            {new Date(post.published_at).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}
            {post.author ? ` · ${post.author}` : ""}
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-6 leading-tight">{post.title}</h1>

          {post.cover_image && (
            <img src={post.cover_image} alt={post.title} className="w-full aspect-[16/9] object-cover rounded-2xl mb-8" />
          )}

          <div
            className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body_markdown) }}
          />

          <div className="mt-12 p-6 rounded-2xl feature-navy text-center">
            <h3 className="text-xl font-display font-semibold text-white mb-3">Need an eye check?</h3>
            <Button asChild>
              <Link to="/booking" className="inline-flex items-center gap-2">
                <CalendarCheck weight="fill" className="h-5 w-5" /> Book a consultation
              </Link>
            </Button>
          </div>
        </article>
      ) : null}

      <Footer />
    </div>
  );
};

export default BlogPost;
