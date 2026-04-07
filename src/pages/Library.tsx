import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Bookmark, Clock, ShoppingBag, PenTool, Feather, FileText, Layers, ArrowLeft, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import AppShell from "@/components/AppShell";

interface LibraryItem {
  id: string;
  content_id: string;
  title: string;
  body: string | null;
  content_type: string;
  cover_image_url: string | null;
  author_name: string;
  author_id: string;
  created_at: string;
  saved_at?: string;
  last_read_at?: string;
  progress?: number;
  status?: string;
}

const typeIcons: Record<string, typeof FileText> = {
  article: FileText,
  short_story: Feather,
  novel: Layers,
  poem: BookOpen,
  quote: Feather,
};

const typeLabels: Record<string, string> = {
  article: "Article",
  short_story: "Story",
  novel: "Book",
  poem: "Poem",
  quote: "Quote",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function LibraryItemCard({ item, onRemove, showProgress }: { item: LibraryItem; onRemove?: () => void; showProgress?: boolean }) {
  const navigate = useNavigate();
  const Icon = typeIcons[item.content_type] || FileText;

  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-border last:border-0 group animate-fade-up">
      {/* Type icon / cover */}
      <div className="w-12 h-14 rounded-sm bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
        {item.cover_image_url ? (
          <img src={item.cover_image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <Icon className="w-5 h-5 text-muted-foreground/50" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <button
          onClick={() => navigate(`/profile/${item.author_id}`)}
          className="text-left w-full"
        >
          <h4 className="font-display text-sm font-semibold truncate leading-tight">{item.title}</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {item.author_name} · {typeLabels[item.content_type] || item.content_type}
          </p>
        </button>
        {showProgress && item.progress !== undefined && item.progress > 0 && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${item.progress}%` }} />
            </div>
            <span className="text-[9px] text-muted-foreground tabular-nums">{item.progress}%</span>
          </div>
        )}
        <p className="text-[10px] text-muted-foreground mt-1">
          {item.saved_at && `Saved ${formatDate(item.saved_at)}`}
          {item.last_read_at && `Read ${formatDate(item.last_read_at)}`}
          {item.status && <Badge variant="secondary" className="ml-2 text-[8px] label-uppercase">{item.status}</Badge>}
        </p>
      </div>

      {onRemove && (
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 min-w-[36px] min-h-[36px] flex items-center justify-center"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function Library() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("saved");
  const [savedItems, setSavedItems] = useState<LibraryItem[]>([]);
  const [historyItems, setHistoryItems] = useState<LibraryItem[]>([]);
  const [myWorks, setMyWorks] = useState<LibraryItem[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    await Promise.all([fetchSaved(), fetchHistory(), fetchMyWorks(), fetchPurchases()]);
    setLoading(false);
  };

  const fetchSaved = async () => {
    if (!user) return;
    const { data: saves } = await supabase
      .from("saves")
      .select("content_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!saves || saves.length === 0) { setSavedItems([]); return; }

    const ids = saves.map(s => s.content_id);
    const { data: contents } = await supabase.from("contents").select("*").in("id", ids);
    if (!contents) { setSavedItems([]); return; }

    const authorIds = [...new Set(contents.map(c => c.author_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", authorIds);
    const nameMap = new Map((profiles || []).map(p => [p.user_id, p.display_name]));
    const saveMap = new Map(saves.map(s => [s.content_id, s.created_at]));

    setSavedItems(contents.map(c => ({
      id: c.id,
      content_id: c.id,
      title: c.title,
      body: c.body,
      content_type: c.content_type,
      cover_image_url: c.cover_image_url,
      author_name: nameMap.get(c.author_id) || "Unknown",
      author_id: c.author_id,
      created_at: c.created_at,
      saved_at: saveMap.get(c.id) || c.created_at,
    })));
  };

  const fetchHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("reading_history")
      .select("content_id, progress, last_read_at")
      .eq("user_id", user.id)
      .order("last_read_at", { ascending: false })
      .limit(50);
    if (!data || data.length === 0) { setHistoryItems([]); return; }

    const ids = data.map(d => d.content_id);
    const { data: contents } = await supabase.from("contents").select("*").in("id", ids);
    if (!contents) { setHistoryItems([]); return; }

    const authorIds = [...new Set(contents.map(c => c.author_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", authorIds);
    const nameMap = new Map((profiles || []).map(p => [p.user_id, p.display_name]));
    const histMap = new Map(data.map(d => [d.content_id, d]));

    setHistoryItems(contents.map(c => {
      const h = histMap.get(c.id);
      return {
        id: c.id,
        content_id: c.id,
        title: c.title,
        body: c.body,
        content_type: c.content_type,
        cover_image_url: c.cover_image_url,
        author_name: nameMap.get(c.author_id) || "Unknown",
        author_id: c.author_id,
        created_at: c.created_at,
        last_read_at: h?.last_read_at,
        progress: h?.progress || 0,
      };
    }));
  };

  const fetchMyWorks = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("contents")
      .select("*")
      .eq("author_id", user.id)
      .order("updated_at", { ascending: false });
    if (!data) { setMyWorks([]); return; }

    setMyWorks(data.map(c => ({
      id: c.id,
      content_id: c.id,
      title: c.title,
      body: c.body,
      content_type: c.content_type,
      cover_image_url: c.cover_image_url,
      author_name: "You",
      author_id: c.author_id,
      created_at: c.created_at,
      status: c.status,
    })));
  };

  const fetchPurchases = async () => {
    if (!user) return;
    const { data: purchases } = await supabase
      .from("purchases")
      .select("listing_id, created_at")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });
    if (!purchases || purchases.length === 0) { setPurchaseItems([]); return; }

    const listingIds = purchases.map(p => p.listing_id);
    const { data: listings } = await supabase.from("bookstore_listings").select("id, content_id").in("id", listingIds);
    if (!listings || listings.length === 0) { setPurchaseItems([]); return; }

    const contentIds = listings.map(l => l.content_id);
    const { data: contents } = await supabase.from("contents").select("*").in("id", contentIds);
    if (!contents) { setPurchaseItems([]); return; }

    const authorIds = [...new Set(contents.map(c => c.author_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", authorIds);
    const nameMap = new Map((profiles || []).map(p => [p.user_id, p.display_name]));

    setPurchaseItems(contents.map(c => ({
      id: c.id,
      content_id: c.id,
      title: c.title,
      body: c.body,
      content_type: c.content_type,
      cover_image_url: c.cover_image_url,
      author_name: nameMap.get(c.author_id) || "Unknown",
      author_id: c.author_id,
      created_at: c.created_at,
    })));
  };

  const removeSave = async (contentId: string) => {
    if (!user) return;
    await supabase.from("saves").delete().eq("user_id", user.id).eq("content_id", contentId);
    setSavedItems(prev => prev.filter(i => i.content_id !== contentId));
  };

  const tabs = [
    { key: "saved", icon: Bookmark, label: "Saved", count: savedItems.length },
    { key: "history", icon: Clock, label: "History", count: historyItems.length },
    { key: "purchases", icon: ShoppingBag, label: "Purchased", count: purchaseItems.length },
    { key: "works", icon: PenTool, label: "My Works", count: myWorks.length },
  ];

  const emptyStates: Record<string, { icon: typeof Bookmark; title: string; desc: string }> = {
    saved: { icon: Bookmark, title: "No saved items", desc: "Bookmark content from the feed to build your collection." },
    history: { icon: Clock, title: "No reading history", desc: "Your reading journey will appear here." },
    purchases: { icon: ShoppingBag, title: "No purchases yet", desc: "Content you buy from the market will show here." },
    works: { icon: PenTool, title: "No works yet", desc: "Start creating to see your works here." },
  };

  const currentItems = activeTab === "saved" ? savedItems : activeTab === "history" ? historyItems : activeTab === "purchases" ? purchaseItems : myWorks;

  return (
    <AppShell>
      <div className="pb-24">
        <header className="flex items-center gap-3 px-5 py-4 sticky top-0 z-40 bg-background/95 backdrop-blur-sm max-w-3xl mx-auto">
          <button onClick={() => navigate(-1)} className="min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-display text-base font-semibold">Library</span>
        </header>

        <div className="max-w-3xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent w-full justify-start gap-0 p-0 h-auto border-b border-border rounded-none px-5">
              {tabs.map(({ key, icon: Icon, label, count }) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="label-uppercase text-[10px] rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-3 flex items-center gap-1.5"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {count > 0 && <span className="bg-accent/10 text-accent text-[8px] px-1.5 py-0.5 rounded-full tabular-nums">{count}</span>}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="px-5 pt-2">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : currentItems.length === 0 ? (
                (() => {
                  const empty = emptyStates[activeTab];
                  const EmptyIcon = empty.icon;
                  return (
                    <div className="text-center py-20 animate-fade-up">
                      <EmptyIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="font-display text-lg font-bold mb-2">{empty.title}</h3>
                      <p className="text-sm text-muted-foreground max-w-[28ch] mx-auto">{empty.desc}</p>
                      {activeTab === "works" && (
                        <button onClick={() => navigate("/create")} className="text-accent text-xs mt-4 min-h-[44px]">
                          Start creating →
                        </button>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div>
                  {currentItems.map((item) => (
                    <LibraryItemCard
                      key={item.id}
                      item={item}
                      onRemove={activeTab === "saved" ? () => removeSave(item.content_id) : undefined}
                      showProgress={activeTab === "history"}
                    />
                  ))}
                </div>
              )}
            </div>
          </Tabs>
        </div>

        <BottomNav />
      </div>
    </AppShell>
  );
}
