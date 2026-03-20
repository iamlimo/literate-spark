import { useState } from "react";
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, BookOpen } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import heroImg from "@/assets/hero-manuscripts.jpg";

const filters = ["For You", "Trending", "Novels"];

const feedItems = [
  {
    type: "featured",
    badge: "Editor's Choice",
    category: "Digital Philosophy",
    author: "Ade Ayanwale",
    date: "Jul 14, 2024",
    readTime: "8 min",
    title: "The Ontology of Digital Presence: Between Vellum and Pixel",
    excerpt: "Exploring the tactile memory of physical manuscripts in the age of algorithmic curation. How do we preserve the scent of thought in a paperless atelier?",
    likes: 174,
    comments: 29,
    image: true,
  },
  {
    type: "short-story",
    category: "Short Story",
    author: "Juliet Fakemi",
    date: "Jun 18, 2024",
    title: "The Last Archivist",
    excerpt: '"In a city where memories were deleted every decade, he was the only one who kept a key to the cellar of forgotten truths..."',
    likes: 89,
    comments: 12,
    image: false,
  },
  {
    type: "novel-chapter",
    category: "Crafting Novel",
    author: "M. Sato",
    title: "Neon Embers: Chapter 04",
    views: 3400,
    image: false,
  },
  {
    type: "trending",
    badge: "Trending Novel",
    title: "A Silence in the Orchard",
    excerpt: "A sweeping epic about a family of vineyard owners in post-war Italy, and the secret they buried beneath the oldest vines.",
    author: "Elena Ferranti",
    authorTag: "Historical Fiction",
    image: false,
  },
  {
    type: "poem",
    category: "Poem",
    title: "The Weight of Ink",
    excerpt: '"It was not the words that felt heavy, but the silence they failed to break."',
    author: "Daniela Ngurel",
    image: false,
  },
  {
    type: "article",
    category: "De Vogue",
    title: "Modernism's Ghost",
    excerpt: "A deep dive into why we still argue the aesthetics of the 1920s in 2024.",
    author: "Liz Mure",
    image: false,
  },
];

export default function Feed() {
  const [activeFilter, setActiveFilter] = useState("For You");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 sticky top-0 z-40 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          <span className="font-display text-lg font-semibold">Atelier</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <span className="text-xs font-medium">C</span>
        </div>
      </header>

      {/* Filter pills */}
      <div className="flex gap-2 px-5 mb-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-full label-uppercase text-[10px] transition-colors active:scale-[0.96] ${
              activeFilter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="px-5 space-y-6">
        {/* Featured Article */}
        <article className="animate-fade-up">
          <div className="bg-card rounded-sm overflow-hidden mb-3">
            <div className="relative">
              <span className="absolute top-3 left-3 bg-accent text-accent-foreground label-uppercase text-[9px] px-2.5 py-1 rounded-sm">
                Editor's Choice
              </span>
              <img src={heroImg} alt="Ancient manuscripts" className="w-full h-48 object-cover" />
            </div>
          </div>
          <p className="label-uppercase text-[10px] text-muted-foreground mb-2">
            Digital Philosophy • Ade Ayanwale • 8 min
          </p>
          <h2 className="font-display text-2xl font-bold leading-tight mb-3">
            The Ontology of Digital Presence: Between Vellum and Pixel
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 text-pretty">
            Exploring the tactile memory of physical manuscripts in the age of algorithmic curation. How do we preserve the scent of thought in a paperless atelier?
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <Heart className="w-4 h-4" /> <span className="text-xs">174</span>
              </button>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <MessageSquare className="w-4 h-4" /> <span className="text-xs">29</span>
              </button>
            </div>
            <span className="label-uppercase text-xs text-accent">Read Manuscript →</span>
          </div>
        </article>

        <div className="h-px bg-border" />

        {/* Short Story */}
        <article className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <p className="label-uppercase text-[10px] text-muted-foreground mb-2">
            Short Story • Juliet Fakemi
          </p>
          <h3 className="font-display text-xl font-bold mb-2">The Last Archivist</h3>
          <p className="text-sm text-muted-foreground italic leading-relaxed mb-4">
            "In a city where memories were deleted every decade, he was the only one who kept a key to the cellar of forgotten truths..."
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="text-muted-foreground"><Share2 className="w-4 h-4" /></button>
              <button className="text-muted-foreground"><Bookmark className="w-4 h-4" /></button>
            </div>
            <span className="label-uppercase text-[10px] bg-secondary px-3 py-1.5 rounded-sm">Next Stage →</span>
          </div>
        </article>

        <div className="h-px bg-border" />

        {/* Trending Novel */}
        <article className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <p className="label-uppercase text-[10px] text-accent mb-2">Trending Novel</p>
          <h3 className="font-display text-2xl font-bold leading-tight mb-3">
            A Silence in the Orchard
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            A sweeping epic about a family of vineyard owners in post-war Italy, and the secret they buried beneath the oldest vines.
          </p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-medium">EF</span>
            </div>
            <div>
              <p className="text-sm font-medium">Elena Ferranti</p>
              <p className="label-uppercase text-[9px] text-muted-foreground">Historical Fiction</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-primary text-primary-foreground label-uppercase text-[10px] px-4 py-2.5 rounded-sm active:scale-[0.97] transition-transform">
              Add to Library
            </button>
            <button className="text-muted-foreground p-2"><Bookmark className="w-4 h-4" /></button>
            <button className="text-muted-foreground p-2"><Share2 className="w-4 h-4" /></button>
          </div>
        </article>

        <div className="h-px bg-border" />

        {/* Poem */}
        <article className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <p className="label-uppercase text-[10px] text-muted-foreground mb-1">Poem</p>
          <h3 className="font-display text-lg font-bold mb-2">The Weight of Ink</h3>
          <p className="text-sm text-muted-foreground italic mb-3">
            "It was not the words that felt heavy, but the silence they failed to break."
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Daniela Ngurel</span>
            <button className="text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></button>
          </div>
        </article>

        <div className="h-px bg-border" />

        {/* Article */}
        <article className="animate-fade-up" style={{ animationDelay: "0.35s" }}>
          <p className="label-uppercase text-[10px] text-muted-foreground mb-1">De Vogue</p>
          <h3 className="font-display text-lg font-bold mb-2">Modernism's Ghost</h3>
          <p className="text-sm text-muted-foreground mb-3">
            A deep dive into why we still argue the aesthetics of the 1920s in 2024.
          </p>
          <span className="text-xs text-muted-foreground">Liz Mure</span>
        </article>

        <div className="h-px bg-border" />

        {/* Top Recommendation */}
        <article className="bg-card p-5 rounded-sm animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <p className="label-uppercase text-[10px] text-accent mb-2">Top Recommendation</p>
          <h3 className="font-display text-xl font-bold mb-2">The Architecture of Absence</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Recommended based on your interest in...
          </p>
          <span className="label-uppercase text-xs text-accent">Read Now →</span>
        </article>
      </div>

      <BottomNav />
    </div>
  );
}
