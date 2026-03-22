import type { QuoteStyle } from "@/hooks/useQuoteEditor";

export interface QuoteCanvasProps {
  text: string;
  authorName: string;
  style: QuoteStyle;
  isDark?: boolean;
  editable?: boolean;
  onTextChange?: (val: string) => void;
  onTap?: () => void;
  compact?: boolean;
}

const frameClass: Record<QuoteStyle["frame"], string> = {
  none: "",
  thin: "border border-current/10",
  ornate: "border-2 border-current/20 shadow-[inset_0_0_0_4px_rgba(0,0,0,0.03)]",
};

export default function QuoteCanvas({
  text,
  authorName,
  style,
  isDark,
  editable = false,
  onTextChange,
  onTap,
}: QuoteCanvasProps) {
  const textColor = isDark ? "hsl(38 33% 96%)" : "hsl(20 20% 12%)";
  const mutedColor = isDark ? "hsla(38,33%,96%,0.4)" : "hsla(20,20%,12%,0.3)";
  const borderColor = isDark ? "hsla(38,33%,96%,0.12)" : "hsla(20,20%,12%,0.1)";

  const alignClass =
    style.alignment === "left" ? "text-left" : style.alignment === "right" ? "text-right" : "text-center";

  const fontWeight = style.bold ? "font-bold" : "font-normal";
  const fontStyle = style.italic ? "italic" : "not-italic";

  // Auto text size
  const len = text.length;
  const fontSize = len > 200 ? "text-lg" : len > 120 ? "text-xl" : len > 60 ? "text-2xl" : "text-3xl";

  return (
    <div
      className="flex-1 mx-5 mb-4 rounded-sm overflow-hidden relative"
      style={{ background: style.background }}
      onClick={onTap}
    >
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div
          className={`rounded-sm p-8 mx-2 max-w-sm w-full ${alignClass} ${frameClass[style.frame]}`}
          style={{
            backgroundColor: isDark ? "hsla(20,18%,14%,0.3)" : "hsla(38,33%,96%,0.3)",
            backdropFilter: "blur(8px)",
            borderColor,
          }}
        >
          {/* Quote mark */}
          <p className="leading-none mb-3" style={{ fontFamily: style.font, fontSize: "3rem", color: mutedColor }}>
            ❝
          </p>

          {/* Text */}
          {editable ? (
            <textarea
              value={text}
              onChange={(e) => onTextChange?.(e.target.value)}
              placeholder="Start typing..."
              maxLength={280}
              className={`w-full bg-transparent resize-none outline-none leading-snug mb-6 placeholder:opacity-30 ${fontSize} ${fontWeight} ${fontStyle}`}
              style={{ fontFamily: style.font, color: textColor }}
              rows={3}
              autoFocus
            />
          ) : (
            <p
              className={`leading-snug mb-6 ${fontSize} ${fontWeight} ${fontStyle}`}
              style={{ fontFamily: style.font, color: textColor }}
            >
              {text || "Start typing..."}
            </p>
          )}

          {/* Divider */}
          <div className="w-12 h-px mb-4" style={{ backgroundColor: borderColor, marginLeft: style.alignment === "center" ? "auto" : style.alignment === "right" ? "auto" : 0, marginRight: style.alignment === "center" ? "auto" : style.alignment === "left" ? "auto" : 0 }} />

          {/* Author */}
          {authorName && (
            <div
              className={`flex items-center gap-3 ${
                style.alignment === "center" ? "justify-center" : style.alignment === "right" ? "justify-end" : ""
              }`}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium"
                style={{ backgroundColor: mutedColor, color: textColor }}
              >
                {authorName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm" style={{ fontFamily: style.font, color: textColor, opacity: 0.7 }}>
                {authorName}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
