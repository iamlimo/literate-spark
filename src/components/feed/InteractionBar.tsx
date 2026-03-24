import { useState } from "react";
import { Heart, Bookmark, MessageSquare, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface InteractionBarProps {
  contentId: string;
  likesCount: number;
  savesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  onToggleLike: (liked: boolean) => void;
  onToggleSave: (saved: boolean) => void;
  onComment?: () => void;
}

export default function InteractionBar({
  contentId,
  likesCount,
  savesCount,
  commentsCount,
  isLiked,
  isSaved,
  onToggleLike,
  onToggleSave,
  onComment,
}: InteractionBarProps) {
  const { user } = useAuth();
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [saveAnimating, setSaveAnimating] = useState(false);

  const handleLike = async () => {
    if (!user) return;
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 300);

    if (isLiked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("content_id", contentId);
      onToggleLike(false);
    } else {
      await supabase.from("likes").insert({ user_id: user.id, content_id: contentId });
      onToggleLike(true);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaveAnimating(true);
    setTimeout(() => setSaveAnimating(false), 300);

    if (isSaved) {
      await supabase.from("saves").delete().eq("user_id", user.id).eq("content_id", contentId);
      onToggleSave(false);
    } else {
      await supabase.from("saves").insert({ user_id: user.id, content_id: contentId });
      onToggleSave(true);
      toast({ title: "Saved to your archive", description: "You can find this in your saved collection." });
    }
  };

  return (
    <div className="flex items-center justify-between pt-3">
      <div className="flex items-center gap-1">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 min-h-[44px] min-w-[44px] justify-center px-2 transition-colors ${
            isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Heart
            className={`w-[18px] h-[18px] transition-transform ${likeAnimating ? "scale-125" : ""} ${isLiked ? "fill-current" : ""}`}
          />
          {likesCount > 0 && <span className="text-xs tabular-nums">{likesCount}</span>}
        </button>

        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 min-h-[44px] min-w-[44px] justify-center px-2 transition-colors ${
            isSaved ? "text-accent" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bookmark
            className={`w-[18px] h-[18px] transition-transform ${saveAnimating ? "scale-125" : ""} ${isSaved ? "fill-current" : ""}`}
          />
          {savesCount > 0 && <span className="text-xs tabular-nums">{savesCount}</span>}
        </button>

        {onComment && (
          <button
            onClick={onComment}
            className="flex items-center gap-1.5 min-h-[44px] min-w-[44px] justify-center px-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageSquare className="w-[18px] h-[18px]" />
            {commentsCount > 0 && <span className="text-xs tabular-nums">{commentsCount}</span>}
          </button>
        )}
      </div>

      <button className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
        <Share2 className="w-[18px] h-[18px]" />
      </button>
    </div>
  );
}
