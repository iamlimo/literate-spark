import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import OnboardingHeader from "@/components/OnboardingHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const topics = [
  "Philosophy", "Afrofuturism", "Ancient History", "Modern Poetry",
  "Tech Ethics", "Scientific Research", "Comic Art", "Short Stories",
  "Yoruba Culture", "CBT Prep", "Journalism", "Microbiology",
  "Creative Writing", "African Literature",
];

export default function OnboardingInterests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggle = (topic: string) => {
    setSelected((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleContinue = async () => {
    if (selected.length < 3 || !user) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ interests: selected })
      .eq("user_id", user.id);
    setSaving(false);

    if (error) {
      toast({ title: "Error saving interests", description: error.message, variant: "destructive" });
    } else {
      navigate("/feed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OnboardingHeader />

      <main className="flex-1 overflow-y-auto px-6 pt-4 pb-24 max-w-lg mx-auto w-full">
        <h1 className="font-display text-[2.5rem] leading-[1.05] font-bold italic text-balance animate-fade-up">
          What inspires<br />you?
        </h1>
        <p className="label-uppercase text-muted-foreground mt-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Select at least 3 topics to follow.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {topics.map((topic, i) => {
            const isSelected = selected.includes(topic);
            return (
              <button
                key={topic}
                onClick={() => toggle(topic)}
                className={`px-5 py-3 rounded-full label-uppercase text-xs transition-all active:scale-[0.96] animate-fade-up min-h-[44px] ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
                style={{ animationDelay: `${0.1 + i * 0.03}s` }}
              >
                {topic}
              </button>
            );
          })}
        </div>

        <div className="mt-16 text-center animate-fade-up" style={{ animationDelay: "0.6s" }}>
          <p className="font-display italic text-3xl text-muted-foreground/40">
            Curating the<br />intellect.
          </p>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-6 py-4 border-t border-border bg-background safe-bottom">
        <div className="max-w-lg mx-auto w-full flex items-center justify-between">
          <button
            onClick={() => navigate("/onboarding/persona")}
            className="flex items-center gap-2 text-muted-foreground label-uppercase text-xs min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={handleContinue}
            disabled={selected.length < 3 || saving}
            className={`flex items-center gap-2 px-6 py-3 rounded-sm label-uppercase text-xs transition-all active:scale-[0.97] min-h-[44px] ${
              selected.length >= 3
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {saving ? "Saving…" : "Continue"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
