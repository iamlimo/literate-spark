import { useNavigate } from "react-router-dom";
import InteractionBar from "./InteractionBar";

interface ThoughtCardProps {
  id: string;
  title: string;
  body: string | null;
  authorId: string;
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
  onComment?: () => void;
}

export default function ThoughtCard({
  id,
  title,
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
  onToggleLike,
  onToggleSave,
  onComment,
}: ThoughtCardProps) {
  const navigate = useNavigate();

  return (
    <article className="animate-fade-up">
      <p className="label-uppercase text-[10px] text-muted-foreground mb-1.5">
        Thought •{" "}
        <button
          onClick={() => navigate(`/profile/${authorId}`)}
          className="hover:text-accent transition-colors"
        >
          {authorName}
        </button>
      </p>
      <h3 className="font-display text-xl font-bold mb-2">{title}</h3>
      {body && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 text-pretty">
          {body}
        </p>
      )}
      {tags.length > 0 && (
        <div className="flex gap-2 mt-2">
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
        onComment={onComment}
      />
    </article>
  );
}
