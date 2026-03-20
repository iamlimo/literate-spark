import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, PenLine, GraduationCap, BookOpen, Paintbrush } from "lucide-react";
import OnboardingHeader from "@/components/OnboardingHeader";

const personas = [
  {
    icon: PenLine,
    name: "The Scribe",
    tag: "Writer/Author",
    desc: "Dedicated to the craft of long-form prose, essays, and the rhythmic flow of ink on digital vellum.",
  },
  {
    icon: GraduationCap,
    name: "The Scholar",
    tag: "Researcher/Academic",
    desc: "Analyzing historical contexts and deep-diving into the archives of human knowledge and critique.",
  },
  {
    icon: BookOpen,
    name: "The Curator",
    tag: "Reader/Enthusiast",
    desc: "A bibliophile with an eye for quality. You live to discover hidden gems and organize the world's wisdom.",
  },
  {
    icon: Paintbrush,
    name: "The Artiste",
    tag: "Comic Creator/Illustrator",
    desc: "Merging visual storytelling with narrative depth. You create worlds where the image speaks volumes.",
  },
];

export default function OnboardingPersona() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OnboardingHeader />

      <main className="flex-1 overflow-y-auto px-6 pt-4 pb-24">
        <h1 className="font-display text-[2.5rem] leading-[1.05] font-bold italic text-center text-balance animate-fade-up">
          How will you<br />contribute?
        </h1>
        <p className="label-uppercase text-center text-muted-foreground mt-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Choose your primary identity to<br />personalize your feed.
        </p>

        <div className="mt-8 space-y-4">
          {personas.map((p, i) => {
            const Icon = p.icon;
            const isSelected = selected === i;
            return (
              <button
                key={p.name}
                onClick={() => setSelected(i)}
                className={`w-full text-left p-6 rounded-sm transition-all animate-fade-up ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-card hover:bg-secondary"
                }`}
                style={{ animationDelay: `${0.15 + i * 0.08}s` }}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${
                    isSelected ? "bg-primary-foreground/20" : "bg-secondary"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                <p className={`label-uppercase text-xs mt-1 ${isSelected ? "text-accent" : "text-accent"}`}>
                  {p.tag}
                </p>
                <p className={`mt-3 text-sm leading-relaxed ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {p.desc}
                </p>
              </button>
            );
          })}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-6 py-4 border-t border-border bg-background">
        <button
          onClick={() => navigate("/onboarding")}
          className="flex items-center gap-2 text-muted-foreground label-uppercase text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        <button
          onClick={() => navigate("/onboarding/interests")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm label-uppercase text-xs active:scale-[0.97] transition-transform"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}
