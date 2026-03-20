import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-destructive", "bg-accent", "bg-green-600"][strength];

  return (
    <div className="min-h-screen flex flex-col bg-background px-6 pt-10 pb-8">
      <div className="flex-1 max-w-md mx-auto w-full animate-fade-up">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5" />
          <span className="font-display italic text-base">The Digital Atelier</span>
        </div>

        <h1 className="font-display text-3xl font-bold mt-2 mb-1">
          Create Your Archive
        </h1>
        <p className="font-display italic text-muted-foreground mb-8">
          Join a sanctuary for deep thought.
        </p>

        <form
          onSubmit={(e) => { e.preventDefault(); navigate("/onboarding"); }}
          className="space-y-6"
        >
          <div>
            <label className="label-uppercase text-xs block mb-2">Your Name</label>
            <input
              type="text"
              placeholder="E.g. Julian Barnes"
              className="w-full bg-transparent border-b border-border py-3 text-base focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50 font-body"
            />
          </div>

          <div>
            <label className="label-uppercase text-xs block mb-2">Email Address</label>
            <input
              type="email"
              placeholder="archivist@atelier.com"
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
                className="w-full bg-transparent border-b border-border py-3 text-base focus:outline-none focus:border-foreground transition-colors pr-10 font-body"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground p-1"
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
            className="w-full bg-primary text-primary-foreground py-4 rounded-sm label-uppercase text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            Begin Your Journey <span>→</span>
          </button>
        </form>

        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-border" />
          <span className="label-uppercase text-[10px] text-muted-foreground">Continue With</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 py-4 border border-border rounded-sm label-uppercase text-xs hover:bg-secondary transition-colors active:scale-[0.97]">
            <span className="w-5 h-5 bg-muted rounded-sm flex items-center justify-center text-[10px] font-bold">G</span>
            Google
          </button>
          <button className="flex items-center justify-center gap-2 py-4 border border-border rounded-sm label-uppercase text-xs hover:bg-secondary transition-colors active:scale-[0.97]">
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
  );
}
