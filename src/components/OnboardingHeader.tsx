import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OnboardingHeader({ showSkip = true }: { showSkip?: boolean }) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        <span className="font-display text-lg font-semibold italic">The Archivist</span>
      </div>
      {showSkip && (
        <button
          onClick={() => navigate("/feed")}
          className="label-uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip
        </button>
      )}
    </header>
  );
}
