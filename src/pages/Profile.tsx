import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Edit2, BookOpen, Heart, Eye, UserPlus, UserCheck, Users } from "lucide-react";
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
  content_type: string;
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

const frameClass: Record<string, string> = {
  none: "",
  thin: "border border-white/10",
  ornate: "border-2 border-white/20",
};

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

      // Parallel fetches for counts and user state
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
        supabase.from("likes").select("id", { count: "exact", head: true }).in("content_id", contentIds.length > 0 ? contentIds : ["00000000-0000-0000-0000-000000000000"]),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", targetUserId),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", targetUserId),
        supabase.from("likes").select("content_id").in("content_id", contentIds.length > 0 ? contentIds : ["00000000-0000-0000-0000-000000000000"]),
        supabase.from("saves").select("content_id").in("content_id", contentIds.length > 0 ? contentIds : ["00000000-0000-0000-0000-000000000000"]),
        supabase.from("comments").select("content_id").in("content_id", contentIds.length > 0 ? contentIds : ["00000000-0000-0000-0000-000000000000"]),
        user ? supabase.from("likes").select("content_id").eq("user_id", user.id).in("content_id", contentIds.length > 0 ? contentIds : ["00000000-0000-0000-0000-000000000000"]) : Promise.resolve({ data: [] }),
        user ? supabase.from("saves").select("content_id").eq("user_id", user.id).in("content_id", contentIds.length > 0 ? contentIds : ["00000000-0000-0000-0000-000000000000"]) : Promise.resolve({ data: [] }),
      ]);

      // Build count maps
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
        content_type: c.content_type,
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

  const quotes = contents.filter((c) => c.content_type === "quote");
  const nonQuotes = contents.filter((c) => c.content_type !== "quote");

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

        {/* Profile card */}
        <section className="px-5 mb-6 animate-fade-up">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="w-16 h-16 md:w-20 md:h-20 ring-2 ring-border">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary text-lg font-display font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl md:text-2xl font-bold leading-tight truncate">{profile.display_name}</h1>
              {profile.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
              {profile.persona && (
                <Badge variant="secondary" className="mt-1 label-uppercase text-[9px]">
                  {personaLabels[profile.persona] || profile.persona}
                </Badge>
              )}
            </div>
            {isOwnProfile ? (
              <button onClick={() => navigate("/settings/profile")} className="p-2 rounded-sm bg-secondary text-secondary-foreground active:scale-95 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Edit2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-medium min-h-[44px] transition-all active:scale-95 ${
                  isFollowing ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
                }`}
              >
                {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>

          {profile.bio && <p className="text-sm text-muted-foreground leading-relaxed mb-4 text-pretty">{profile.bio}</p>}

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Joined {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          </div>

          <div className="flex items-center gap-6 md:gap-10">
            {[
              { icon: BookOpen, label: "Works", value: stats.works },
              { icon: Heart, label: "Likes", value: stats.likes },
              { icon: Eye, label: "Views", value: stats.views },
              { icon: Users, label: "Followers", value: followerCount },
              { icon: Users, label: "Following", value: followingCount },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-display text-lg font-bold tabular-nums">{value}</span>
                </div>
                <span className="label-uppercase text-[9px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <section className="px-5 mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((interest) => (
                <span key={interest} className="bg-secondary text-secondary-foreground label-uppercase text-[9px] px-2.5 py-1 rounded-sm">
                  {interest}
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="h-px bg-border mx-5" />

        {/* Content tabs */}
        <Tabs defaultValue="published" className="px-5 mt-4 animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <TabsList className="bg-secondary/50 w-full justify-start gap-0 p-0 h-auto">
            <TabsTrigger value="published" className="label-uppercase text-[10px] rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5">
              Published
            </TabsTrigger>
            <TabsTrigger value="quotes" className="label-uppercase text-[10px] rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5">
              Quotes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="published" className="mt-4 space-y-4">
            {nonQuotes.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No published works yet.</p>
              </div>
            ) : (
              nonQuotes.map((item) => (
                <article key={item.id} className="py-3">
                  <p className="label-uppercase text-[10px] text-muted-foreground mb-1">{item.content_type.replace("_", " ")}</p>
                  <h3 className="font-display text-lg font-bold mb-1">{item.title}</h3>
                  {item.body && <p className="text-sm text-muted-foreground line-clamp-2">{item.body}</p>}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-2">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] text-accent">#{tag}</span>
                      ))}
                    </div>
                  )}
                  <InteractionBar
                    contentId={item.id}
                    likesCount={item.likes_count}
                    savesCount={item.saves_count}
                    commentsCount={item.comments_count}
                    isLiked={item.is_liked}
                    isSaved={item.is_saved}
                    onToggleLike={(liked) => toggleLike(item.id, liked)}
                    onToggleSave={(saved) => toggleSave(item.id, saved)}
                    onComment={() => setCommentContentId(item.id)}
                  />
                </article>
              ))
            )}
          </TabsContent>

          <TabsContent value="quotes" className="mt-4">
            {quotes.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No quotes yet.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {quotes.map((item) => {
                  const s = item.style as { background?: string; font?: string; alignment?: string; frame?: string; bold?: boolean; italic?: boolean } | null;
                  const hasStyle = s && s.background;
                  const len = (item.body || item.title).length;
                  const fontSize = len > 200 ? "text-sm" : len > 100 ? "text-base" : "text-lg";

                  return (
                    <article key={item.id} className="animate-fade-up">
                      {hasStyle ? (
                        <div
                          className={`rounded-sm overflow-hidden ${frameClass[s.frame || "none"]}`}
                          style={{ background: s.background }}
                        >
                          <div className="flex items-center justify-center min-h-[200px] p-5">
                            <div
                              className={`max-w-sm w-full p-5 rounded-sm ${s.alignment === "left" ? "text-left" : s.alignment === "right" ? "text-right" : "text-center"}`}
                              style={{ backgroundColor: "rgba(0,0,0,0.15)", backdropFilter: "blur(8px)" }}
                            >
                              <p className="leading-none mb-2 opacity-30" style={{ fontFamily: s.font, fontSize: "1.8rem", color: "white" }}>❝</p>
                              <p className={`leading-snug mb-3 ${fontSize} ${s.bold ? "font-bold" : "font-semibold"} ${s.italic ? "italic" : ""}`} style={{ fontFamily: s.font, color: "white" }}>
                                {item.body || item.title}
                              </p>
                              <p className="text-xs opacity-60" style={{ fontFamily: s.font, color: "white" }}>{profile.display_name}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-card rounded-sm p-6">
                          <p className="font-display text-xl font-semibold leading-snug text-center italic">"{item.body || item.title}"</p>
                        </div>
                      )}
                      <InteractionBar
                        contentId={item.id}
                        likesCount={item.likes_count}
                        savesCount={item.saves_count}
                        commentsCount={item.comments_count}
                        isLiked={item.is_liked}
                        isSaved={item.is_saved}
                        onToggleLike={(liked) => toggleLike(item.id, liked)}
                        onToggleSave={(saved) => toggleSave(item.id, saved)}
                        onComment={() => setCommentContentId(item.id)}
                      />
                    </article>
                  );
                })}
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
