import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import libraryImg from "@/assets/library-interior.jpg";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let loginEmail = identifier;
    // If it's not an email, treat as username and look up the email
    if (!identifier.includes("@")) {
      const { data, error: fnError } = await supabase.rpc("get_email_by_username", { _username: identifier });
      if (fnError || !data) {
        setLoading(false);
        toast({ title: "Login failed", description: "Username not found.", variant: "destructive" });
        return;
      }
      loginEmail = data;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/feed");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop decorative panel */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src={libraryImg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/80" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="font-display italic text-3xl text-primary-foreground/90 leading-tight drop-shadow-lg">
            "A room without books is like<br />a body without a soul."
          </p>
          <p className="mt-3 text-sm text-primary-foreground/70">— Marcus Tullius Cicero</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col px-6 pt-16 pb-8 lg:justify-center lg:px-16 xl:px-24">
        <div className="max-w-md mx-auto w-full animate-fade-up">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="font-display italic text-lg">Oeuvre</span>
          </div>

          <h1 className="font-display text-4xl font-bold text-center mt-4 mb-2">
            Welcome Back
          </h1>
          <p className="font-display italic text-muted-foreground text-center mb-10">
            Enter your sanctuary.
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="label-uppercase text-xs block mb-2">Email or Username</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="archivist@atelier.com or julian_barnes"
                required
                className="w-full bg-transparent border-b border-border py-3 text-base focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50 font-body"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label-uppercase text-xs">Password</label>
                <button type="button" className="label-uppercase text-xs text-accent hover:underline">
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent border-b border-border py-3 text-base focus:outline-none focus:border-foreground transition-colors pr-10 font-body"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-sm label-uppercase text-sm mt-4 hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50 min-h-[48px]"
            >
              {loading ? "Entering…" : "Enter The Atelier"}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-border" />
            <span className="label-uppercase text-[10px] text-muted-foreground">Or Authenticate Via</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-4 border border-border rounded-sm label-uppercase text-xs hover:bg-secondary transition-colors active:scale-[0.97] min-h-[48px]">
              <span className="w-5 h-5 bg-muted rounded-sm flex items-center justify-center text-[10px] font-bold">G</span>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-4 border border-border rounded-sm label-uppercase text-xs hover:bg-secondary transition-colors active:scale-[0.97] min-h-[48px]">
              <span className="w-5 h-5 bg-muted rounded-sm flex items-center justify-center text-[10px] font-bold">⌘</span>
              Github
            </button>
          </div>

          <p className="text-center mt-10 text-sm">
            <span className="text-muted-foreground font-display italic">New here?</span>{" "}
            <Link to="/signup" className="text-accent font-medium label-uppercase text-xs hover:underline">
              Create An Archive
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
