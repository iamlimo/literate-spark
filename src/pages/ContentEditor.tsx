import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function AutoExpandTextarea({
  value,
  onChange,
  placeholder,
  className,
  minHeight = 160,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  className?: string;
  minHeight?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

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
  const [hasChanges, setHasChanges] = useState(false);
  const initialRender = useRef(true);

  // Track unsaved changes
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    setHasChanges(true);
  }, [title, body, chapters]);

  const canPublish = title.trim().length > 0 && (isBook ? chapters.some((c) => c.body.trim().length > 0) : body.trim().length > 0);

  const totalWords = isBook
    ? chapters.reduce((sum, c) => sum + wordCount(c.body), 0)
    : wordCount(body);

  const addChapter = () => {
    setChapters((prev) => [...prev, { title: `Chapter ${prev.length + 1}`, body: "", collapsed: false }]);
  };

  const updateChapter = (idx: number, patch: Partial<Chapter>) => {
    setChapters((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };

  const removeChapter = (idx: number) => {
    if (chapters.length <= 1) return;
    setChapters((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleCollapse = (idx: number) => {
    setChapters((prev) => prev.map((c, i) => (i === idx ? { ...c, collapsed: !c.collapsed } : c)));
  };

  const handlePublish = useCallback(() => {
    const state = {
      title,
      body: isBook ? JSON.stringify(chapters.map(({ title: t, body: b }) => ({ title: t, body: b }))) : body,
      contentType,
    };
    navigate(`/create/${contentType}/publish`, { state });
  }, [title, body, chapters, contentType, isBook, navigate]);

  // Keyboard shortcut: Cmd/Ctrl+Enter to publish
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canPublish) {
        handlePublish();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canPublish, handlePublish]);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-5 py-4 sticky top-0 z-40 bg-background/95 backdrop-blur-sm max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/create")}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" title="Unsaved changes" />
          )}
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
          <p className="text-[10px] text-muted-foreground mb-4">
            {title.length}/{TITLE_MAX}
          </p>
        </div>

        {isBook ? (
          <div className="space-y-4">
            {chapters.map((ch, idx) => (
              <div key={idx} className="bg-card border border-border rounded-sm overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
                  <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                  <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    value={ch.title}
                    onChange={(e) => updateChapter(idx, { title: e.target.value })}
                    className="bg-transparent font-display text-lg font-bold outline-none placeholder:text-muted-foreground/30 flex-1 min-w-0"
                    placeholder={`Chapter ${idx + 1}`}
                  />
                  <button
                    onClick={() => toggleCollapse(idx)}
                    className="text-muted-foreground min-w-[36px] min-h-[36px] flex items-center justify-center"
                  >
                    {ch.collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                  {chapters.length > 1 && (
                    <button
                      onClick={() => removeChapter(idx)}
                      className="text-muted-foreground hover:text-destructive min-w-[36px] min-h-[36px] flex items-center justify-center"
                    >
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
                    <p className="text-[10px] text-muted-foreground mt-2 text-right">
                      {wordCount(ch.body)} words
                    </p>
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addChapter}
              className="flex items-center gap-2 text-accent text-sm active:scale-95 transition-transform min-h-[44px]"
            >
              <Plus className="w-4 h-4" /> Add Chapter
            </button>
          </div>
        ) : (
          <AutoExpandTextarea
            value={body}
            onChange={setBody}
            placeholder={ph.body}
            className={
              contentType === "poem"
                ? "font-display text-lg leading-loose italic"
                : "text-base leading-relaxed"
            }
            minHeight={400}
          />
        )}

        {/* Footer stats */}
        <div className="mt-6 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-4">
          <span>{totalWords} {totalWords === 1 ? "word" : "words"}</span>
          <span className="opacity-60">⌘ + Enter to publish</span>
        </div>
      </div>
    </div>
  );
}
