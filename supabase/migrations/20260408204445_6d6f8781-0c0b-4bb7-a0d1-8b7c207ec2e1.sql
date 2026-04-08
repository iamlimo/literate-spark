
-- 1. Create is_suspended helper function
CREATE OR REPLACE FUNCTION public.is_suspended(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_suspended FROM public.profiles WHERE user_id = _user_id),
    false
  );
$$;

-- 2. Suspension checks on contents
DROP POLICY IF EXISTS "Users can create their own content" ON public.contents;
CREATE POLICY "Users can create their own content" ON public.contents
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id AND NOT public.is_suspended(auth.uid()));

DROP POLICY IF EXISTS "Users can update their own content" ON public.contents;
CREATE POLICY "Users can update their own content" ON public.contents
  FOR UPDATE TO authenticated
  USING (auth.uid() = author_id AND NOT public.is_suspended(auth.uid()));

-- 3. Suspension checks on comments
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
CREATE POLICY "Users can create comments" ON public.comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND NOT public.is_suspended(auth.uid()));

-- 4. Suspension checks on likes
DROP POLICY IF EXISTS "Users can like" ON public.likes;
CREATE POLICY "Users can like" ON public.likes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND NOT public.is_suspended(auth.uid()));

-- 5. Suspension checks on saves
DROP POLICY IF EXISTS "Users can save" ON public.saves;
CREATE POLICY "Users can save" ON public.saves
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND NOT public.is_suspended(auth.uid()));

-- 6. Suspension checks on follows
DROP POLICY IF EXISTS "Users can follow" ON public.follows;
CREATE POLICY "Users can follow" ON public.follows
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id AND NOT public.is_suspended(auth.uid()));

-- 7. Suspension checks on clubs
DROP POLICY IF EXISTS "Authenticated users can create clubs" ON public.clubs;
CREATE POLICY "Authenticated users can create clubs" ON public.clubs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by AND NOT public.is_suspended(auth.uid()));

-- 8. Suspension checks on club_members
DROP POLICY IF EXISTS "Users can join clubs" ON public.club_members;
CREATE POLICY "Users can join clubs" ON public.club_members
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND NOT public.is_suspended(auth.uid()));

-- 9. Suspension checks on bookstore_listings
DROP POLICY IF EXISTS "Users can create their own listings" ON public.bookstore_listings;
CREATE POLICY "Users can create their own listings" ON public.bookstore_listings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = seller_id AND NOT public.is_suspended(auth.uid()));

-- 10. Fix purchases: remove public INSERT, create secure RPC
DROP POLICY IF EXISTS "Users can make purchases" ON public.purchases;

CREATE OR REPLACE FUNCTION public.create_purchase(_listing_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _listing bookstore_listings%ROWTYPE;
  _purchase_id uuid;
BEGIN
  IF public.is_suspended(auth.uid()) THEN
    RAISE EXCEPTION 'Account is suspended';
  END IF;

  SELECT * INTO _listing FROM bookstore_listings
    WHERE id = _listing_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found or inactive';
  END IF;

  -- Check for duplicate purchase
  IF EXISTS (SELECT 1 FROM purchases WHERE buyer_id = auth.uid() AND listing_id = _listing_id) THEN
    RAISE EXCEPTION 'Already purchased';
  END IF;

  INSERT INTO purchases (buyer_id, listing_id, amount_cents, expires_at)
  VALUES (
    auth.uid(),
    _listing_id,
    _listing.price_cents,
    CASE WHEN _listing.listing_type = 'rent' AND _listing.rental_days IS NOT NULL
      THEN now() + (_listing.rental_days || ' days')::interval
      ELSE NULL
    END
  )
  RETURNING id INTO _purchase_id;

  RETURN _purchase_id;
END;
$$;

-- 11. Fix club_members SELECT for private clubs
DROP POLICY IF EXISTS "Club members are viewable by everyone" ON public.club_members;
CREATE POLICY "Club members visibility" ON public.club_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clubs
      WHERE clubs.id = club_members.club_id
      AND (
        NOT COALESCE(clubs.is_private, false)
        OR clubs.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.club_members cm2
          WHERE cm2.club_id = club_members.club_id
          AND cm2.user_id = auth.uid()
        )
      )
    )
  );

-- 12. Fix saves SELECT to owner-only
DROP POLICY IF EXISTS "Saves are viewable by everyone" ON public.saves;
CREATE POLICY "Users can view their own saves" ON public.saves
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 13. Extra safety: ensure no non-admin can insert roles
-- The existing policy already requires admin, but add explicit deny for safety
-- by ensuring the policy targets only authenticated and requires admin
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
