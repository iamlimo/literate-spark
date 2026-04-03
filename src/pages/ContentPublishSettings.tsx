import { useState } from "react";
import { ArrowLeft, Lock, Globe, Check, Sparkles, BookOpen, Share2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const TAG_SUGGESTIONS = ["philosophy", "fiction", "poetry", "science", "history", "politics", "technology", "memoir"];

export default function ContentPublishSettings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const { title, body, contentType } = (location.state as { title: string; body: string; contentType: string }) || {};

  const [caption, setCaption] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const addTag = (tag: string) => {
    const clean = tag.replace(/^#/, "").trim().toLowerCase();
    if (clean && !tags.includes(clean) && tags.length < 8) {
      setTags((prev) => [...prev, clean]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handlePublish = async () => {
    if (!user || !title?.trim()) return;
    setPublishing(true);
    try {
      const { error } = await supabase.from("contents").insert({
        author_id: user.id,
        title,
        body,
        caption: caption || null,
        content_type: contentType as any,
        status: visibility === "public" ? "published" : "draft",
        tags,
      });

      if (error) throw error;
      setPublished(true);
    } catch (err: any) {
      toast({ title: "Publish failed", description: err.message, variant: "destructive" });
    } finally {
      setPublishing(false);
    }
  };

  if (!title) {
    navigate("/create");
    return null;
  }

  if (published) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-6">
          <Check className="w-7 h-7 text-accent" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2 text-center">Published</h2>
        <p className="text-sm text-muted-foreground mb-8 text-center text-pretty">
          Your work is now live on Oeuvre.
        </p>
        <div className="space-y-3 w-full max-w-xs">
          <button
            onClick={() => navigate("/feed")}
            className="w-full flex items-center gap-3 bg-secondary text-secondary-foreground px-4 py-3 rounded-sm text-sm active:scale-[0.97] transition-transform min-h-[48px]"
          >
            <BookOpen className="w-4 h-4 text-accent" /> View in Feed
          </button>
          <button
            onClick={() => navigate("/feed")}
            className="w-full flex items-center gap-3 bg-secondary text-secondary-foreground px-4 py-3 rounded-sm text-sm active:scale-[0.97] transition-transform min-h-[48px]"
          >
            <Share2 className="w-4 h-4 text-accent" /> Share externally
          </button>
        </div>
        <button onClick={() => navigate("/feed")} className="mt-8 text-xs text-muted-foreground label-uppercase min-h-[44px]">
          Back to Feed
        </button>
      </div>
    );
  }

  const typeLabel = contentType === "short_story" ? "Story" : contentType === "novel" ? "Book" : contentType.charAt(0).toUpperCase() + contentType.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-5 py-4 sticky top-0 z-40 bg-background/95 backdrop-blur-sm max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-display font-bold text-sm">Publish {typeLabel}</span>
        <button
          disabled={publishing}
          onClick={handlePublish}
          className="bg-accent text-accent-foreground px-5 py-2 rounded-full label-uppercase text-xs active:scale-[0.97] transition-transform disabled:opacity-40 min-h-[44px]"
        >
          {publishing ? "…" : "Publish"}
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-5 pb-12 space-y-6">
        {/* Title preview */}
        <div className="bg-card border border-border rounded-sm p-5">
          <p className="label-uppercase text-[10px] text-muted-foreground mb-1">{typeLabel}</p>
          <h2 className="font-display text-xl font-bold">{title}</h2>
          {body && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{body.slice(0, 200)}</p>}
        </div>

        {/* Caption */}
        <div>
          <label className="label-uppercase text-[10px] text-muted-foreground mb-2 block">Description</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a short description..."
            className="w-full bg-secondary rounded-sm p-4 text-sm outline-none resize-none min-h-[80px] placeholder:text-muted-foreground/50"
            rows={3}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="label-uppercase text-[10px] text-muted-foreground mb-2 block">Tags</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => removeTag(t)}
                className="bg-accent/10 text-accent text-xs px-3 py-1.5 rounded-full active:scale-95 transition-transform min-h-[36px]"
              >
                #{t} ×
              </button>
            ))}
          </div>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            placeholder="Add a tag..."
            className="w-full bg-secondary rounded-sm px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/50"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {TAG_SUGGESTIONS.filter((s) => !tags.includes(s)).slice(0, 5).map((s) => (
              <button
                key={s}
                onClick={() => addTag(s)}
                className="text-[10px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full active:scale-95 transition-transform min-h-[32px]"
              >
                #{s}
              </button>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="label-uppercase text-[10px] text-muted-foreground mb-3 block">Visibility</label>
          <div className="flex gap-3">
            {([
              { val: "public" as const, icon: <Globe className="w-4 h-4" />, label: "Feed (Public)" },
              { val: "private" as const, icon: <Lock className="w-4 h-4" />, label: "Private" },
            ]).map((v) => (
              <button
                key={v.val}
                onClick={() => setVisibility(v.val)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-sm text-sm transition-all active:scale-[0.97] min-h-[48px] ${
                  visibility === v.val
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {v.icon} {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
