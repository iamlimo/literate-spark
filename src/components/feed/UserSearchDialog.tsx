import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  user_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
}

interface UserSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserSearchDialog({ open, onOpenChange }: UserSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);
      const term = `%${query.trim()}%`;
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, avatar_url")
        .or(`display_name.ilike.${term},username.ilike.${term}`)
        .limit(10);
      setResults((data as SearchResult[]) || []);
      setSearching(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (userId: string) => {
    onOpenChange(false);
    setQuery("");
    navigate(`/profile/${userId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-md">
        <DialogTitle className="sr-only">Search users</DialogTitle>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name or username…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {query.trim() && !searching && results.length === 0 && (
              <CommandEmpty>No users found.</CommandEmpty>
            )}
            {results.map((user) => {
              const initials = user.display_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <CommandItem
                  key={user.user_id}
                  value={user.user_id}
                  onSelect={() => handleSelect(user.user_id)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="bg-secondary text-xs font-display font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{user.display_name}</p>
                    {user.username && (
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
