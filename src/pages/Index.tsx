import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import libraryImg from "@/assets/library-interior.jpg";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background lg:flex-row">
      {/* Hero image — on desktop it's the right column */}
      <div className="relative flex-1 flex flex-col lg:order-2 lg:flex-none lg:w-1/2">
        <div className="absolute inset-0 lg:relative lg:h-full">
          <img src={libraryImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40 lg:bg-gradient-to-r lg:from-background lg:via-background/60 lg:to-transparent" />
        </div>

        {/* Mobile-only hero content */}
        <div className="relative z-10 flex-1 flex flex-col justify-end px-6 pb-8 pt-16 lg:hidden">
          <div className="flex items-center gap-2 mb-6 animate-fade-up">
            <BookOpen className="w-5 h-5" />
            <span className="font-display italic text-lg">The Digital Atelier</span>
          </div>

          <h1 className="font-display text-[2.75rem] leading-[1.05] font-bold text-balance animate-fade-up" style={{ animationDelay: "0.1s" }}>
            A Sanctuary for<br />Deep Thought
          </h1>

          <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-[32ch] animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Write, read, publish, and monetize your literary works. Join a community of writers, scholars, curators, and artistes.
          </p>

          <div className="flex gap-3 mt-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <button
              onClick={() => navigate("/signup")}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-4 rounded-sm label-uppercase text-xs active:scale-[0.97] transition-transform min-h-[48px]"
            >
              Begin Your Journey <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-4 border border-border rounded-sm label-uppercase text-xs hover:bg-secondary transition-colors active:scale-[0.97] min-h-[48px]"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Desktop hero content — left column */}
      <div className="hidden lg:flex lg:order-1 lg:w-1/2 lg:flex-col lg:justify-center lg:px-16 xl:px-24 lg:py-16">
        <div className="flex items-center gap-2 mb-8 animate-fade-up">
          <BookOpen className="w-6 h-6" />
          <span className="font-display italic text-xl">The Digital Atelier</span>
        </div>

        <h1 className="font-display text-5xl xl:text-6xl leading-[1.05] font-bold text-balance animate-fade-up" style={{ animationDelay: "0.1s" }}>
          A Sanctuary for Deep Thought
        </h1>

        <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-[42ch] animate-fade-up" style={{ animationDelay: "0.2s" }}>
          Write, read, publish, and monetize your literary works. Join a community of writers, scholars, curators, and artistes.
        </p>

        <div className="flex gap-4 mt-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <button
            onClick={() => navigate("/signup")}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-sm label-uppercase text-sm active:scale-[0.97] transition-transform"
          >
            Begin Your Journey <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-4 border border-border rounded-sm label-uppercase text-sm hover:bg-secondary transition-colors active:scale-[0.97]"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
