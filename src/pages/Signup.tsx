import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import libraryImg from "@/assets/library-interior.jpg";

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "taken" | "available">("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const checkUsername = async (value: string) => {
    const clean = value.replace(/[^a-z0-9_]/gi, "").toLowerCase();
    setUsername(clean);
    if (clean.length < 3) { setUsernameStatus("idle"); return; }
    setUsernameStatus("checking");
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", clean)
      .maybeSingle();
    setUsernameStatus(data ? "taken" : "available");
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-destructive", "bg-accent", "bg-green-600"][strength];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) {
      toast({ title: "Username too short", description: "At least 3 characters.", variant: "destructive" });
      return;
    }
    if (usernameStatus === "taken") {
      toast({ title: "Username taken", description: "Choose a different username.", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, username },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setLoading(false);
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      return;
    }
    // Update the profile with the chosen username
    if (signUpData.user) {
      await supabase.from("profiles").update({ username }).eq("user_id", signUpData.user.id);
    }
    setLoading(false);
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop decorative panel */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src={libraryImg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/80" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="font-display italic text-3xl text-primary-foreground/90 leading-tight drop-shadow-lg">
            "The beginning of wisdom is<br />the definition of terms."
          </p>
          <p className="mt-3 text-sm text-primary-foreground/70">— Socrates</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col px-6 pt-10 pb-8 lg:justify-center lg:px-16 xl:px-24">
        <div className="max-w-md mx-auto w-full animate-fade-up">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5" />
            <span className="font-display italic text-base">Oeuvre</span>
          </div>

          <h1 className="font-display text-3xl font-bold mt-2 mb-1">
            Create Your Archive
          </h1>
          <p className="font-display italic text-muted-foreground mb-8">
            Join a sanctuary for deep thought.
          </p>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="label-uppercase text-xs block mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g. Julian Barnes"
                required
                className="w-full bg-transparent border-b border-border py-3 text-base focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50 font-body"
              />
            </div>

            <div>
              <label className="label-uppercase text-xs block mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => checkUsername(e.target.value)}
                placeholder="julian_barnes"
                required
                maxLength={30}
                className="w-full bg-transparent border-b border-border py-3 text-base focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50 font-body"
              />
              {username.length >= 3 && (
                <p className={`text-[11px] mt-1.5 ${usernameStatus === "available" ? "text-green-600" : usernameStatus === "taken" ? "text-destructive" : "text-muted-foreground"}`}>
                  {usernameStatus === "checking" && "Checking…"}
                  {usernameStatus === "available" && "✓ Available"}
                  {usernameStatus === "taken" && "✗ Already taken"}
                </p>
              )}
            </div>

            <div>
              <label className="label-uppercase text-xs block mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="archivist@atelier.com"
                required
                className="w-full bg-transparent border-b border-border py-3 text-base focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50 font-body"
              />
            </div>

            <div>
              <label className="label-uppercase text-xs block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {password.length > 0 && (
                <div className="flex items-center justify-between mt-2">
                  <span className="label-uppercase text-[10px] text-muted-foreground">At least 8 characters</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`label-uppercase text-[10px] ${strength >= 3 ? "text-green-600" : "text-accent"}`}>
                      {strengthLabel}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`w-5 h-1.5 rounded-full ${i <= strength ? strengthColor : "bg-border"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-sm label-uppercase text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50 min-h-[48px]"
            >
              {loading ? "Creating…" : <>Begin Your Journey <span>→</span></>}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-border" />
            <span className="label-uppercase text-[10px] text-muted-foreground">Continue With</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-4 border border-border rounded-sm label-uppercase text-xs hover:bg-secondary transition-colors active:scale-[0.97] min-h-[48px]">
              <span className="w-5 h-5 bg-muted rounded-sm flex items-center justify-center text-[10px] font-bold">G</span>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-4 border border-border rounded-sm label-uppercase text-xs hover:bg-secondary transition-colors active:scale-[0.97] min-h-[48px]">
              <span className="text-sm font-bold">iOS</span>
              Apple
            </button>
          </div>

          <p className="text-center mt-10 text-sm">
            <span className="text-muted-foreground font-display italic">Already an Archivist?</span>{" "}
            <Link to="/login" className="text-accent font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
