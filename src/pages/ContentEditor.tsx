import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Chapter {
  title: string;
  body: string;
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
  const [chapters, setChapters] = useState<Chapter[]>([{ title: "Chapter 1", body: "" }]);

  const canPublish = title.trim().length > 0 && (isBook ? chapters.some((c) => c.body.trim().length > 0) : body.trim().length > 0);

  const addChapter = () => {
    setChapters((prev) => [...prev, { title: `Chapter ${prev.length + 1}`, body: "" }]);
  };

  const updateChapter = (idx: number, patch: Partial<Chapter>) => {
    setChapters((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };

  const removeChapter = (idx: number) => {
    if (chapters.length <= 1) return;
    setChapters((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePublish = () => {
    const state = {
      title,
      body: isBook ? JSON.stringify(chapters) : body,
      contentType,
    };
    navigate(`/create/${contentType}/publish`, { state });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-5 py-4 sticky top-0 z-40 bg-background/95 backdrop-blur-sm max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/create")}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-display font-bold text-sm">{label}</span>
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
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={ph.title}
          className="w-full bg-transparent font-display text-2xl md:text-3xl font-bold outline-none placeholder:text-muted-foreground/30 mb-4"
        />

        {isBook ? (
          <div className="space-y-6">
            {chapters.map((ch, idx) => (
              <div key={idx} className="bg-card border border-border rounded-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <input
                    value={ch.title}
                    onChange={(e) => updateChapter(idx, { title: e.target.value })}
                    className="bg-transparent font-display text-lg font-bold outline-none placeholder:text-muted-foreground/30 flex-1"
                    placeholder={`Chapter ${idx + 1}`}
                  />
                  {chapters.length > 1 && (
                    <button
                      onClick={() => removeChapter(idx)}
                      className="text-muted-foreground hover:text-destructive min-w-[36px] min-h-[36px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <textarea
                  value={ch.body}
                  onChange={(e) => updateChapter(idx, { body: e.target.value })}
                  placeholder="Write this chapter..."
                  className="w-full bg-transparent text-sm leading-relaxed outline-none resize-none min-h-[160px] placeholder:text-muted-foreground/30"
                />
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
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={ph.body}
            className={`w-full bg-transparent outline-none resize-none placeholder:text-muted-foreground/30 ${
              contentType === "poem"
                ? "font-display text-lg leading-loose italic min-h-[400px]"
                : "text-base leading-relaxed min-h-[400px]"
            }`}
          />
        )}
      </div>
    </div>
  );
}
