import { useState, useRef } from "react";
import { ArrowLeft, Lock, Globe, Check, BookOpen, Share2, Image, X, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const TAG_SUGGESTIONS = ["philosophy", "fiction", "poetry", "science", "history", "politics", "technology", "memoir"];
const CAPTION_MAX = 280;

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function ContentPublishSettings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const { title, body, contentType, draftId } = (location.state as { title: string; body: string; contentType: string; draftId?: string }) || {};

  const [caption, setCaption] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const clean = tag.replace(/^#/, "").trim().toLowerCase();
    if (clean && !tags.includes(clean) && tags.length < 8) setTags((prev) => [...prev, clean]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const bodyWordCount = body ? wordCount(body) : 0;
  const readTime = Math.max(1, Math.ceil(bodyWordCount / 200));

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("content-covers").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("content-covers").getPublicUrl(path);
      setCoverUrl(urlData.publicUrl);
    }
    setUploading(false);
  };

  const handlePublish = async () => {
    if (!user || !title?.trim()) return;
    setPublishing(true);
    try {
      if (draftId) {
        // Update existing draft to published
        const { error } = await supabase.from("contents").update({
          title,
          body,
          caption: caption || null,
          status: visibility === "public" ? "published" : "draft",
          tags,
          cover_image_url: coverUrl,
        }).eq("id", draftId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("contents").insert({
          author_id: user.id,
          title,
          body,
          caption: caption || null,
          content_type: contentType as any,
          status: visibility === "public" ? "published" : "draft",
          tags,
          cover_image_url: coverUrl,
        });
        if (error) throw error;
      }
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
        <p className="text-sm text-muted-foreground mb-8 text-center text-pretty">Your work is now live on Oeuvre.</p>
        <div className="space-y-3 w-full max-w-xs">
          <button onClick={() => navigate("/feed")} className="w-full flex items-center gap-3 bg-secondary text-secondary-foreground px-4 py-3 rounded-sm text-sm active:scale-[0.97] transition-transform min-h-[48px]">
            <BookOpen className="w-4 h-4 text-accent" /> View in Feed
          </button>
          <button onClick={() => navigate("/feed")} className="w-full flex items-center gap-3 bg-secondary text-secondary-foreground px-4 py-3 rounded-sm text-sm active:scale-[0.97] transition-transform min-h-[48px]">
            <Share2 className="w-4 h-4 text-accent" /> Share externally
          </button>
        </div>
        <button onClick={() => navigate("/feed")} className="mt-8 text-xs text-muted-foreground label-uppercase min-h-[44px]">Back to Feed</button>
      </div>
    );
  }

  const typeLabel = contentType === "short_story" ? "Story" : contentType === "novel" ? "Book" : contentType.charAt(0).toUpperCase() + contentType.slice(1);
  const bodyPreview = body ? body.split("\n").filter(Boolean).slice(0, 3).join("\n") : "";

  return (
    <div className="min-h-screen bg-background">
      {/* Step indicator */}
      <div className="max-w-2xl mx-auto px-5 pt-3">
        <div className="flex items-center gap-2 mb-0">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px] font-bold">
              <Check className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">Write</span>
          </div>
          <div className="flex-1 h-px bg-accent" />
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[10px] font-bold">2</div>
            <span className="text-[10px] font-medium text-accent">Settings</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-1 opacity-40">
            <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-[10px] font-bold">3</div>
            <span className="text-[10px] font-medium">Publish</span>
          </div>
        </div>
      </div>

      <header className="flex items-center justify-between px-5 py-3 sticky top-0 z-40 bg-background/95 backdrop-blur-sm max-w-2xl mx-auto">
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
        {/* Cover image */}
        <div>
          <label className="label-uppercase text-[10px] text-muted-foreground mb-2 block">Cover Image</label>
          {coverUrl ? (
            <div className="relative rounded-sm overflow-hidden">
              <img src={coverUrl} alt="Cover" className="w-full h-40 object-cover" />
              <button onClick={() => setCoverUrl(null)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full h-32 border-2 border-dashed border-border rounded-sm flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent/40 transition-colors"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Image className="w-5 h-5" />}
              <span className="text-xs">{uploading ? "Uploading…" : "Add cover image"}</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
        </div>

        {/* Title preview with read time */}
        <div className="bg-card border border-border rounded-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="label-uppercase text-[10px] text-muted-foreground">{typeLabel}</p>
            <p className="text-[10px] text-muted-foreground">{readTime} min read · {bodyWordCount} words</p>
          </div>
          <h2 className="font-display text-xl font-bold">{title}</h2>
          {bodyPreview && <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-line line-clamp-3">{bodyPreview}</p>}
        </div>

        {/* Caption / Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label-uppercase text-[10px] text-muted-foreground">Description</label>
            <span className="text-[10px] text-muted-foreground">{caption.length}/{CAPTION_MAX}</span>
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, CAPTION_MAX))}
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
              <button key={t} onClick={() => removeTag(t)} className="bg-accent/10 text-accent text-xs px-3 py-1.5 rounded-full active:scale-95 transition-transform min-h-[36px]">
                #{t} ×
              </button>
            ))}
          </div>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
            }}
            placeholder="Add a tag..."
            className="w-full bg-secondary rounded-sm px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/50"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {TAG_SUGGESTIONS.filter((s) => !tags.includes(s)).slice(0, 5).map((s) => (
              <button key={s} onClick={() => addTag(s)} className="text-[10px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full active:scale-95 transition-transform min-h-[32px]">
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
                  visibility === v.val ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
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
