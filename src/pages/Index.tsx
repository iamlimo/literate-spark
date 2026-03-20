import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import libraryImg from "@/assets/library-interior.jpg";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero */}
      <div className="relative flex-1 flex flex-col">
        <div className="absolute inset-0">
          <img src={libraryImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-end px-6 pb-8 pt-16">
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
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-4 rounded-sm label-uppercase text-xs active:scale-[0.97] transition-transform"
            >
              Begin Your Journey <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-4 border border-border rounded-sm label-uppercase text-xs hover:bg-secondary transition-colors active:scale-[0.97]"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
