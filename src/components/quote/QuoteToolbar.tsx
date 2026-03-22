import { Palette, Type, Square, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from "lucide-react";
import type { QuoteStyle, ToolbarPanel } from "@/hooks/useQuoteEditor";
import { BACKGROUNDS, FONTS } from "@/hooks/useQuoteEditor";

interface QuoteToolbarProps {
  activePanel: ToolbarPanel;
  setActivePanel: (p: ToolbarPanel) => void;
  style: QuoteStyle;
  updateStyle: (patch: Partial<QuoteStyle>) => void;
  charCount: number;
}

const tabs: { key: ToolbarPanel; icon: React.ReactNode; label: string }[] = [
  {
    key: "canvas",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 8l4-4 4 4M8 4v12M20 16l-4 4-4-4m4 4V8" />
      </svg>
    ),
    label: "Canvas",
  },
  { key: "style", icon: <Palette className="w-5 h-5" />, label: "Style" },
  { key: "fonts", icon: <Type className="w-5 h-5" />, label: "Fonts" },
  { key: "frame", icon: <Square className="w-5 h-5" />, label: "Frame" },
];

export default function QuoteToolbar({ activePanel, setActivePanel, style, updateStyle, charCount }: QuoteToolbarProps) {
  return (
    <div className="border-t border-border bg-background">
      {/* Panel content */}
      <div className="px-5 py-3 min-h-[72px] animate-fade-in" key={activePanel}>
        {activePanel === "canvas" && (
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {BACKGROUNDS.map((bg, i) => (
              <button
                key={i}
                onClick={() => updateStyle({ background: bg })}
                className={`w-10 h-10 rounded-full shrink-0 transition-transform active:scale-95 ${
                  style.background === bg ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""
                }`}
                style={{ background: bg }}
              />
            ))}
          </div>
        )}

        {activePanel === "style" && (
          <div className="flex items-center gap-4">
            <div className="flex bg-secondary rounded-sm overflow-hidden">
              {(["left", "center", "right"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => updateStyle({ alignment: a })}
                  className={`p-2.5 transition-colors ${
                    style.alignment === a ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {a === "left" ? <AlignLeft className="w-4 h-4" /> : a === "center" ? <AlignCenter className="w-4 h-4" /> : <AlignRight className="w-4 h-4" />}
                </button>
              ))}
            </div>
            <button
              onClick={() => updateStyle({ bold: !style.bold })}
              className={`p-2.5 rounded-sm transition-colors ${style.bold ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateStyle({ italic: !style.italic })}
              className={`p-2.5 rounded-sm transition-colors ${style.italic ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
            >
              <Italic className="w-4 h-4" />
            </button>
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">{charCount}/280</span>
          </div>
        )}

        {activePanel === "fonts" && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FONTS.map((f) => (
              <button
                key={f.label}
                onClick={() => updateStyle({ font: f.value })}
                className={`px-4 py-2 rounded-full text-sm shrink-0 transition-all active:scale-95 ${
                  style.font === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
                style={{ fontFamily: f.value }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {activePanel === "frame" && (
          <div className="flex gap-3">
            {(["none", "thin", "ornate"] as const).map((fr) => (
              <button
                key={fr}
                onClick={() => updateStyle({ frame: fr })}
                className={`flex-1 py-2.5 rounded-sm text-xs label-uppercase transition-all active:scale-95 ${
                  style.frame === fr
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {fr === "none" ? "None" : fr === "thin" ? "Minimal" : "Ornate"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex items-center justify-around py-3 border-t border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActivePanel(t.key)}
            className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
              activePanel === t.key ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {activePanel === t.key ? (
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                  {t.icon}
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-foreground rounded-full" />
              </div>
            ) : (
              t.icon
            )}
            <span className="label-uppercase text-[9px]">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
