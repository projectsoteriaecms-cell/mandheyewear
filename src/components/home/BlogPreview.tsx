import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { Button } from "@/components/ui/button";

export const BlogPreview = () => {
  const { data: posts = [], isLoading } = useBlogPosts(3);

  if (isLoading || posts.length === 0) return null;

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary font-medium uppercase tracking-widest text-sm mb-3">From the Blog</p>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground mb-4">
            Eye Health Insights for Nigerians
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Practical advice and clinical guidance from our optometrists
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-xl transition-all animate-pop-in"
              style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
            >
              {post.cover_image && (
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-5">
                <p className="text-xs text-muted-foreground mb-2">
                  {new Date(post.published_at).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                <h3 className="font-display font-semibold text-foreground text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{post.excerpt}</p>
                )}
                <span className="text-primary text-sm font-medium inline-flex items-center gap-1">
                  Read more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" size="lg" asChild>
            <Link to="/blog">View All Articles</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
