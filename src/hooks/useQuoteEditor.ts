import { useState, useEffect, useCallback } from "react";

export interface QuoteStyle {
  background: string;
  font: string;
  alignment: "left" | "center" | "right";
  frame: "none" | "thin" | "ornate";
  bold: boolean;
  italic: boolean;
}

export type ToolbarPanel = "canvas" | "style" | "fonts" | "frame";

const DEFAULT_STYLE: QuoteStyle = {
  background: "linear-gradient(135deg, hsl(38 33% 96%), hsl(36 25% 90%))",
  font: "'Playfair Display', Georgia, serif",
  alignment: "center",
  frame: "thin",
  bold: false,
  italic: true,
};

const STORAGE_KEY = "quote-draft";

function loadDraft(): { text: string; authorName: string; style: QuoteStyle } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const BACKGROUNDS = [
  "linear-gradient(135deg, hsl(38 33% 96%), hsl(36 25% 90%))",
  "linear-gradient(135deg, hsl(20 18% 14%), hsl(20 20% 22%))",
  "linear-gradient(135deg, hsl(30 30% 92%), hsl(25 20% 85%))",
  "linear-gradient(135deg, hsl(15 70% 45%), hsl(10 60% 35%))",
  "linear-gradient(135deg, hsl(210 15% 92%), hsl(220 12% 86%))",
  "linear-gradient(135deg, hsl(45 40% 92%), hsl(40 35% 82%))",
  "hsl(38 33% 96%)",
  "hsl(20 18% 14%)",
  "hsl(36 25% 94%)",
  "hsl(30 15% 88%)",
];

export const FONTS = [
  { label: "Playfair", value: "'Playfair Display', Georgia, serif" },
  { label: "DM Sans", value: "'DM Sans', system-ui, sans-serif" },
  { label: "Lora", value: "'Lora', Georgia, serif" },
  { label: "Merriweather", value: "'Merriweather', Georgia, serif" },
  { label: "Cormorant", value: "'Cormorant Garamond', Georgia, serif" },
  { label: "Space Mono", value: "'Space Mono', monospace" },
];

export function useQuoteEditor() {
  const draft = loadDraft();
  const [text, setText] = useState(draft?.text ?? "");
  const [authorName, setAuthorName] = useState(draft?.authorName ?? "");
  const [style, setStyle] = useState<QuoteStyle>(draft?.style ?? DEFAULT_STYLE);
  const [activePanel, setActivePanel] = useState<ToolbarPanel>("style");

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ text, authorName, style }));
    }, 400);
    return () => clearTimeout(timer);
  }, [text, authorName, style]);

  const handleTextChange = useCallback((val: string) => {
    if (val.length <= 280) setText(val);
  }, []);

  const updateStyle = useCallback((patch: Partial<QuoteStyle>) => {
    setStyle((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setText("");
    setAuthorName("");
    setStyle(DEFAULT_STYLE);
  }, []);

  const isDark = style.background.includes("hsl(20 18% 14%)");

  return {
    text,
    setText: handleTextChange,
    authorName,
    setAuthorName,
    style,
    updateStyle,
    activePanel,
    setActivePanel,
    clearDraft,
    isDark,
    charCount: text.length,
  };
}
