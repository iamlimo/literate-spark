import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Image } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import RichTextToolbar, { applyMarkdownAction } from "@/components/editor/RichTextToolbar";
import DraftIndicator from "@/components/editor/DraftIndicator";

interface Chapter {
  title: string;
  body: string;
  collapsed: boolean;
}

const typeLabels: Record<string, string> = {
  article: "Article",
  short_story: "Story",
  novel: "Book",
  poem: "Poem",
};

const placeholders: Record<string, { title: string; body: string }> = {
  article: { title: "Untitled Article", body: "Start writing your article..." },
  short_story: { title: "Untitled Story", body: "Once upon a time..." },
  novel: { title: "Untitled Book", body: "" },
  poem: { title: "Untitled Poem", body: "Write your verse here..." },
};

const TITLE_MAX = 200;
const AUTO_SAVE_DELAY = 5000;

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function AutoExpandTextarea({
  value,
  onChange,
  placeholder,
  className,
  minHeight = 160,
  textareaRef,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  className?: string;
  minHeight?: number;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const ref = textareaRef || internalRef;

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = Math.max(minHeight, ref.current.scrollHeight) + "px";
    }
  }, [value, minHeight]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-transparent outline-none resize-none placeholder:text-muted-foreground/30 ${className || ""}`}
      style={{ minHeight: `${minHeight}px` }}
    />
  );
}

export default function ContentEditor() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const contentType = type || "article";
  const label = typeLabels[contentType] || "Content";
  const ph = placeholders[contentType] || placeholders.article;
  const isBook = contentType === "novel";

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([{ title: "Chapter 1", body: "", collapsed: false }]);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const initialRender = useRef(true);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing draft on mount
  useEffect(() => {
    if (!user) return;
    const loadDraft = async () => {
      const { data } = await supabase
        .from("contents")
        .select("id, title, body")
        .eq("author_id", user.id)
        .eq("content_type", contentType as any)
        .eq("status", "draft")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setDraftId(data.id);
        setTitle(data.title || "");
        if (isBook && data.body) {
          try {
            const parsed = JSON.parse(data.body);
            if (Array.isArray(parsed)) {
              setChapters(parsed.map((c: any) => ({ title: c.title || "", body: c.body || "", collapsed: false })));
            }
          } catch { setBody(data.body || ""); }
        } else {
          setBody(data.body || "");
        }
        setLastSaved(new Date());
      }
    };
    loadDraft();
  }, [user, contentType, isBook]);

  // Track changes
  useEffect(() => {
    if (initialRender.current) { initialRender.current = false; return; }
    setHasChanges(true);
  }, [title, body, chapters]);

  // Auto-save draft
  useEffect(() => {
    if (!hasChanges || !user || !title.trim()) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setDraftStatus("saving");
      const bodyContent = isBook
        ? JSON.stringify(chapters.map(({ title: t, body: b }) => ({ title: t, body: b })))
        : body;

      try {
        if (draftId) {
          await supabase.from("contents").update({ title, body: bodyContent }).eq("id", draftId);
        } else {
          const { data } = await supabase.from("contents").insert({
            author_id: user.id,
            title,
            body: bodyContent,
            content_type: contentType as any,
            status: "draft",
          }).select("id").single();
          if (data) setDraftId(data.id);
        }
        setDraftStatus("saved");
        setLastSaved(new Date());
        setHasChanges(false);
        setTimeout(() => setDraftStatus("idle"), 2000);
      } catch {
        setDraftStatus("error");
      }
    }, AUTO_SAVE_DELAY);

    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [hasChanges, title, body, chapters, user, draftId, contentType, isBook]);

  const canPublish = title.trim().length > 0 && (isBook ? chapters.some((c) => c.body.trim().length > 0) : body.trim().length > 0);
  const totalWords = isBook ? chapters.reduce((sum, c) => sum + wordCount(c.body), 0) : wordCount(body);
  const readTime = Math.max(1, Math.ceil(totalWords / 200));

  const addChapter = () => setChapters((prev) => [...prev, { title: `Chapter ${prev.length + 1}`, body: "", collapsed: false }]);
  const updateChapter = (idx: number, patch: Partial<Chapter>) => setChapters((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  const removeChapter = (idx: number) => { if (chapters.length <= 1) return; setChapters((prev) => prev.filter((_, i) => i !== idx)); };
  const toggleCollapse = (idx: number) => setChapters((prev) => prev.map((c, i) => (i === idx ? { ...c, collapsed: !c.collapsed } : c)));

  const handleRichTextAction = useCallback((action: string) => {
    if (!bodyRef.current) return;
    const ta = bodyRef.current;
    const result = applyMarkdownAction(action, body, ta.selectionStart, ta.selectionEnd);
    setBody(result.text);
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = result.cursorPos;
      ta.focus();
    });
  }, [body]);

  const handlePublish = useCallback(() => {
    const state = {
      title,
      body: isBook ? JSON.stringify(chapters.map(({ title: t, body: b }) => ({ title: t, body: b }))) : body,
      contentType,
      draftId,
    };
    navigate(`/create/${contentType}/publish`, { state });
  }, [title, body, chapters, contentType, isBook, navigate, draftId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canPublish) handlePublish();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canPublish, handlePublish]);

  return (
    <div className="min-h-screen bg-background">
      {/* Step indicator */}
      <div className="max-w-3xl mx-auto px-5 pt-3">
        <div className="flex items-center gap-2 mb-0">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[10px] font-bold">1</div>
            <span className="text-[10px] font-medium text-accent">Write</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-1 opacity-40">
            <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-[10px] font-bold">2</div>
            <span className="text-[10px] font-medium">Settings</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-1 opacity-40">
            <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-[10px] font-bold">3</div>
            <span className="text-[10px] font-medium">Publish</span>
          </div>
        </div>
      </div>

      <header className="flex items-center justify-between px-5 py-3 sticky top-0 z-40 bg-background/95 backdrop-blur-sm max-w-3xl mx-auto">
        <button onClick={() => navigate("/create")} className="min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <DraftIndicator status={draftStatus} lastSaved={lastSaved} />
          <span className="font-display font-bold text-sm">{label}</span>
        </div>
        <button
          disabled={!canPublish}
          onClick={handlePublish}
          className="bg-accent text-accent-foreground px-5 py-2 rounded-full label-uppercase text-xs active:scale-[0.97] transition-transform disabled:opacity-40 min-h-[44px]"
        >
          Next
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-5 pb-20">
        {/* Title */}
        <div className="relative">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
            placeholder={ph.title}
            className="w-full bg-transparent font-display text-2xl md:text-3xl font-bold outline-none placeholder:text-muted-foreground/30 mb-1"
          />
          <p className="text-[10px] text-muted-foreground mb-4">{title.length}/{TITLE_MAX}</p>
        </div>

        {isBook ? (
          <div className="space-y-4">
            {chapters.map((ch, idx) => (
              <div key={idx} className="bg-card border border-border rounded-sm overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
                  <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                  <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">{idx + 1}</span>
                  <input
                    value={ch.title}
                    onChange={(e) => updateChapter(idx, { title: e.target.value })}
                    className="bg-transparent font-display text-lg font-bold outline-none placeholder:text-muted-foreground/30 flex-1 min-w-0"
                    placeholder={`Chapter ${idx + 1}`}
                  />
                  <button onClick={() => toggleCollapse(idx)} className="text-muted-foreground min-w-[36px] min-h-[36px] flex items-center justify-center">
                    {ch.collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                  {chapters.length > 1 && (
                    <button onClick={() => removeChapter(idx)} className="text-muted-foreground hover:text-destructive min-w-[36px] min-h-[36px] flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {!ch.collapsed && (
                  <div className="p-4">
                    <AutoExpandTextarea
                      value={ch.body}
                      onChange={(val) => updateChapter(idx, { body: val })}
                      placeholder="Write this chapter..."
                      className="text-sm leading-relaxed"
                      minHeight={120}
                    />
                    <p className="text-[10px] text-muted-foreground mt-2 text-right">{wordCount(ch.body)} words</p>
                  </div>
                )}
              </div>
            ))}
            <button onClick={addChapter} className="flex items-center gap-2 text-accent text-sm active:scale-95 transition-transform min-h-[44px]">
              <Plus className="w-4 h-4" /> Add Chapter
            </button>
          </div>
        ) : (
          <div>
            {contentType !== "poem" && <RichTextToolbar onAction={handleRichTextAction} />}
            <AutoExpandTextarea
              value={body}
              onChange={setBody}
              placeholder={ph.body}
              textareaRef={bodyRef as React.RefObject<HTMLTextAreaElement>}
              className={contentType === "poem" ? "font-display text-lg leading-loose italic" : "text-base leading-relaxed"}
              minHeight={400}
            />
          </div>
        )}

        {/* Footer stats */}
        <div className="mt-6 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-4">
          <span>{totalWords} {totalWords === 1 ? "word" : "words"} · {readTime} min read</span>
          <span className="opacity-60">⌘ + Enter to continue</span>
        </div>
      </div>
    </div>
  );
}
