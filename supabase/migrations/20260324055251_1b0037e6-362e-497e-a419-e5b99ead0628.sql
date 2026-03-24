
-- Saves table for bookmarking content
CREATE TABLE public.saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_id uuid NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_id)
);

ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Saves are viewable by everyone" ON public.saves FOR SELECT TO public USING (true);
CREATE POLICY "Users can save" ON public.saves FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave" ON public.saves FOR DELETE TO public USING (auth.uid() = user_id);

-- Follows table for following users
CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT TO public USING (true);
CREATE POLICY "Users can follow" ON public.follows FOR INSERT TO public WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE TO public USING (auth.uid() = follower_id);

-- Enable realtime for feed updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.saves;
ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
