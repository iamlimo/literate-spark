
-- Fix: prevent users from self-joining private clubs
DROP POLICY IF EXISTS "Users can join clubs" ON public.club_members;

CREATE POLICY "Users can join public clubs"
ON public.club_members FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND NOT is_suspended(auth.uid())
  AND EXISTS (
    SELECT 1 FROM clubs
    WHERE clubs.id = club_members.club_id
    AND NOT COALESCE(clubs.is_private, false)
  )
);
