import { Check, Cloud, Loader2 } from "lucide-react";

interface DraftIndicatorProps {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved?: Date | null;
}

export default function DraftIndicator({ status, lastSaved }: DraftIndicatorProps) {
  if (status === "idle" && !lastSaved) return null;

  return (
    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground animate-fade-in">
      {status === "saving" && (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Saving…</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Cloud className="w-3 h-3 text-accent" />
          <span>Draft saved</span>
        </>
      )}
      {status === "error" && (
        <span className="text-destructive">Save failed</span>
      )}
      {status === "idle" && lastSaved && (
        <>
          <Check className="w-3 h-3 text-muted-foreground/60" />
          <span>Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </>
      )}
    </div>
  );
}
