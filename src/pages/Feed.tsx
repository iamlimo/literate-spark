import { useState } from "react";
import { BookOpen, Feather } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import AppShell from "@/components/AppShell";
import QuoteCard from "@/components/feed/QuoteCard";
import ThoughtCard from "@/components/feed/ThoughtCard";
import StoryPreviewCard from "@/components/feed/StoryPreviewCard";
import { useFeed, type FeedItem } from "@/hooks/useFeed";

const QUOTE_TYPES = ["quote", "inspiration", "poem"];
const THOUGHT_TYPES = ["short_story"];

type FeedTab = "foryou" | "following" | "clubs";

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
}: {
  item: FeedItem;
  onToggleLike: (id: string, liked: boolean) => void;
  onToggleSave: (id: string, saved: boolean) => void;
}) {
  if (QUOTE_TYPES.includes(item.content_type)) {
    return (
      <QuoteCard
        id={item.id}
        body={item.body || item.title}
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
      />
    );
  }

  if (THOUGHT_TYPES.includes(item.content_type)) {
    return (
      <ThoughtCard
        id={item.id}
        title={item.title}
        body={item.body}
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
    />
  );
}

const tabLabels: { key: FeedTab; label: string }[] = [
  { key: "foryou", label: "For You" },
  { key: "following", label: "Following" },
  { key: "clubs", label: "Clubs" },
];

export default function Feed() {
  const [activeTab, setActiveTab] = useState<FeedTab>("foryou");
  const navigate = useNavigate();
  const { items, loading, toggleLike, toggleSave } = useFeed(activeTab);

  return (
    <AppShell sidebar={<FeedSidebar />}>
      <div className="pb-24">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 sticky top-0 z-40 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span className="font-display text-lg font-semibold">Oeuvre</span>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform min-w-[44px] min-h-[44px]"
          >
            <span className="text-xs font-medium">C</span>
          </button>
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
    </AppShell>
  );
}
