import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Edit2, BookOpen, Heart, Eye, UserPlus, UserCheck, Users, Feather, FileText, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import AppShell from "@/components/AppShell";
import InteractionBar from "@/components/feed/InteractionBar";
import CommentSheet from "@/components/feed/CommentSheet";
import { toast } from "@/hooks/use-toast";

interface ProfileData {
  id: string;
  user_id: string;
  display_name: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  persona: string | null;
  interests: string[] | null;
  created_at: string;
}

interface ContentItem {
  id: string;
  title: string;
  body: string | null;
  caption?: string | null;
  content_type: string;
  cover_image_url: string | null;
  style: Record<string, unknown> | null;
  created_at: string;
  view_count: number | null;
  status: string;
  tags: string[] | null;
  likes_count: number;
  saves_count: number;
  comments_count: number;
  is_liked: boolean;
  is_saved: boolean;
}

const personaLabels: Record<string, string> = {
  scribe: "Scribe",
  scholar: "Scholar",
  curator: "Curator",
  artiste: "Artiste",
};

const typeIcons: Record<string, typeof FileText> = {
  article: FileText,
  short_story: Feather,
  novel: Layers,
  poem: BookOpen,
  quote: Feather,
};

const frameClass: Record<string, string> = {
  none: "",
  thin: "border border-white/10",
  ornate: "border-2 border-white/20 shadow-lg",
};

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState({ works: 0, likes: 0, views: 0 });
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [commentContentId, setCommentContentId] = useState<string | null>(null);

  const targetUserId = userId || user?.id;
  const isOwnProfile = targetUserId === user?.id;

  useEffect(() => {
    if (!targetUserId) return;

    const fetchProfile = async () => {
      setLoading(true);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (profileData) setProfile(profileData as ProfileData);

      const { data: contentData } = await supabase
        .from("contents")
        .select("*")
        .eq("author_id", targetUserId)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      const rawItems = contentData || [];
      const contentIds = rawItems.map((c) => c.id);
      const totalViews = rawItems.reduce((sum, c) => sum + (c.view_count || 0), 0);
      const safeIds = contentIds.length > 0 ? contentIds : ["00000000-0000-0000-0000-000000000000"];

      const [
        { count: totalLikes },
        { count: followers },
        { count: following },
        likesRes,
        savesRes,
        commentsRes,
        userLikesRes,
        userSavesRes,
      ] = await Promise.all([
        supabase.from("likes").select("id", { count: "exact", head: true }).in("content_id", safeIds),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", targetUserId),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", targetUserId),
        supabase.from("likes").select("content_id").in("content_id", safeIds),
        supabase.from("saves").select("content_id").in("content_id", safeIds),
        supabase.from("comments").select("content_id").in("content_id", safeIds),
        user ? supabase.from("likes").select("content_id").eq("user_id", user.id).in("content_id", safeIds) : Promise.resolve({ data: [] }),
        user ? supabase.from("saves").select("content_id").eq("user_id", user.id).in("content_id", safeIds) : Promise.resolve({ data: [] }),
      ]);

      const countBy = (arr: { content_id: string }[] | null) => {
        const m = new Map<string, number>();
        (arr || []).forEach((r) => m.set(r.content_id, (m.get(r.content_id) || 0) + 1));
        return m;
      };
      const likesMap = countBy(likesRes.data);
      const savesMap = countBy(savesRes.data);
      const commentsMap = countBy(commentsRes.data);
      const userLikedSet = new Set((userLikesRes.data || []).map((r) => r.content_id));
      const userSavedSet = new Set((userSavesRes.data || []).map((r) => r.content_id));

      const items: ContentItem[] = rawItems.map((c) => ({
        id: c.id,
        title: c.title,
        body: c.body,
        caption: c.caption || null,
        content_type: c.content_type,
        cover_image_url: c.cover_image_url,
        style: (c.style as Record<string, unknown>) || null,
        created_at: c.created_at,
        view_count: c.view_count,
        status: c.status,
        tags: (c.tags || []) as string[],
        likes_count: likesMap.get(c.id) || 0,
        saves_count: savesMap.get(c.id) || 0,
        comments_count: commentsMap.get(c.id) || 0,
        is_liked: userLikedSet.has(c.id),
        is_saved: userSavedSet.has(c.id),
      }));

      setContents(items);
      setStats({ works: rawItems.length, likes: totalLikes || 0, views: totalViews });
      setFollowerCount(followers || 0);
      setFollowingCount(following || 0);

      if (user && !isOwnProfile) {
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId)
          .maybeSingle();
        setIsFollowing(!!followData);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [targetUserId, user, isOwnProfile]);

  const handleFollowToggle = async () => {
    if (!user || !targetUserId || isOwnProfile) return;
    setFollowLoading(true);
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetUserId);
      setIsFollowing(false);
      setFollowerCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: targetUserId });
      setIsFollowing(true);
      setFollowerCount((c) => c + 1);
      toast({ title: "Following", description: `You're now following ${profile?.display_name}` });
    }
    setFollowLoading(false);
  };

  const toggleLike = useCallback((contentId: string, liked: boolean) => {
    setContents((prev) =>
      prev.map((item) =>
        item.id === contentId
          ? { ...item, is_liked: liked, likes_count: item.likes_count + (liked ? 1 : -1) }
          : item
      )
    );
  }, []);

  const toggleSave = useCallback((contentId: string, saved: boolean) => {
    setContents((prev) =>
      prev.map((item) =>
        item.id === contentId
          ? { ...item, is_saved: saved, saves_count: item.saves_count + (saved ? 1 : -1) }
          : item
      )
    );
  }, []);

  const initials = profile?.display_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-5">
        <p className="text-muted-foreground">Profile not found.</p>
        <button onClick={() => navigate(-1)} className="text-accent label-uppercase text-xs">Go back</button>
      </div>
    );
  }

  const quotes = contents.filter((c) => c.content_type === "quote" || c.content_type === "inspiration");
  const writings = contents.filter((c) => c.content_type !== "quote" && c.content_type !== "inspiration");

  return (
    <AppShell>
      <div className="pb-24">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 sticky top-0 z-40 bg-background/95 backdrop-blur-sm">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-display text-base font-semibold">
            {profile.username ? `@${profile.username}` : "Profile"}
          </span>
          {isOwnProfile ? (
            <button onClick={() => navigate("/dashboard")} className="text-accent label-uppercase text-[10px] min-h-[44px] flex items-center">
              Dashboard
            </button>
          ) : (
            <div className="w-16" />
          )}
        </header>

        {/* Profile hero */}
        <section className="px-5 mb-6 animate-fade-up">
          <div className="flex items-center gap-4 mb-5">
            <Avatar className="w-20 h-20 ring-2 ring-accent/20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-accent/10 text-accent text-xl font-display font-bold">{initials}</AvatarFallback>
            </Avatar>

            {/* Stats row beside avatar */}
            <div className="flex-1 flex items-center justify-around">
              {[
                { label: "Works", value: stats.works },
                { label: "Followers", value: followerCount },
                { label: "Following", value: followingCount },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <span className="font-display text-lg font-bold tabular-nums block">{formatCount(value)}</span>
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Name & bio */}
          <div className="mb-4">
            <h1 className="font-display text-xl font-bold leading-tight">{profile.display_name}</h1>
            {profile.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
            {profile.persona && (
              <Badge variant="secondary" className="mt-1.5 label-uppercase text-[9px]">
                {personaLabels[profile.persona] || profile.persona}
              </Badge>
            )}
          </div>

          {profile.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 text-pretty">{profile.bio}</p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 mb-4">
            {isOwnProfile ? (
              <button
                onClick={() => navigate("/settings/profile")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm bg-secondary text-secondary-foreground text-sm font-medium active:scale-[0.97] transition-transform min-h-[44px]"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-sm text-sm font-medium min-h-[44px] transition-all active:scale-[0.97] ${
                    isFollowing ? "bg-secondary text-secondary-foreground" : "bg-accent text-accent-foreground"
                  }`}
                >
                  {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <button
                  className="px-4 py-2.5 rounded-sm bg-secondary text-secondary-foreground text-sm font-medium active:scale-[0.97] transition-transform min-h-[44px]"
                >
                  Message
                </button>
              </>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Joined {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" /> {formatCount(stats.likes)} likes received
            </span>
          </div>
        </section>

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <section className="px-5 mb-5 animate-fade-up" style={{ animationDelay: "0.05s" }}>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((interest) => (
                <span key={interest} className="bg-secondary text-secondary-foreground label-uppercase text-[9px] px-2.5 py-1 rounded-full">
                  {interest}
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="h-px bg-border" />

        {/* Content tabs */}
        <Tabs defaultValue="quotes" className="mt-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <TabsList className="bg-transparent w-full justify-start gap-0 p-0 h-auto border-b border-border rounded-none">
            <TabsTrigger
              value="quotes"
              className="flex-1 label-uppercase text-[10px] rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
            >
              Quotes ({quotes.length})
            </TabsTrigger>
            <TabsTrigger
              value="writings"
              className="flex-1 label-uppercase text-[10px] rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
            >
              Writings ({writings.length})
            </TabsTrigger>
          </TabsList>

          {/* Quotes grid */}
          <TabsContent value="quotes" className="mt-0 px-5 pt-4">
            {quotes.length === 0 ? (
              <div className="py-16 text-center">
                <Feather className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No quotes yet.</p>
                {isOwnProfile && (
                  <button onClick={() => navigate("/create/quote")} className="text-accent text-xs mt-2 min-h-[44px]">
                    Create your first quote →
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {quotes.map((item, idx) => (
                  <QuoteProfileCard
                    key={item.id}
                    item={item}
                    authorName={profile.display_name}
                    index={idx}
                    onToggleLike={(liked) => toggleLike(item.id, liked)}
                    onToggleSave={(saved) => toggleSave(item.id, saved)}
                    onComment={() => setCommentContentId(item.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Writings list */}
          <TabsContent value="writings" className="mt-0 px-5 pt-4">
            {writings.length === 0 ? (
              <div className="py-16 text-center">
                <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No published works yet.</p>
                {isOwnProfile && (
                  <button onClick={() => navigate("/create")} className="text-accent text-xs mt-2 min-h-[44px]">
                    Start writing →
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {writings.map((item) => (
                  <WritingCard
                    key={item.id}
                    item={item}
                    onToggleLike={(liked) => toggleLike(item.id, liked)}
                    onToggleSave={(saved) => toggleSave(item.id, saved)}
                    onComment={() => setCommentContentId(item.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <BottomNav />
      </div>

      <CommentSheet contentId={commentContentId} onClose={() => setCommentContentId(null)} />
    </AppShell>
  );
}

/* ─── Sub-components ──────────────────────── */

function QuoteProfileCard({
  item,
  authorName,
  index,
  onToggleLike,
  onToggleSave,
  onComment,
}: {
  item: ContentItem;
  authorName: string;
  index: number;
  onToggleLike: (liked: boolean) => void;
  onToggleSave: (saved: boolean) => void;
  onComment: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const s = item.style as { background?: string; font?: string; alignment?: string; frame?: string; bold?: boolean; italic?: boolean } | null;
  const hasStyle = s && s.background;
  const text = item.body || item.title;
  const len = text.length;
  const fontSize = len > 150 ? "text-[11px]" : len > 80 ? "text-xs" : "text-sm";
  const expandedFontSize = len > 200 ? "text-lg" : len > 100 ? "text-xl" : "text-2xl";

  return (
    <>
      <button
        onClick={() => setExpanded(true)}
        className="aspect-square rounded-sm overflow-hidden active:scale-[0.97] transition-transform animate-fade-up text-left"
        style={{ animationDelay: `${index * 0.04}s` }}
      >
        {hasStyle ? (
          <div
            className={`w-full h-full flex items-center justify-center p-4 ${frameClass[s.frame || "none"]}`}
            style={{ background: s.background }}
          >
            <p
              className={`${fontSize} leading-tight line-clamp-6 ${s.bold ? "font-bold" : "font-medium"} ${s.italic ? "italic" : ""} ${
                s.alignment === "left" ? "text-left" : s.alignment === "right" ? "text-right" : "text-center"
              }`}
              style={{ fontFamily: s.font, color: "white" }}
            >
              {text}
            </p>
          </div>
        ) : (
          <div className="w-full h-full bg-card border border-border flex items-center justify-center p-4">
            <p className="font-display text-sm font-medium italic text-center line-clamp-6 leading-snug">"{text}"</p>
          </div>
        )}
      </button>

      {/* Expanded overlay */}
      {expanded && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md animate-fade-in p-5"
          onClick={() => setExpanded(false)}
        >
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            {hasStyle ? (
              <div
                className={`rounded-sm overflow-hidden ${frameClass[s.frame || "none"]}`}
                style={{ background: s.background }}
              >
                <div className="flex items-center justify-center min-h-[280px] p-8">
                  <div
                    className={`max-w-sm w-full p-6 rounded-sm ${s.alignment === "left" ? "text-left" : s.alignment === "right" ? "text-right" : "text-center"}`}
                    style={{ backgroundColor: "rgba(0,0,0,0.15)", backdropFilter: "blur(8px)" }}
                  >
                    <p className="leading-none mb-3 opacity-30" style={{ fontFamily: s.font, fontSize: "2rem", color: "white" }}>❝</p>
                    <p
                      className={`leading-snug mb-4 ${expandedFontSize} ${s.bold ? "font-bold" : "font-semibold"} ${s.italic ? "italic" : ""}`}
                      style={{ fontFamily: s.font, color: "white" }}
                    >
                      {text}
                    </p>
                    <div className="w-10 h-px bg-white/20 mb-3" style={{
                      marginLeft: s.alignment === "center" ? "auto" : s.alignment === "right" ? "auto" : 0,
                      marginRight: s.alignment === "center" ? "auto" : s.alignment === "left" ? "auto" : 0,
                    }} />
                    <p className="text-sm opacity-60" style={{ fontFamily: s.font, color: "white" }}>— {authorName}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-sm p-8 border border-border">
                <p className={`font-display ${expandedFontSize} font-semibold leading-snug text-center italic`}>"{text}"</p>
                <p className="text-sm text-muted-foreground text-center mt-4">— {authorName}</p>
              </div>
            )}
            {item.caption && (
              <p className="text-sm text-muted-foreground text-center mt-3 italic">{item.caption}</p>
            )}
            <InteractionBar
              contentId={item.id}
              likesCount={item.likes_count}
              savesCount={item.saves_count}
              commentsCount={item.comments_count}
              isLiked={item.is_liked}
              isSaved={item.is_saved}
              onToggleLike={onToggleLike}
              onToggleSave={onToggleSave}
              onComment={onComment}
            />
          </div>
        </div>
      )}
    </>
  );
}

function WritingCard({
  item,
  onToggleLike,
  onToggleSave,
  onComment,
}: {
  item: ContentItem;
  onToggleLike: (liked: boolean) => void;
  onToggleSave: (saved: boolean) => void;
  onComment: () => void;
}) {
  const typeLabel = item.content_type.replace("_", " ");
  const Icon = typeIcons[item.content_type] || FileText;

  return (
    <article className="py-4 border-b border-border last:border-0">
      <div className="flex gap-4">
        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Icon className="w-3.5 h-3.5 text-accent flex-shrink-0" />
            <span className="label-uppercase text-[9px] text-muted-foreground">{typeLabel}</span>
            <span className="text-[9px] text-muted-foreground">
              · {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
          <h3 className="font-display text-base font-bold leading-tight mb-1 line-clamp-2">{item.title}</h3>
          {item.body && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 text-pretty">{item.body}</p>
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="flex gap-1.5 mt-2">
              {item.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] text-accent">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Cover image thumbnail */}
        {item.cover_image_url && (
          <div className="w-20 h-20 rounded-sm overflow-hidden flex-shrink-0">
            <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <InteractionBar
        contentId={item.id}
        likesCount={item.likes_count}
        savesCount={item.saves_count}
        commentsCount={item.comments_count}
        isLiked={item.is_liked}
        isSaved={item.is_saved}
        onToggleLike={onToggleLike}
        onToggleSave={onToggleSave}
        onComment={onComment}
      />
    </article>
  );
}
