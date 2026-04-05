import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Users, FileText, BarChart3, Settings,
  Shield, ShieldOff, Trash2, CheckCircle, XCircle,
  Search, ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";

interface UserRow {
  user_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  persona: string | null;
  is_suspended: boolean | null;
  created_at: string;
}

interface ContentRow {
  id: string;
  title: string;
  content_type: string;
  status: string;
  created_at: string;
  author_id: string;
  view_count: number | null;
  author_name?: string;
}

interface PlatformStats {
  totalUsers: number;
  totalContent: number;
  published: number;
  drafts: number;
  pendingReview: number;
  totalLikes: number;
  totalFollows: number;
  totalComments: number;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review: "bg-accent/15 text-accent",
  published: "bg-green-100 text-green-700",
  rejected: "bg-destructive/15 text-destructive",
};

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [contents, setContents] = useState<ContentRow[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [adminUserIds, setAdminUserIds] = useState<Set<string>>(new Set());
  const [userSearch, setUserSearch] = useState("");
  const [contentFilter, setContentFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadUsers(), loadContents(), loadAdminRoles()]);
    setLoading(false);
  };

  const loadStats = async () => {
    const [
      { count: totalUsers },
      { count: totalContent },
      { count: published },
      { count: drafts },
      { count: pendingReview },
      { count: totalLikes },
      { count: totalFollows },
      { count: totalComments },
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("contents").select("id", { count: "exact", head: true }),
      supabase.from("contents").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("contents").select("id", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("contents").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
      supabase.from("likes").select("id", { count: "exact", head: true }),
      supabase.from("follows").select("id", { count: "exact", head: true }),
      supabase.from("comments").select("id", { count: "exact", head: true }),
    ]);
    setStats({
      totalUsers: totalUsers || 0,
      totalContent: totalContent || 0,
      published: published || 0,
      drafts: drafts || 0,
      pendingReview: pendingReview || 0,
      totalLikes: totalLikes || 0,
      totalFollows: totalFollows || 0,
      totalComments: totalComments || 0,
    });
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, username, avatar_url, persona, is_suspended, created_at")
      .order("created_at", { ascending: false });
    setUsers((data as UserRow[]) || []);
  };

  const loadContents = async () => {
    const { data } = await supabase
      .from("contents")
      .select("id, title, content_type, status, created_at, author_id, view_count")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) {
      const authorIds = [...new Set(data.map((c) => c.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", authorIds);
      const nameMap = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);
      setContents(data.map((c) => ({ ...c, author_name: nameMap.get(c.author_id) || "Unknown" })));
    }
  };

  const loadAdminRoles = async () => {
    const { data } = await supabase.from("user_roles").select("user_id, role").eq("role", "admin");
    setAdminUserIds(new Set(data?.map((r) => r.user_id) || []));
  };

  const toggleSuspend = async (userId: string, currentlySuspended: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_suspended: !currentlySuspended })
      .eq("user_id", userId);
    if (error) { toast.error("Failed to update user"); return; }
    toast.success(currentlySuspended ? "User unsuspended" : "User suspended");
    loadUsers();
  };

  const toggleAdmin = async (userId: string) => {
    const isAdmin = adminUserIds.has(userId);
    if (isAdmin) {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      toast.success("Admin role removed");
    } else {
      await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      toast.success("Admin role granted");
    }
    loadAdminRoles();
  };

  const updateContentStatus = async (contentId: string, status: string) => {
    const { error } = await supabase.from("contents").update({ status }).eq("id", contentId);
    if (error) { toast.error("Failed to update content"); return; }
    toast.success(`Content ${status}`);
    loadContents();
    loadStats();
  };

  const deleteContent = async (contentId: string) => {
    const { error } = await supabase.from("contents").delete().eq("id", contentId);
    if (error) { toast.error("Failed to delete content"); return; }
    toast.success("Content deleted");
    loadContents();
    loadStats();
  };

  const filteredUsers = users.filter(
    (u) =>
      !userSearch ||
      u.display_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredContents = contents.filter(
    (c) => contentFilter === "all" || c.status === contentFilter
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="pb-8 max-w-3xl mx-auto">
        <header className="flex items-center gap-3 px-5 py-4 sticky top-0 z-40 bg-background/95 backdrop-blur-sm">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-display text-base font-semibold">Admin Panel</span>
        </header>

        <Tabs defaultValue="dashboard" className="px-5">
          <TabsList className="bg-secondary/50 w-full justify-start gap-0 p-0 h-auto mb-6">
            {[
              { value: "dashboard", icon: BarChart3, label: "Overview" },
              { value: "users", icon: Users, label: "Users" },
              { value: "content", icon: FileText, label: "Content" },
              { value: "settings", icon: Settings, label: "Settings" },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="label-uppercase text-[10px] rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2.5 flex items-center gap-1.5"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            {stats && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Total Users", value: stats.totalUsers },
                    { label: "Total Content", value: stats.totalContent },
                    { label: "Published", value: stats.published },
                    { label: "Pending Review", value: stats.pendingReview },
                    { label: "Drafts", value: stats.drafts },
                    { label: "Total Likes", value: stats.totalLikes },
                    { label: "Total Follows", value: stats.totalFollows },
                    { label: "Total Comments", value: stats.totalComments },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-card rounded-sm p-4">
                      <p className="label-uppercase text-[9px] text-muted-foreground mb-1">{label}</p>
                      <p className="font-display text-2xl font-bold tabular-nums">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="space-y-1">
                {filteredUsers.map((u) => (
                  <div key={u.user_id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={u.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px] bg-secondary font-medium">
                        {u.display_name?.slice(0, 2).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-semibold truncate">{u.display_name}</span>
                        {adminUserIds.has(u.user_id) && (
                          <Badge variant="secondary" className="text-[8px] label-uppercase">Admin</Badge>
                        )}
                        {u.is_suspended && (
                          <Badge variant="destructive" className="text-[8px] label-uppercase">Suspended</Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        @{u.username || "—"} · Joined {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleSuspend(u.user_id, !!u.is_suspended)}
                        title={u.is_suspended ? "Unsuspend" : "Suspend"}
                      >
                        {u.is_suspended ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleAdmin(u.user_id)}
                        title={adminUserIds.has(u.user_id) ? "Remove admin" : "Make admin"}
                      >
                        <Shield className={`w-3.5 h-3.5 ${adminUserIds.has(u.user_id) ? "text-accent" : ""}`} />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">No users found.</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {["all", "draft", "pending_review", "published", "rejected"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setContentFilter(f)}
                    className={`label-uppercase text-[9px] px-3 py-1.5 rounded-sm transition-colors ${
                      contentFilter === f ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {f.replace("_", " ")}
                  </button>
                ))}
              </div>
              <div className="space-y-1">
                {filteredContents.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`label-uppercase text-[8px] px-1.5 py-0.5 rounded-sm ${statusColors[c.status] || ""}`}>
                          {c.status.replace("_", " ")}
                        </span>
                        <span className="label-uppercase text-[8px] text-muted-foreground">
                          {c.content_type.replace("_", " ")}
                        </span>
                      </div>
                      <h4 className="font-display text-sm font-semibold truncate">{c.title}</h4>
                      <p className="text-[10px] text-muted-foreground">
                        by {c.author_name} · {new Date(c.created_at).toLocaleDateString()}
                        {c.view_count ? ` · ${c.view_count} views` : ""}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {c.status !== "published" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateContentStatus(c.id, "published")} title="Publish">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                        </Button>
                      )}
                      {c.status !== "rejected" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateContentStatus(c.id, "rejected")} title="Reject">
                          <XCircle className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteContent(c.id)} title="Delete">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredContents.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">No content found.</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <div className="bg-card rounded-sm p-5">
                <h3 className="font-display text-sm font-semibold mb-3">Role Management</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Admin roles can be assigned from the Users tab. Admins have full access to content moderation, user management, and platform settings.
                </p>
                <div className="flex items-center gap-3">
                  <div className="bg-secondary rounded-sm px-3 py-2">
                    <p className="label-uppercase text-[9px] text-muted-foreground">Total Admins</p>
                    <p className="font-display text-lg font-bold">{adminUserIds.size}</p>
                  </div>
                  <div className="bg-secondary rounded-sm px-3 py-2">
                    <p className="label-uppercase text-[9px] text-muted-foreground">Total Users</p>
                    <p className="font-display text-lg font-bold">{stats?.totalUsers || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-sm p-5">
                <h3 className="font-display text-sm font-semibold mb-3">Platform Overview</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Content Types:</span> Articles, Stories, Books, Poems, Quotes</div>
                  <div><span className="text-muted-foreground">Auth:</span> Email + Username</div>
                  <div><span className="text-muted-foreground">Moderation:</span> Manual review</div>
                  <div><span className="text-muted-foreground">Monetization:</span> Bookstore listings</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
