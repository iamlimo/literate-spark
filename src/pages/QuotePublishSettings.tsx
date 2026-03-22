import { useState } from "react";
import { ArrowLeft, Lock, Globe, Check, Sparkles, BookOpen, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuoteEditor } from "@/hooks/useQuoteEditor";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import QuoteCanvas from "@/components/quote/QuoteCanvas";
import { toast } from "@/hooks/use-toast";

const TAG_SUGGESTIONS = ["philosophy", "stoicism", "poetry", "literature", "wisdom", "motivation", "fiction", "creativity"];

export default function QuotePublishSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const editor = useQuoteEditor();

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
    if (!user || !editor.text.trim()) return;
    setPublishing(true);
    try {
      const { error } = await supabase.from("contents").insert({
        author_id: user.id,
        title: editor.text.slice(0, 60),
        body: editor.text,
        content_type: "quote",
        status: visibility === "public" ? "published" : "draft",
        tags,
        style: editor.style as any,
      });

      if (error) throw error;
      editor.clearDraft();
      setPublished(true);
    } catch (err: any) {
      toast({ title: "Publish failed", description: err.message, variant: "destructive" });
    } finally {
      setPublishing(false);
    }
  };

  if (published) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-6">
          <Check className="w-7 h-7 text-accent" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2 text-balance text-center">Published</h2>
        <p className="text-sm text-muted-foreground mb-8 text-center text-pretty">
          Your fragment is now live in the Atelier.
        </p>
        <div className="space-y-3 w-full max-w-xs">
          <button
            onClick={() => navigate("/feed")}
            className="w-full flex items-center gap-3 bg-secondary text-secondary-foreground px-4 py-3 rounded-sm text-sm active:scale-[0.97] transition-transform"
          >
            <Sparkles className="w-4 h-4 text-accent" /> Expand into an Article
          </button>
          <button
            onClick={() => navigate("/feed")}
            className="w-full flex items-center gap-3 bg-secondary text-secondary-foreground px-4 py-3 rounded-sm text-sm active:scale-[0.97] transition-transform"
          >
            <BookOpen className="w-4 h-4 text-accent" /> Add to a Collection
          </button>
          <button
            onClick={() => navigate("/feed")}
            className="w-full flex items-center gap-3 bg-secondary text-secondary-foreground px-4 py-3 rounded-sm text-sm active:scale-[0.97] transition-transform"
          >
            <Share2 className="w-4 h-4 text-accent" /> Share externally
          </button>
        </div>
        <button onClick={() => navigate("/feed")} className="mt-8 text-xs text-muted-foreground label-uppercase">
          Back to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-4 sticky top-0 z-40 bg-background/95 backdrop-blur-sm">
        <button onClick={() => navigate("/create")} className="text-foreground active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-display font-bold text-sm">Publish Quote</span>
        <button
          disabled={publishing || !editor.text.trim()}
          onClick={handlePublish}
          className="bg-accent text-accent-foreground px-5 py-2 rounded-full label-uppercase text-xs active:scale-[0.97] transition-transform disabled:opacity-40"
        >
          {publishing ? "…" : "Publish"}
        </button>
      </header>

      <div className="px-5 space-y-6 pb-12">
        {/* Preview */}
        <div className="rounded-sm overflow-hidden">
          <QuoteCanvas
            text={editor.text}
            authorName={editor.authorName}
            style={editor.style}
            isDark={editor.isDark}
          />
        </div>

        {/* Caption */}
        <div>
          <label className="label-uppercase text-[10px] text-muted-foreground mb-2 block">Reflection</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Capture your thoughts on this fragment..."
            className="w-full bg-secondary rounded-sm p-4 text-sm outline-none resize-none min-h-[80px] placeholder:text-muted-foreground/50"
            rows={3}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="label-uppercase text-[10px] text-muted-foreground mb-2 block">Archives (Tags)</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => removeTag(t)}
                className="bg-accent/10 text-accent text-xs px-3 py-1.5 rounded-full active:scale-95 transition-transform"
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
                className="text-[10px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full active:scale-95 transition-transform"
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
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-sm text-sm transition-all active:scale-[0.97] ${
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
