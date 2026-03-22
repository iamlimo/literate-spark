import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Link as LinkIcon, Edit2, BookOpen, Heart, Eye, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import QuoteCanvas from "@/components/quote/QuoteCanvas";

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
}

const personaLabels: Record<string, string> = {
  scribe: "Scribe",
  scholar: "Scholar",
  curator: "Curator",
  artiste: "Artiste",
};

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState({ works: 0, likes: 0, views: 0 });
  const [loading, setLoading] = useState(true);

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
        .eq("status", isOwnProfile ? "published" : "published")
        .order("created_at", { ascending: false });

      const items = (contentData || []) as ContentItem[];
      setContents(items);

      const totalViews = items.reduce((sum, c) => sum + (c.view_count || 0), 0);

      const { count: likesCount } = await supabase
        .from("likes")
        .select("id", { count: "exact", head: true })
        .in("content_id", items.map((c) => c.id));

      setStats({
        works: items.length,
        likes: likesCount || 0,
        views: totalViews,
      });

      setLoading(false);
    };

    fetchProfile();
  }, [targetUserId, isOwnProfile]);

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
        <button onClick={() => navigate(-1)} className="text-accent label-uppercase text-xs">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 sticky top-0 z-40 bg-background/95 backdrop-blur-sm">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-display text-base font-semibold">
          {profile.username ? `@${profile.username}` : "Profile"}
        </span>
        {isOwnProfile ? (
          <button
            onClick={() => navigate("/dashboard")}
            className="text-accent label-uppercase text-[10px]"
          >
            Dashboard
          </button>
        ) : (
          <div className="w-16" />
        )}
      </header>

      {/* Profile card */}
      <section className="px-5 mb-6 animate-fade-up">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-16 h-16 ring-2 ring-border">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-secondary text-lg font-display font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-bold leading-tight truncate">
              {profile.display_name}
            </h1>
            {profile.username && (
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
            )}
            {profile.persona && (
              <Badge variant="secondary" className="mt-1 label-uppercase text-[9px]">
                {personaLabels[profile.persona] || profile.persona}
              </Badge>
            )}
          </div>
          {isOwnProfile && (
            <button
              onClick={() => navigate("/settings/profile")}
              className="p-2 rounded-sm bg-secondary text-secondary-foreground active:scale-95 transition-transform"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {profile.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 text-pretty">
            {profile.bio}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Joined {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          {[
            { icon: BookOpen, label: "Works", value: stats.works },
            { icon: Heart, label: "Likes", value: stats.likes },
            { icon: Eye, label: "Views", value: stats.views },
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
              <span
                key={interest}
                className="bg-secondary text-secondary-foreground label-uppercase text-[9px] px-2.5 py-1 rounded-sm"
              >
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
          <TabsTrigger
            value="published"
            className="label-uppercase text-[10px] rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5"
          >
            Published
          </TabsTrigger>
          <TabsTrigger
            value="quotes"
            className="label-uppercase text-[10px] rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5"
          >
            Quotes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="mt-4 space-y-4">
          {contents.filter((c) => c.content_type !== "quote").length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No published works yet.</p>
            </div>
          ) : (
            contents
              .filter((c) => c.content_type !== "quote")
              .map((item) => (
                <article key={item.id} className="py-3">
                  <p className="label-uppercase text-[10px] text-muted-foreground mb-1">
                    {item.content_type.replace("_", " ")}
                  </p>
                  <h3 className="font-display text-lg font-bold mb-1">{item.title}</h3>
                  {item.body && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.body}</p>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-2">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] text-accent">#{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.view_count || 0}</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </article>
              ))
          )}
        </TabsContent>

        <TabsContent value="quotes" className="mt-4">
          {contents.filter((c) => c.content_type === "quote").length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No quotes yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {contents
                .filter((c) => c.content_type === "quote")
                .map((item) => (
                  <div key={item.id} className="rounded-sm overflow-hidden aspect-square">
                    <QuoteCanvas
                      text={item.body || item.title}
                      authorName={profile.display_name}
                      style={(item.style as any) || {}}
                      compact
                    />
                  </div>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <BottomNav />
    </div>
  );
}
