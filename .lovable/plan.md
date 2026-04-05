

## Super Admin — Full Control Implementation

### Overview
Add a super admin system with content moderation, user management, analytics dashboard, and role management. Uses the existing `app_role` enum (`admin`) and `user_roles` table with `has_role()` security definer function.

### Architecture

```text
/admin (protected by admin role check)
├── Dashboard tab — platform stats (users, content, engagement)
├── Users tab — list/search users, suspend/unsuspend, assign roles
├── Content tab — view all content, approve/reject/delete
└── Settings tab — manage roles, platform config
```

### Changes

#### 1. Database migration
- Add `is_suspended` boolean column to `profiles` (default false)
- Add RLS policy on `profiles` allowing admins to update any profile (using `has_role()`)
- Add RLS policy on `contents` allowing admins to update/delete any content
- Add RLS policy on `user_roles` allowing admins to insert/delete roles

#### 2. Create admin page (`src/pages/Admin.tsx`)
- Tabbed layout: Dashboard, Users, Content, Settings
- **Dashboard tab**: aggregate queries — total users, total content by status, total likes/saves/follows, recent signups
- **Users tab**: paginated user list with search, each row shows avatar, name, username, persona, role badges, join date. Actions: toggle suspend, assign/remove admin role
- **Content tab**: filterable list of all content (any status). Actions: publish, reject, delete. Status badges and author info shown
- **Settings tab**: role management overview, platform stats summary

#### 3. Create admin route guard (`src/components/AdminRoute.tsx`)
- Wraps children, checks `user_roles` for `admin` role using Supabase query
- Shows "Access denied" if not admin
- Loading state while checking

#### 4. Add route in `App.tsx`
- `/admin` → `<AdminRoute><Admin /></AdminRoute>`

#### 5. Add admin link in Dashboard quick actions
- Show "Admin Panel" link only when user has admin role (check via query on mount)

### Files created
- `src/pages/Admin.tsx` — full admin panel with 4 tabs
- `src/components/AdminRoute.tsx` — role-based route guard

### Files modified
- `src/App.tsx` — add `/admin` route
- `src/pages/Dashboard.tsx` — conditionally show admin panel link

### Database migration
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false;

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update any content
CREATE POLICY "Admins can update any content"
ON public.contents FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete any content
CREATE POLICY "Admins can delete any content"
ON public.contents FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

### Security notes
- Admin status checked server-side via `has_role()` security definer function — no client-side spoofing possible
- RLS policies ensure only admins can modify other users' content/roles
- Suspended users' content remains visible but they cannot create new content (enforced in app layer)

