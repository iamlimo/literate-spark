import { Bold, Italic, Heading2, List, ListOrdered, Quote } from "lucide-react";

interface RichTextToolbarProps {
  onAction: (action: string) => void;
}

const actions = [
  { key: "bold", icon: Bold, label: "Bold", wrap: ["**", "**"] },
  { key: "italic", icon: Italic, label: "Italic", wrap: ["*", "*"] },
  { key: "heading", icon: Heading2, label: "Heading", prefix: "## " },
  { key: "ul", icon: List, label: "List", prefix: "- " },
  { key: "ol", icon: ListOrdered, label: "Numbered", prefix: "1. " },
  { key: "blockquote", icon: Quote, label: "Quote", prefix: "> " },
];

export default function RichTextToolbar({ onAction }: RichTextToolbarProps) {
  return (
    <div className="flex items-center gap-1 py-2 px-1 border-b border-border bg-card/50 rounded-t-sm overflow-x-auto">
      {actions.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onAction(key)}
          title={label}
          className="w-8 h-8 flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex-shrink-0"
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}

export function applyMarkdownAction(
  action: string,
  text: string,
  selStart: number,
  selEnd: number
): { text: string; cursorPos: number } {
  const selected = text.slice(selStart, selEnd);
  const actionDef = actions.find(a => a.key === action);
  if (!actionDef) return { text, cursorPos: selEnd };

  if ("wrap" in actionDef && actionDef.wrap) {
    const [before, after] = actionDef.wrap as [string, string];
    const newText = text.slice(0, selStart) + before + selected + after + text.slice(selEnd);
    return { text: newText, cursorPos: selStart + before.length + selected.length };
  }

  if ("prefix" in actionDef && actionDef.prefix) {
    const lineStart = text.lastIndexOf("\n", selStart - 1) + 1;
    const prefix = actionDef.prefix as string;
    const newText = text.slice(0, lineStart) + prefix + text.slice(lineStart);
    return { text: newText, cursorPos: selStart + prefix.length };
  }

  return { text, cursorPos: selEnd };
}
