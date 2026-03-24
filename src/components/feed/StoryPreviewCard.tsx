import InteractionBar from "./InteractionBar";

interface StoryPreviewCardProps {
  id: string;
  title: string;
  body: string | null;
  contentType: string;
  coverImageUrl: string | null;
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

export default function StoryPreviewCard({
  id,
  title,
  body,
  contentType,
  coverImageUrl,
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
}: StoryPreviewCardProps) {
  const typeLabel = contentType.replace("_", " ");

  return (
    <article className="animate-fade-up">
      {coverImageUrl && (
        <div className="rounded-sm overflow-hidden mb-3">
          <img src={coverImageUrl} alt={title} className="w-full h-48 md:h-56 object-cover" />
        </div>
      )}
      <p className="label-uppercase text-[10px] text-muted-foreground mb-1.5">
        {typeLabel} • {authorName} • {new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </p>
      <h3 className="font-display text-2xl font-bold leading-tight mb-2">{title}</h3>
      {body && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 text-pretty mb-1">
          {body}
        </p>
      )}
      {tags.length > 0 && (
        <div className="flex gap-2 mt-1">
          {tags.slice(0, 3).map((t) => (
            <span key={t} className="text-[10px] text-accent">#{t}</span>
          ))}
        </div>
      )}
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
