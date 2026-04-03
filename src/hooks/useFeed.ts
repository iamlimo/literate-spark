import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FeedItem {
  id: string;
  title: string;
  body: string | null;
  caption: string | null;
  content_type: string;
  cover_image_url: string | null;
  tags: string[];
  created_at: string;
  author_id: string;
  author_name: string;
  author_username: string | null;
  author_avatar: string | null;
  view_count: number;
  likes_count: number;
  saves_count: number;
  comments_count: number;
  is_liked: boolean;
  is_saved: boolean;
  score: number;
  style: Record<string, unknown> | null;
}

type FeedTab = "foryou" | "following" | "clubs";

export function useFeed(tab: FeedTab) {
  const { user } = useAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    setLoading(true);

    // Fetch published content
    let query = supabase
      .from("contents")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: contents } = await query;
    if (!contents || contents.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    const contentIds = contents.map((c) => c.id);
    const authorIds = [...new Set(contents.map((c) => c.author_id))];

    // Parallel fetches
    const [profilesRes, likesRes, savesRes, commentsRes, userLikesRes, userSavesRes, followingRes] =
      await Promise.all([
        supabase.from("profiles").select("user_id, display_name, username, avatar_url").in("user_id", authorIds),
        supabase.from("likes").select("content_id").in("content_id", contentIds),
        supabase.from("saves").select("content_id").in("content_id", contentIds),
        supabase.from("comments").select("content_id").in("content_id", contentIds),
        user
          ? supabase.from("likes").select("content_id").eq("user_id", user.id).in("content_id", contentIds)
          : Promise.resolve({ data: [] }),
        user
          ? supabase.from("saves").select("content_id").eq("user_id", user.id).in("content_id", contentIds)
          : Promise.resolve({ data: [] }),
        user
          ? supabase.from("follows").select("following_id").eq("follower_id", user.id)
          : Promise.resolve({ data: [] }),
      ]);

    const profileMap = new Map(
      (profilesRes.data || []).map((p) => [p.user_id, p])
    );

    // Count maps
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
    const followingSet = new Set((followingRes.data || []).map((r) => r.following_id));

    // Get user interests for relevance scoring
    let userInterests: string[] = [];
    let userClubIds: string[] = [];
    if (user) {
      const [profileRes, clubsRes] = await Promise.all([
        supabase.from("profiles").select("interests").eq("user_id", user.id).maybeSingle(),
        supabase.from("club_members").select("club_id").eq("user_id", user.id),
      ]);
      userInterests = (profileRes.data?.interests || []) as string[];
      userClubIds = (clubsRes.data || []).map((c) => c.club_id);
    }

    const now = Date.now();

    let feedItems: FeedItem[] = contents.map((c) => {
      const profile = profileMap.get(c.author_id);
      const lc = likesMap.get(c.id) || 0;
      const sc = savesMap.get(c.id) || 0;
      const cc = commentsMap.get(c.id) || 0;

      // Engagement: saves weighted 2x
      const engagement = Math.min((lc + sc * 2 + cc) / 20, 1);

      // Relevance: tag match with user interests
      const tags = (c.tags || []) as string[];
      const tagOverlap = userInterests.length > 0
        ? tags.filter((t) => userInterests.some((i) => i.toLowerCase() === t.toLowerCase())).length / Math.max(tags.length, 1)
        : 0.5;

      // Recency: decay over 7 days
      const ageHours = (now - new Date(c.created_at).getTime()) / 3600000;
      const recency = Math.max(0, 1 - ageHours / 168);

      // Creator affinity
      const affinity = followingSet.has(c.author_id) ? 1 : 0;

      // Content type priority bonus
      const typePriority: Record<string, number> = {
        quote: 0.15,
        inspiration: 0.12,
        poem: 0.1,
        short_story: 0.05,
      };

      const score =
        engagement * 0.4 +
        tagOverlap * 0.3 +
        recency * 0.2 +
        affinity * 0.1 +
        (typePriority[c.content_type] || 0);

      return {
        id: c.id,
        title: c.title,
        body: c.body,
        caption: c.caption || null,
        content_type: c.content_type,
        cover_image_url: c.cover_image_url,
        tags,
        created_at: c.created_at,
        author_id: c.author_id,
        author_name: profile?.display_name || "Unknown",
        author_username: profile?.username || null,
        author_avatar: profile?.avatar_url || null,
        view_count: c.view_count || 0,
        likes_count: lc,
        saves_count: sc,
        comments_count: cc,
        is_liked: userLikedSet.has(c.id),
        is_saved: userSavedSet.has(c.id),
        score,
        style: (c.style as Record<string, unknown>) || null,
      };
    });

    // Filter by tab
    if (tab === "following") {
      feedItems = feedItems
        .filter((item) => followingSet.has(item.author_id))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (tab === "clubs") {
      // For clubs, we'd need a club_id on contents — for now show items from followed authors in clubs
      feedItems = feedItems
        .filter((item) => followingSet.has(item.author_id))
        .sort((a, b) => b.score - a.score);
    } else {
      // For You — ranked by score
      feedItems.sort((a, b) => b.score - a.score);
    }

    setItems(feedItems);
    setLoading(false);
  }, [user, tab]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const toggleLike = (contentId: string, liked: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === contentId
          ? { ...item, is_liked: liked, likes_count: item.likes_count + (liked ? 1 : -1) }
          : item
      )
    );
  };

  const toggleSave = (contentId: string, saved: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === contentId
          ? { ...item, is_saved: saved, saves_count: item.saves_count + (saved ? 1 : -1) }
          : item
      )
    );
  };

  return { items, loading, toggleLike, toggleSave, refetch: fetchFeed };
}
