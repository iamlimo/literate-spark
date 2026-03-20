import { X, Palette, Type, Square } from "lucide-react";
import { useNavigate } from "react-router-dom";
import quoteBg from "@/assets/quote-bg.jpg";

export default function QuoteEditor() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <X className="w-5 h-5" />
          </button>
          <div>
            <p className="font-display font-bold text-sm">Digital Atelier</p>
            <p className="label-uppercase text-[9px] text-muted-foreground">Composition No. 42</p>
          </div>
        </div>
        <button className="bg-primary text-primary-foreground px-5 py-2 rounded-full label-uppercase text-xs active:scale-[0.97] transition-transform">
          Publish
        </button>
      </header>

      {/* Canvas */}
      <div className="flex-1 mx-5 mb-4 rounded-sm overflow-hidden relative animate-fade-in">
        <img src={quoteBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative flex items-center justify-center min-h-[65vh]">
          <div className="bg-background/30 backdrop-blur-sm rounded-sm p-8 mx-6 max-w-sm w-full text-center">
            <p className="font-display text-5xl text-muted-foreground/40 leading-none mb-4">❝</p>
            <p className="font-display italic text-2xl leading-snug mb-8">
              Everything you can imagine is real.
            </p>
            <div className="w-12 h-px bg-border mx-auto mb-4" />
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-[10px]">•••</span>
              </div>
              <div className="text-left">
                <p className="label-uppercase text-[9px] text-muted-foreground">Author</p>
                <p className="font-display italic text-sm">The Archivist</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-around py-4 border-t border-border bg-background">
        {[
          { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 8l4-4 4 4M8 4v12M20 16l-4 4-4-4m4 4V8" /></svg>, label: "Canvas" },
          { icon: <Palette className="w-5 h-5" />, label: "Style", active: true },
          { icon: <Type className="w-5 h-5" />, label: "Fonts" },
          { icon: <Square className="w-5 h-5" />, label: "Frame" },
        ].map((t) => (
          <button
            key={t.label}
            className={`flex flex-col items-center gap-1 px-4 py-1 ${
              t.active ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {t.active ? (
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                  {t.icon}
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-foreground rounded-full" />
              </div>
            ) : t.icon}
            <span className="label-uppercase text-[9px]">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
