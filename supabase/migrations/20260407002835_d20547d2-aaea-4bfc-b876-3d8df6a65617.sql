
-- Admin can insert any club
CREATE POLICY "Admins can create any club"
ON public.clubs FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin can update any club
CREATE POLICY "Admins can update any club"
ON public.clubs FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can delete any club
CREATE POLICY "Admins can delete any club"
ON public.clubs FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can manage club members
CREATE POLICY "Admins can add club members"
ON public.club_members FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can remove club members"
ON public.club_members FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update club members"
ON public.club_members FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Reading history table
CREATE TABLE public.reading_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id)
);

ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reading history"
ON public.reading_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading history"
ON public.reading_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading history"
ON public.reading_history FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading history"
ON public.reading_history FOR DELETE USING (auth.uid() = user_id);

-- Content covers storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('content-covers', 'content-covers', true);

CREATE POLICY "Content cover images are publicly accessible"
ON storage.objects FOR SELECT USING (bucket_id = 'content-covers');

CREATE POLICY "Authenticated users can upload content covers"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'content-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own content covers"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'content-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own content covers"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'content-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
