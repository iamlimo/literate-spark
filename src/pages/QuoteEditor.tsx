import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuoteEditor } from "@/hooks/useQuoteEditor";
import { useAuth } from "@/contexts/AuthContext";
import QuoteCanvas from "@/components/quote/QuoteCanvas";
import QuoteToolbar from "@/components/quote/QuoteToolbar";
import { useEffect } from "react";

export default function QuoteEditor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const editor = useQuoteEditor();

  // Set author name from profile
  useEffect(() => {
    if (user?.user_metadata?.full_name && !editor.authorName) {
      editor.setAuthorName(user.user_metadata.full_name);
    } else if (user?.email && !editor.authorName) {
      editor.setAuthorName(user.email.split("@")[0]);
    }
  }, [user]);

  const canPublish = editor.text.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-foreground active:scale-95 transition-transform">
            <X className="w-5 h-5" />
          </button>
          <div>
            <p className="font-display font-bold text-sm">Digital Atelier</p>
            <p className="label-uppercase text-[9px] text-muted-foreground">Composition</p>
          </div>
        </div>
        <button
          disabled={!canPublish}
          onClick={() => navigate("/create/publish")}
          className="bg-primary text-primary-foreground px-5 py-2 rounded-full label-uppercase text-xs active:scale-[0.97] transition-transform disabled:opacity-40"
        >
          Publish
        </button>
      </header>

      {/* Canvas */}
      <QuoteCanvas
        text={editor.text}
        authorName={editor.authorName}
        style={editor.style}
        isDark={editor.isDark}
        editable
        onTextChange={editor.setText}
      />

      {/* Toolbar */}
      <QuoteToolbar
        activePanel={editor.activePanel}
        setActivePanel={editor.setActivePanel}
        style={editor.style}
        updateStyle={editor.updateStyle}
        charCount={editor.charCount}
      />
    </div>
  );
}
