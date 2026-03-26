import { useState, useEffect, useCallback } from "react";
import { BookOpen, Feather, Search, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import AppShell from "@/components/AppShell";
import QuoteCard from "@/components/feed/QuoteCard";
import ThoughtCard from "@/components/feed/ThoughtCard";
import StoryPreviewCard from "@/components/feed/StoryPreviewCard";
import CommentSheet from "@/components/feed/CommentSheet";
import UserSearchDialog from "@/components/feed/UserSearchDialog";
import InteractionBar from "@/components/feed/InteractionBar";
import { useFeed, type FeedItem } from "@/hooks/useFeed";

const QUOTE_TYPES = ["quote", "inspiration", "poem"];
const THOUGHT_TYPES = ["short_story"];

type FeedTab = "foryou" | "following" | "clubs";

interface SavedQuote {
  id: string;
  body: string | null;
  title: string;
  style: Record<string, unknown> | null;
  author_id: string;
  author_name: string;
  likes_count: number;
  saves_count: number;
  comments_count: number;
  is_liked: boolean;
  is_saved: boolean;
}

function FeedSidebar() {
  return (
    <div className="space-y-6 pt-20">
      <div className="bg-card rounded-sm p-5">
        <p className="label-uppercase text-[10px] text-accent mb-3">Top Recommendation</p>
        <h3 className="font-display text-lg font-bold mb-2">The Architecture of Absence</h3>
        <p className="text-sm text-muted-foreground mb-3">Recommended based on your interests…</p>
        <span className="label-uppercase text-xs text-accent">Read Now →</span>
      </div>
      <div className="bg-card rounded-sm p-5">
        <p className="label-uppercase text-[10px] text-muted-foreground mb-3">Trending Topics</p>
        <div className="flex flex-wrap gap-2">
          {["Philosophy", "Afrofuturism", "Poetry", "Tech Ethics"].map((t) => (
            <span key={t} className="bg-secondary text-secondary-foreground label-uppercase text-[9px] px-2.5 py-1 rounded-sm">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeedItemRenderer({
  item,
  onToggleLike,
  onToggleSave,
  onComment,
}: {
  item: FeedItem;
  onToggleLike: (id: string, liked: boolean) => void;
  onToggleSave: (id: string, saved: boolean) => void;
  onComment: (id: string) => void;
}) {
  if (QUOTE_TYPES.includes(item.content_type)) {
    return (
      <QuoteCard
        id={item.id}
        body={item.body || item.title}
        authorId={item.author_id}
        authorName={item.author_name}
        tags={item.tags}
        createdAt={item.created_at}
        likesCount={item.likes_count}
        savesCount={item.saves_count}
        commentsCount={item.comments_count}
        isLiked={item.is_liked}
        isSaved={item.is_saved}
        style={item.style as any}
        onToggleLike={(liked) => onToggleLike(item.id, liked)}
        onToggleSave={(saved) => onToggleSave(item.id, saved)}
        onComment={() => onComment(item.id)}
      />
    );
  }

  if (THOUGHT_TYPES.includes(item.content_type)) {
    return (
      <ThoughtCard
        id={item.id}
        title={item.title}
        body={item.body}
        authorId={item.author_id}
        authorName={item.author_name}
        tags={item.tags}
        createdAt={item.created_at}
        likesCount={item.likes_count}
        savesCount={item.saves_count}
        commentsCount={item.comments_count}
        isLiked={item.is_liked}
        isSaved={item.is_saved}
        onToggleLike={(liked) => onToggleLike(item.id, liked)}
        onToggleSave={(saved) => onToggleSave(item.id, saved)}
        onComment={() => onComment(item.id)}
      />
    );
  }

  return (
    <StoryPreviewCard
      id={item.id}
      title={item.title}
      body={item.body}
      contentType={item.content_type}
      coverImageUrl={item.cover_image_url}
      authorId={item.author_id}
      authorName={item.author_name}
      tags={item.tags}
      createdAt={item.created_at}
      likesCount={item.likes_count}
      savesCount={item.saves_count}
      commentsCount={item.comments_count}
      isLiked={item.is_liked}
      isSaved={item.is_saved}
      onToggleLike={(liked) => onToggleLike(item.id, liked)}
      onToggleSave={(saved) => onToggleSave(item.id, saved)}
      onComment={() => onComment(item.id)}
    />
  );
}

const tabLabels: { key: FeedTab; label: string }[] = [
  { key: "foryou", label: "For You" },
  { key: "following", label: "Following" },
  { key: "clubs", label: "Clubs" },
];

const frameClass: Record<string, string> = {
  none: "",
  thin: "border border-white/10",
  ornate: "border-2 border-white/20",
};

export default function Feed() {
  const [activeTab, setActiveTab] = useState<FeedTab>("foryou");
  const [searchOpen, setSearchOpen] = useState(false);
  const [commentContentId, setCommentContentId] = useState<string | null>(null);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [reflectionOverlay, setReflectionOverlay] = useState<SavedQuote | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, loading, toggleLike, toggleSave } = useFeed(activeTab);

  const handleOpenComments = useCallback((contentId: string) => {
    setCommentContentId(contentId);
  }, []);

  // Fetch saved quotes for Reflections
  useEffect(() => {
    if (!user) return;
    const fetchSaved = async () => {
      const { data: saves } = await supabase
        .from("saves")
        .select("content_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!saves || saves.length === 0) { setSavedQuotes([]); return; }

      const ids = saves.map((s) => s.content_id);
      const { data: contents } = await supabase
        .from("contents")
        .select("*")
        .in("id", ids)
        .eq("content_type", "quote")
        .eq("status", "published");

      if (!contents || contents.length === 0) { setSavedQuotes([]); return; }

      const authorIds = [...new Set(contents.map((c) => c.author_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", authorIds);
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p.display_name]));

      setSavedQuotes(
        contents.map((c) => ({
          id: c.id,
          body: c.body,
          title: c.title,
          style: (c.style as Record<string, unknown>) || null,
          author_id: c.author_id,
          author_name: profileMap.get(c.author_id) || "Unknown",
          likes_count: 0,
          saves_count: 0,
          comments_count: 0,
          is_liked: false,
          is_saved: true,
        }))
      );
    };
    fetchSaved();
  }, [user]);

  return (
    <AppShell sidebar={<FeedSidebar />}>
      <div className="pb-24">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 sticky top-0 z-40 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span className="font-display text-lg font-semibold">Oeuvre</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-8 h-8 flex items-center justify-center min-w-[44px] min-h-[44px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform min-w-[44px] min-h-[44px]"
            >
              <span className="text-xs font-medium">C</span>
            </button>
          </div>
        </header>

        {/* Feed tabs */}
        <div className="flex gap-2 px-5 mb-4">
          {tabLabels.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-full label-uppercase text-[10px] transition-colors active:scale-[0.96] min-h-[44px] ${
                activeTab === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Reflections carousel */}
        {savedQuotes.length > 0 && (
          <section className="mb-6 animate-fade-up">
            <div className="flex items-center justify-between px-5 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="label-uppercase text-[10px] font-medium">Your Reflections</span>
                <span className="bg-accent/10 text-accent text-[9px] px-1.5 py-0.5 rounded-full tabular-nums">{savedQuotes.length}</span>
              </div>
            </div>
            <div className="flex gap-3 px-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
              {savedQuotes.map((q, idx) => {
                const s = q.style as { background?: string; font?: string; alignment?: string; frame?: string; bold?: boolean; italic?: boolean } | null;
                const hasStyle = s && s.background;
                const text = q.body || q.title;

                return (
                  <button
                    key={q.id}
                    onClick={() => setReflectionOverlay(q)}
                    className="flex-shrink-0 w-36 h-48 rounded-sm overflow-hidden snap-start transition-transform active:scale-95 animate-fade-up"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {hasStyle ? (
                      <div className="w-full h-full flex items-center justify-center p-3" style={{ background: s.background }}>
                        <p
                          className={`text-[11px] leading-tight line-clamp-5 ${s.bold ? "font-bold" : "font-medium"} ${s.italic ? "italic" : ""} ${s.alignment === "left" ? "text-left" : s.alignment === "right" ? "text-right" : "text-center"}`}
                          style={{ fontFamily: s.font, color: "white" }}
                        >
                          {text}
                        </p>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-card flex items-center justify-center p-3">
                        <p className="text-[11px] leading-tight line-clamp-5 font-display italic text-center">"{text}"</p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Feed content */}
        <div className="px-5 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 animate-fade-up">
              <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold mb-2">
                {activeTab === "foryou" && "Your feed is empty"}
                {activeTab === "following" && "No posts from people you follow"}
                {activeTab === "clubs" && "Join clubs to see content here"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-[30ch] mx-auto">
                {activeTab === "foryou" && "Start creating or following writers to fill your feed with meaningful ideas."}
                {activeTab === "following" && "Follow writers whose work inspires you."}
                {activeTab === "clubs" && "Discover and join clubs that match your intellectual interests."}
              </p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={item.id}>
                {idx > 0 && <div className="h-px bg-border mb-6" />}
                <FeedItemRenderer
                  item={item}
                  onToggleLike={toggleLike}
                  onToggleSave={toggleSave}
                  onComment={handleOpenComments}
                />
              </div>
            ))
          )}

          {/* Mobile sidebar content */}
          {!loading && items.length > 0 && (
            <div className="lg:hidden pt-4">
              <div className="h-px bg-border mb-6" />
              <div className="bg-card p-5 rounded-sm animate-fade-up">
                <p className="label-uppercase text-[10px] text-accent mb-2">Top Recommendation</p>
                <h3 className="font-display text-xl font-bold mb-2">The Architecture of Absence</h3>
                <p className="text-sm text-muted-foreground mb-3">Recommended based on your interests…</p>
                <span className="label-uppercase text-xs text-accent">Read Now →</span>
              </div>
            </div>
          )}
        </div>

        {/* FAB */}
        <button
          onClick={() => navigate("/create")}
          className="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg shadow-accent/20 active:scale-90 transition-transform animate-fade-in"
          style={{ marginBottom: "var(--safe-bottom)" }}
        >
          <Feather className="w-5 h-5" />
        </button>

        <BottomNav />
      </div>

      {/* Reflection fullscreen overlay */}
      {reflectionOverlay && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md animate-fade-in"
          onClick={() => setReflectionOverlay(null)}
        >
          <div className="w-full max-w-md mx-5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setReflectionOverlay(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center text-foreground z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {(() => {
              const q = reflectionOverlay;
              const s = q.style as { background?: string; font?: string; alignment?: string; frame?: string; bold?: boolean; italic?: boolean } | null;
              const hasStyle = s && s.background;
              const text = q.body || q.title;
              const len = text.length;
              const fontSize = len > 200 ? "text-lg" : len > 100 ? "text-xl" : "text-2xl";

              return (
                <div className="animate-fade-up">
                  {hasStyle ? (
                    <div
                      className={`rounded-sm overflow-hidden ${frameClass[s.frame || "none"]}`}
                      style={{ background: s.background }}
                    >
                      <div className="flex items-center justify-center min-h-[300px] p-8">
                        <div
                          className={`max-w-sm w-full p-8 rounded-sm ${s.alignment === "left" ? "text-left" : s.alignment === "right" ? "text-right" : "text-center"}`}
                          style={{ backgroundColor: "rgba(0,0,0,0.15)", backdropFilter: "blur(8px)" }}
                        >
                          <p className="leading-none mb-3 opacity-30" style={{ fontFamily: s.font, fontSize: "2.5rem", color: "white" }}>❝</p>
                          <p
                            className={`leading-snug mb-6 ${fontSize} ${s.bold ? "font-bold" : "font-semibold"} ${s.italic ? "italic" : ""}`}
                            style={{ fontFamily: s.font, color: "white" }}
                          >
                            {text}
                          </p>
                          <div className="w-12 h-px bg-white/20 mb-4" style={{
                            marginLeft: s.alignment === "center" ? "auto" : s.alignment === "right" ? "auto" : 0,
                            marginRight: s.alignment === "center" ? "auto" : s.alignment === "left" ? "auto" : 0,
                          }} />
                          <p className="text-sm opacity-60" style={{ fontFamily: s.font, color: "white" }}>{q.author_name}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-card rounded-sm p-8">
                      <p className={`font-display ${fontSize} font-semibold leading-snug text-center italic`}>"{text}"</p>
                      <p className="text-sm text-muted-foreground text-center mt-4">— {q.author_name}</p>
                    </div>
                  )}
                  <InteractionBar
                    contentId={q.id}
                    likesCount={q.likes_count}
                    savesCount={q.saves_count}
                    commentsCount={q.comments_count}
                    isLiked={q.is_liked}
                    isSaved={q.is_saved}
                    onToggleLike={() => {}}
                    onToggleSave={() => {}}
                    onComment={() => setCommentContentId(q.id)}
                  />
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <UserSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <CommentSheet contentId={commentContentId} onClose={() => setCommentContentId(null)} />
    </AppShell>
  );
}
