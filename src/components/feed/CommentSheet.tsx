import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Comment {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}

interface CommentSheetProps {
  contentId: string | null;
  onClose: () => void;
}

export default function CommentSheet({ contentId, onClose }: CommentSheetProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!contentId) {
      setComments([]);
      return;
    }

    const fetchComments = async () => {
      setLoading(true);
      const { data: commentsData } = await supabase
        .from("comments")
        .select("id, body, created_at, user_id")
        .eq("content_id", contentId)
        .order("created_at", { ascending: true });

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        setLoading(false);
        return;
      }

      const userIds = [...new Set(commentsData.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      setComments(
        commentsData.map((c) => {
          const profile = profileMap.get(c.user_id);
          return {
            ...c,
            display_name: profile?.display_name || "Unknown",
            avatar_url: profile?.avatar_url || null,
          };
        })
      );
      setLoading(false);
    };

    fetchComments();
  }, [contentId]);

  const handleSubmit = async () => {
    if (!user || !contentId || !body.trim()) return;
    setSubmitting(true);

    const { data } = await supabase
      .from("comments")
      .insert({ user_id: user.id, content_id: contentId, body: body.trim() })
      .select("id, body, created_at, user_id")
      .single();

    if (data) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      setComments((prev) => [
        ...prev,
        {
          ...data,
          display_name: profile?.display_name || "You",
          avatar_url: profile?.avatar_url || null,
        },
      ]);
    }

    setBody("");
    setSubmitting(false);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "now";
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Sheet open={!!contentId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="max-h-[70vh] flex flex-col rounded-t-xl">
        <SheetHeader>
          <SheetTitle className="font-display text-base">Comments</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-3 space-y-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No comments yet. Start the conversation.
            </p>
          ) : (
            comments.map((c) => {
              const initials = c.display_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="w-7 h-7 shrink-0">
                    <AvatarImage src={c.avatar_url || undefined} />
                    <AvatarFallback className="bg-secondary text-[10px] font-display font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{c.display_name}</span>
                      <span className="text-[10px] text-muted-foreground">{formatTime(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{c.body}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {user && (
          <div className="flex items-center gap-2 pt-3 border-t border-border">
            <Input
              ref={inputRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
              placeholder="Add a comment…"
              className="flex-1 text-sm"
              disabled={submitting}
            />
            <button
              onClick={handleSubmit}
              disabled={!body.trim() || submitting}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-accent disabled:text-muted-foreground transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
