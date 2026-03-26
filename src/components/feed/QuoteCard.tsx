import { useNavigate } from "react-router-dom";
import InteractionBar from "./InteractionBar";

interface QuoteStyle {
  background?: string;
  font?: string;
  alignment?: "left" | "center" | "right";
  frame?: "none" | "thin" | "ornate";
  bold?: boolean;
  italic?: boolean;
}

interface QuoteCardProps {
  id: string;
  body: string;
  authorId: string;
  authorName: string;
  tags: string[];
  createdAt: string;
  likesCount: number;
  savesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  style?: QuoteStyle | null;
  onToggleLike: (liked: boolean) => void;
  onToggleSave: (saved: boolean) => void;
  onComment?: () => void;
}

const frameClass: Record<string, string> = {
  none: "",
  thin: "border border-white/10",
  ornate: "border-2 border-white/20 shadow-[inset_0_0_0_4px_rgba(255,255,255,0.03)]",
};

export default function QuoteCard({
  id,
  body,
  authorId,
  authorName,
  tags,
  createdAt,
  likesCount,
  savesCount,
  commentsCount,
  isLiked,
  isSaved,
  style,
  onToggleLike,
  onToggleSave,
  onComment,
}: QuoteCardProps) {
  const navigate = useNavigate();
  const hasStyle = style && style.background;

  const len = body.length;
  const fontSize = len > 200 ? "text-sm" : len > 100 ? "text-base" : "text-lg";
  const fontWeight = style?.bold ? "font-bold" : "font-semibold";
  const fontStyle = style?.italic ? "italic" : "";
  const alignClass = style?.alignment === "left" ? "text-left" : style?.alignment === "right" ? "text-right" : "text-center";

  return (
    <article className="animate-fade-up">
      {hasStyle ? (
        /* Styled card with user's background/font/frame */
        <div
          className={`rounded-sm overflow-hidden ${frameClass[style.frame || "none"]}`}
          style={{ background: style.background }}
        >
          <div className="flex items-center justify-center min-h-[220px] p-6">
            <div
              className={`max-w-sm w-full p-6 rounded-sm ${alignClass}`}
              style={{
                backgroundColor: "rgba(0,0,0,0.15)",
                backdropFilter: "blur(8px)",
              }}
            >
              <p className="leading-none mb-3 opacity-30" style={{ fontFamily: style.font, fontSize: "2rem", color: "white" }}>
                ❝
              </p>
              <p
                className={`leading-snug mb-4 ${fontSize} ${fontWeight} ${fontStyle}`}
                style={{ fontFamily: style.font, color: "white" }}
              >
                {body}
              </p>
              <div className="w-10 h-px bg-white/20 mb-3" style={{
                marginLeft: style.alignment === "center" ? "auto" : style.alignment === "right" ? "auto" : 0,
                marginRight: style.alignment === "center" ? "auto" : style.alignment === "left" ? "auto" : 0,
              }} />
              <p className="text-xs opacity-60" style={{ fontFamily: style.font, color: "white" }}>
                {authorName}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Plain typography card fallback */
        <div className="bg-card rounded-sm p-6 md:p-8">
          <p className={`font-display ${len > 200 ? "text-lg" : len > 100 ? "text-xl" : "text-2xl md:text-3xl"} font-semibold leading-snug text-center text-balance italic`}>
            "{body}"
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(`/profile/${authorId}`)}
            className="text-sm font-medium hover:text-accent transition-colors text-left"
          >
            {authorName}
          </button>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="label-uppercase text-[9px] text-muted-foreground">Quote</span>
            {tags.slice(0, 2).map((t) => (
              <span key={t} className="text-[10px] text-accent">#{t}</span>
            ))}
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>
      <InteractionBar
        contentId={id}
        likesCount={likesCount}
        savesCount={savesCount}
        commentsCount={commentsCount}
        isLiked={isLiked}
        isSaved={isSaved}
        onToggleLike={onToggleLike}
        onToggleSave={onToggleSave}
        onComment={onComment}
      />
    </article>
  );
}
