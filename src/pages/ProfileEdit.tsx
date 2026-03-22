import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    username: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, username, bio, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            display_name: data.display_name || "",
            username: data.username || "",
            bio: data.bio || "",
            avatar_url: data.avatar_url || "",
          });
        }
      });
  }, [user]);

  const handleSave = async () => {
    if (!user || !form.display_name.trim()) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: form.display_name.trim(),
        username: form.username.trim() || null,
        bio: form.bio.trim() || null,
        avatar_url: form.avatar_url.trim() || null,
      })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated" });
      navigate("/profile");
    }
  };

  const initials = form.display_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-5 py-4 sticky top-0 z-40 bg-background/95 backdrop-blur-sm">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-display text-base font-semibold">Edit Profile</span>
        <button
          onClick={handleSave}
          disabled={saving || !form.display_name.trim()}
          className="label-uppercase text-[11px] text-accent disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </header>

      <div className="px-5 py-6 space-y-6 animate-fade-up">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <Avatar className="w-20 h-20 ring-2 ring-border">
              <AvatarImage src={form.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary text-xl font-display font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="label-uppercase text-[10px]">Display Name</Label>
            <Input
              value={form.display_name}
              onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
              className="mt-1.5"
              maxLength={50}
            />
          </div>

          <div>
            <Label className="label-uppercase text-[10px]">Username</Label>
            <Input
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.replace(/[^a-z0-9_]/gi, "").toLowerCase() }))}
              className="mt-1.5"
              placeholder="your_username"
              maxLength={30}
            />
          </div>

          <div>
            <Label className="label-uppercase text-[10px]">Bio</Label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              className="mt-1.5 resize-none"
              rows={4}
              maxLength={280}
              placeholder="Tell readers about yourself…"
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right tabular-nums">
              {form.bio.length}/280
            </p>
          </div>

          <div>
            <Label className="label-uppercase text-[10px]">Avatar URL</Label>
            <Input
              value={form.avatar_url}
              onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))}
              className="mt-1.5"
              placeholder="https://…"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
