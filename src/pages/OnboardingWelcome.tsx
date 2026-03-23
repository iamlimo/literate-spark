import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import OnboardingHeader from "@/components/OnboardingHeader";
import libraryImg from "@/assets/library-interior.jpg";

export default function OnboardingWelcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OnboardingHeader />

      <main className="flex-1 flex flex-col px-6 pt-4 max-w-lg mx-auto w-full">
        <div className="bg-card rounded-sm px-6 pt-10 pb-8 flex-1 flex flex-col">
          <p className="label-uppercase text-accent mb-3" style={{ animationDelay: "0.1s" }}>
            The Modern Archivist
          </p>
          <h1
            className="font-display text-[2.75rem] leading-[1.05] font-bold italic text-balance animate-fade-up"
          >
            Welcome to<br />The Digital<br />Atelier
          </h1>

          <p className="mt-6 text-base leading-relaxed text-muted-foreground max-w-[28ch] animate-fade-up" style={{ animationDelay: "0.15s" }}>
            The modern archive for writers, readers, and intellects. A sanctuary for deep thought and the quiet sanctity of your personal library.
          </p>

          <button
            onClick={() => navigate("/onboarding/persona")}
            className="mt-8 inline-flex items-center gap-3 bg-primary text-primary-foreground px-7 py-4 rounded-sm label-uppercase text-sm hover:opacity-90 transition-opacity active:scale-[0.97] self-start animate-fade-up min-h-[48px]"
            style={{ animationDelay: "0.25s" }}
          >
            Begin Your Journey
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="mt-auto pt-10 flex gap-12 animate-fade-up" style={{ animationDelay: "0.35s" }}>
            <div>
              <p className="label-uppercase text-muted-foreground text-[10px] mb-1">Volume</p>
              <p className="font-display italic text-sm">I. Commencement</p>
            </div>
            <div>
              <p className="label-uppercase text-muted-foreground text-[10px] mb-1">Established</p>
              <p className="font-display italic text-sm">MMXXIV</p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-sm overflow-hidden animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <img
            src={libraryImg}
            alt="A grand private library with warm golden lighting"
            className="w-full h-48 object-cover"
          />
        </div>
      </main>

      <footer className="flex items-center justify-between px-6 py-4 border-t border-border max-w-lg mx-auto w-full safe-bottom">
        <button className="flex items-center gap-2 text-muted-foreground label-uppercase text-xs min-h-[44px]">
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        <button
          onClick={() => navigate("/onboarding/persona")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm label-uppercase text-xs active:scale-[0.97] transition-transform min-h-[44px]"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}
