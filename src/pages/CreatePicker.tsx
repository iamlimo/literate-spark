import { ArrowLeft, Quote, FileText, BookOpen, Layers, Feather } from "lucide-react";
import { useNavigate } from "react-router-dom";

const contentTypes = [
  {
    key: "quote",
    icon: Quote,
    title: "Quote",
    description: "A short-form visual fragment",
    path: "/create/quote",
  },
  {
    key: "article",
    icon: FileText,
    title: "Article",
    description: "Share your thoughts and ideas",
    path: "/create/article",
  },
  {
    key: "short_story",
    icon: Feather,
    title: "Story",
    description: "A short story or narrative",
    path: "/create/short_story",
  },
  {
    key: "novel",
    icon: Layers,
    title: "Book",
    description: "A multi-chapter work",
    path: "/create/novel",
  },
  {
    key: "poem",
    icon: BookOpen,
    title: "Poem",
    description: "Express through verse",
    path: "/create/poem",
  },
];

export default function CreatePicker() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-5 py-4 sticky top-0 z-40 bg-background/95 backdrop-blur-sm max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-display font-bold text-sm">Create</span>
      </header>

      <div className="max-w-2xl mx-auto px-5 pb-12">
        <h1 className="font-display text-2xl font-bold mb-1">What will you create?</h1>
        <p className="text-sm text-muted-foreground mb-8">Choose a format to begin your work.</p>

        <div className="grid gap-3 sm:grid-cols-2">
          {contentTypes.map(({ key, icon: Icon, title, description, path }) => (
            <button
              key={key}
              onClick={() => navigate(path)}
              className="flex items-start gap-4 bg-card border border-border rounded-sm p-5 text-left hover:border-accent/40 active:scale-[0.98] transition-all min-h-[80px] group"
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base mb-0.5">{title}</h3>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
