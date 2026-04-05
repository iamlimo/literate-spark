import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, BookOpen, Heart, Eye, FileText, Clock,
  TrendingUp, Plus, Settings, LogOut, ChevronRight, Shield,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import BottomNav from "@/components/BottomNav";
import AppShell from "@/components/AppShell";

interface ProfileData {
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  persona: string | null;
}

interface ContentItem {
  id: string;
  title: string;
  body: string | null;
  content_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  view_count: number | null;
  tags: string[] | null;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review: "bg-accent/15 text-accent",
  published: "bg-green-100 text-green-700",
  rejected: "bg-destructive/15 text-destructive",
};

const personaLabels: Record<string, string> = {
  scribe: "Scribe",
  scholar: "Scholar",
  curator: "Curator",
  artiste: "Artiste",
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, views: 0, likes: 0 });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      setLoading(true);

      const { data: p } = await supabase
        .from("profiles")
        .select("display_name, username, avatar_url, persona")
        .eq("user_id", user.id)
        .maybeSingle();
      if (p) setProfile(p);

      const { data: c } = await supabase
        .from("contents")
        .select("*")
        .eq("author_id", user.id)
        .order("updated_at", { ascending: false });

      const items = (c || []) as ContentItem[];
      setContents(items);

      const published = items.filter((i) => i.status === "published");
      const drafts = items.filter((i) => i.status === "draft");
      const totalViews = items.reduce((s, i) => s + (i.view_count || 0), 0);

      const { count: likesCount } = await supabase
        .from("likes")
        .select("id", { count: "exact", head: true })
        .in("content_id", items.map((i) => i.id));

      setStats({
        total: items.length,
        published: published.length,
        drafts: drafts.length,
        views: totalViews,
        likes: likesCount || 0,
      });

      setLoading(false);
    };

    const checkAdmin = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    };

    fetch();
    checkAdmin();
  }, [user]);

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

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <AppShell>
      <div className="pb-24">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 sticky top-0 z-40 bg-background/95 backdrop-blur-sm">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-display text-base font-semibold">Dashboard</span>
          <button onClick={() => navigate("/profile")} className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Avatar className="w-7 h-7">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-[10px] bg-secondary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </header>

        {/* Welcome */}
        <section className="px-5 mb-6 animate-fade-up">
          <p className="label-uppercase text-[10px] text-muted-foreground mb-1">Welcome back</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight">
            {profile?.display_name}
          </h1>
          {profile?.persona && (
            <Badge variant="secondary" className="mt-1.5 label-uppercase text-[9px]">
              {personaLabels[profile.persona] || profile.persona}
            </Badge>
          )}
        </section>

        {/* Stats cards */}
        <section className="px-5 mb-6 animate-fade-up" style={{ animationDelay: "0.08s" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: FileText, label: "Total Works", value: stats.total, sub: `${stats.published} published` },
              { icon: Eye, label: "Total Views", value: stats.views, sub: "all time" },
              { icon: Heart, label: "Total Likes", value: stats.likes, sub: "across works" },
              { icon: Clock, label: "Drafts", value: stats.drafts, sub: "in progress" },
            ].map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="bg-card rounded-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="label-uppercase text-[9px] text-muted-foreground">{label}</span>
                </div>
                <p className="font-display text-2xl font-bold tabular-nums">{value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Publishing progress */}
        {stats.total > 0 && (
          <section className="px-5 mb-6 animate-fade-up" style={{ animationDelay: "0.12s" }}>
            <div className="bg-card rounded-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="label-uppercase text-[10px] text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Publishing Rate
                </span>
                <span className="text-sm font-medium tabular-nums">
                  {Math.round((stats.published / stats.total) * 100)}%
                </span>
              </div>
              <Progress value={(stats.published / stats.total) * 100} className="h-1.5" />
            </div>
          </section>
        )}

        {/* Content management */}
        <section className="px-5 animate-fade-up" style={{ animationDelay: "0.16s" }}>
          <Tabs defaultValue="all">
            <TabsList className="bg-secondary/50 w-full justify-start gap-0 p-0 h-auto">
              {["all", "drafts", "published"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="label-uppercase text-[10px] rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5"
                >
                  {tab === "all" ? `All (${stats.total})` : tab === "drafts" ? `Drafts (${stats.drafts})` : `Published (${stats.published})`}
                </TabsTrigger>
              ))}
            </TabsList>

            {["all", "drafts", "published"].map((tab) => {
              const filtered = tab === "all"
                ? contents
                : contents.filter((c) => (tab === "drafts" ? c.status === "draft" : c.status === "published"));

              return (
                <TabsContent key={tab} value={tab} className="mt-4 space-y-1">
                  {filtered.length === 0 ? (
                    <div className="py-12 text-center">
                      <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {tab === "drafts" ? "No drafts yet." : tab === "published" ? "Nothing published yet." : "No content yet."}
                      </p>
                      <button
                        onClick={() => navigate("/create")}
                        className="mt-3 text-accent label-uppercase text-[10px] flex items-center gap-1 mx-auto min-h-[44px]"
                      >
                        <Plus className="w-3 h-3" /> Create something
                      </button>
                    </div>
                  ) : (
                    filtered.map((item) => (
                      <article
                        key={item.id}
                        className="flex items-center gap-3 py-3 border-b border-border last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`label-uppercase text-[8px] px-1.5 py-0.5 rounded-sm ${statusColors[item.status] || ""}`}>
                              {item.status.replace("_", " ")}
                            </span>
                            <span className="label-uppercase text-[8px] text-muted-foreground">
                              {item.content_type.replace("_", " ")}
                            </span>
                          </div>
                          <h4 className="font-display text-sm font-semibold truncate">{item.title}</h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Updated {new Date(item.updated_at).toLocaleDateString()}
                            {item.view_count ? ` • ${item.view_count} views` : ""}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </article>
                    ))
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </section>

        {/* Quick actions */}
        <section className="px-5 mt-8 space-y-1 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <p className="label-uppercase text-[10px] text-muted-foreground mb-2">Quick Actions</p>
          {[
            { icon: Plus, label: "Create New Content", action: () => navigate("/create") },
            { icon: BookOpen, label: "View Public Profile", action: () => navigate("/profile") },
            { icon: Settings, label: "Account Settings", action: () => navigate("/settings/profile") },
            { icon: LogOut, label: "Sign Out", action: handleSignOut, destructive: true },
          ].map(({ icon: Icon, label, action, destructive }) => (
            <button
              key={label}
              onClick={action}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm active:scale-[0.98] transition-transform min-h-[48px] ${
                destructive ? "text-destructive" : "text-foreground hover:bg-secondary/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm flex-1 text-left">{label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </section>

        <BottomNav />
      </div>
    </AppShell>
  );
}
