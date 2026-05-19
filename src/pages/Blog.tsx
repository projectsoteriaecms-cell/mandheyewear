import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useSEO } from "@/hooks/useSEO";
import { ArrowRight } from "@phosphor-icons/react";

const Blog = () => {
  useSEO({
    title: "Eye Health Blog – Soteria Eye Clinic",
    description: "Practical eye health advice for Nigerians from the optometrists at Soteria Eye Clinic.",
  });
  const { data: posts = [], isLoading } = useBlogPosts();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="h-16 lg:h-[104px]" />

      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-primary font-medium uppercase tracking-widest text-sm mb-3">Blog</p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
            Eye Health Insights
          </h1>
          <p className="text-muted-foreground text-lg">
            Practical advice from our clinical team
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading articles…</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-muted-foreground">No articles yet — check back soon.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-xl transition-all"
                >
                  {post.cover_image && (
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      <img src={post.cover_image} alt={post.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(post.published_at).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                    <h2 className="font-display font-semibold text-foreground text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{post.excerpt}</p>
                    )}
                    <span className="text-primary text-sm font-medium inline-flex items-center gap-1">
                      Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
