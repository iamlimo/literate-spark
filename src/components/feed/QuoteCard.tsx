import InteractionBar from "./InteractionBar";

interface QuoteCardProps {
  id: string;
  body: string;
  authorName: string;
  tags: string[];
  createdAt: string;
  likesCount: number;
  savesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  onToggleLike: (liked: boolean) => void;
  onToggleSave: (saved: boolean) => void;
}

export default function QuoteCard({
  id,
  body,
  authorName,
  tags,
  createdAt,
  likesCount,
  savesCount,
  commentsCount,
  isLiked,
  isSaved,
  onToggleLike,
  onToggleSave,
}: QuoteCardProps) {
  const textSize = body.length > 200 ? "text-lg" : body.length > 100 ? "text-xl" : "text-2xl md:text-3xl";

  return (
    <article className="animate-fade-up">
      <div className="bg-card rounded-sm p-6 md:p-8">
        <p className={`font-display ${textSize} font-semibold leading-snug text-center text-balance italic`}>
          "{body}"
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{authorName}</p>
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
      />
    </article>
  );
}
